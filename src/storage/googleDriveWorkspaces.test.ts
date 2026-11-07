import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSavedItem } from "../domain/savedItem";
import { IndexedDbReadingListStore } from "./indexedDbReadingListStore";
import { GoogleDriveWorkspaces, openActiveReadingList } from "./googleDriveWorkspaces";

beforeEach(() => vi.stubGlobal("indexedDB", new IDBFactory()));
afterEach(() => vi.unstubAllGlobals());

const article = (name: string) => createSavedItem({ url: `https://example.com/${name}`, title: name });

describe("separate Google Drive reading lists", () => {
  it("opens the original list without moving its articles or pending operations", async () => {
    const legacy = new IndexedDbReadingListStore();
    const item = article("original");
    await legacy.save(item);
    const pending = await legacy.listPendingSyncOperations();
    const registry = new GoogleDriveWorkspaces();
    expect((await registry.read()).active).toBe("laters");
    expect(await (await openActiveReadingList()).listNewestFirst()).toEqual([item]);
    expect(await legacy.listPendingSyncOperations()).toEqual(pending);
  });

  it("opens every new account separately and never adopts the old local list or queue", async () => {
    const registry = new GoogleDriveWorkspaces();
    const original = new IndexedDbReadingListStore();
    const item = article("pending-original");
    await original.save(item);
    const pending = await original.listPendingSyncOperations();
    let state = await registry.account("drive-a", 0);
    const a = state.accounts[0]!.database;
    expect(a).not.toBe(state.local);
    state = await registry.activate(a, state.revision, true);
    expect(await (await openActiveReadingList()).listNewestFirst()).toEqual([]);
    expect(await (await openActiveReadingList()).listPendingSyncOperations()).toEqual([]);
    const aItem = article("only-a");
    await (await openActiveReadingList()).save(aItem);
    const aPending = await (await openActiveReadingList()).listPendingSyncOperations();
    state = await registry.account("drive-b", state.revision);
    state = await registry.activate(state.accounts[1]!.database, state.revision, true);
    expect(await (await openActiveReadingList()).listNewestFirst()).toEqual([]);
    expect(await (await openActiveReadingList()).listPendingSyncOperations()).toEqual([]);
    expect(await original.listNewestFirst()).toEqual([item]);
    expect(await original.listPendingSyncOperations()).toEqual(pending);
    expect(state.local).toBe("laters");
    await registry.activate(a, state.revision, true);
    expect(await (await openActiveReadingList()).listNewestFirst()).toEqual([aItem]);
    expect(await (await openActiveReadingList()).listPendingSyncOperations()).toEqual(aPending);
  });

  it("keeps matching article IDs, bookmarks, edits and deletions in their own account", async () => {
    const registry = new GoogleDriveWorkspaces();
    let state = await registry.account("drive-a");
    state = await registry.account("drive-b", state.revision);
    const a = new IndexedDbReadingListStore(state.accounts[0]!.database);
    const b = new IndexedDbReadingListStore(state.accounts[1]!.database);
    const first = { ...article("a"), id: "same-id" };
    const second = { ...article("b"), id: "same-id" };
    await a.save(first);
    await b.save(second);
    await a.setBookmarked(first.id, true);
    await b.setTitle(second.id, "Only B");
    await a.delete(first.id);
    expect(await a.listNewestFirst()).toEqual([]);
    expect(await b.listNewestFirst()).toEqual([{ ...second, title: "Only B", titleEdited: true }]);
    expect((await a.listPendingSyncOperations()).some((operation) => operation.type === "delete")).toBe(true);
    expect((await b.listPendingSyncOperations()).some((operation) => operation.type === "delete")).toBe(false);
  });

  it("routes a new Android share to the active list while an older capture stays in its original list", async () => {
    const registry = new GoogleDriveWorkspaces();
    let state = await registry.account("drive-a");
    state = await registry.activate(state.accounts[0]!.database, state.revision, true);
    const olderCapture = await openActiveReadingList();
    state = await registry.account("drive-b", state.revision);
    state = await registry.activate(state.accounts[1]!.database, state.revision, true);
    const newCapture = await openActiveReadingList();
    const a = article("older-capture");
    const b = article("new-share");
    await Promise.all([olderCapture.save(a), newCapture.save(b)]);
    expect(await olderCapture.listNewestFirst()).toEqual([a]);
    expect(await newCapture.listNewestFirst()).toEqual([b]);
  });

  it("retains an old local backup independently of the active account", async () => {
    const registry = new GoogleDriveWorkspaces();
    const item = article("local-backup");
    await (await openActiveReadingList()).save(item);
    let state = await registry.account("drive-a");
    state = await registry.activate(state.accounts[0]!.database, state.revision, true);
    await (await openActiveReadingList()).save(article("account-only"));
    expect(await new IndexedDbReadingListStore(state.local).listNewestFirst()).toEqual([item]);
    expect(await (await openActiveReadingList()).listNewestFirst()).toHaveLength(1);
    expect((await (await openActiveReadingList()).listNewestFirst())[0]!.title).toBe("account-only");
  });

  it("retains an account association already created by 1.6.0 without adopting any new list", async () => {
    const registry = new GoogleDriveWorkspaces();
    await registry.read();
    const local = `laters-local-${crypto.randomUUID()}`;
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("laters-workspaces", 1);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction("workspace", "readwrite");
        transaction.objectStore("workspace").put({
          revision: 2, active: "laters", local,
          accounts: [{ key: "previously-linked-account", database: "laters", remembered: true }],
        }, "state");
        transaction.oncomplete = () => { database.close(); resolve(); };
        transaction.onerror = () => { database.close(); reject(transaction.error); };
      };
      request.onerror = () => reject(request.error);
    });
    const item = article("already-linked");
    await new IndexedDbReadingListStore().save(item);
    let state = await registry.account("previously-linked-account");
    expect(state.accounts[0]!.database).toBe("laters");
    state = await registry.account("second-account", state.revision);
    expect(state.accounts[1]!.database).not.toBe("laters");
    expect(await new IndexedDbReadingListStore().listNewestFirst()).toEqual([item]);
  });

  it("persists disconnect without removing articles or queued changes", async () => {
    const registry = new GoogleDriveWorkspaces();
    let state = await registry.account("drive-a");
    state = await registry.activate(state.accounts[0]!.database, state.revision, true);
    const store = await openActiveReadingList();
    const item = article("offline");
    await store.save(item);
    const pending = await store.listPendingSyncOperations();
    await registry.disconnect(state.active);
    const reopened = await new GoogleDriveWorkspaces().read();
    expect(reopened.accounts[0]!.remembered).toBe(false);
    expect(await store.listNewestFirst()).toEqual([item]);
    expect(await store.listPendingSyncOperations()).toEqual(pending);
  });

  it("rejects competing account creation and stale activation without replacing a list", async () => {
    const registry = new GoogleDriveWorkspaces();
    const results = await Promise.allSettled([
      registry.account("drive-a", 0), registry.account("drive-b", 0),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const state = await registry.read();
    expect(state.accounts).toHaveLength(1);
    await expect(registry.activate(state.local, 0)).rejects.toThrow("another window");
    expect((await registry.read()).active).toBe("laters");
  });

  it("does not change the active list when selection is cancelled or preparation fails", async () => {
    const registry = new GoogleDriveWorkspaces();
    const original = await registry.read();
    // A prepared account is not made active until Drive initialisation succeeds.
    const prepared = await registry.account("unreachable-account");
    expect(prepared.active).toBe(original.active);
    expect((await new GoogleDriveWorkspaces().read()).active).toBe(original.active);
    await expect(registry.activate("unrecognised", prepared.revision)).rejects.toThrow("unavailable");
    expect((await registry.read()).active).toBe(original.active);
  });
});
