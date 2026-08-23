import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import { IndexedDbReadingListStore } from "./indexedDbReadingListStore";

const databases: string[] = [];

afterEach(async () => {
  await Promise.all(databases.splice(0).map(deleteDatabase));
});

describe("IndexedDbReadingListStore", () => {
  it("persists items and returns them newest first with a stable tie-breaker", async () => {
    const databaseName = createDatabaseName();
    const store = new IndexedDbReadingListStore(databaseName);

    await store.save(item("older", 100));
    await store.save(item("same-time-a", 200));
    await store.save(item("same-time-b", 200));

    await expect(store.listNewestFirst()).resolves.toEqual([
      item("same-time-b", 200),
      item("same-time-a", 200),
      item("older", 100),
    ]);
  });

  it("persists across store instances", async () => {
    const databaseName = createDatabaseName();
    await new IndexedDbReadingListStore(databaseName).save(item("persistent", 300));

    await expect(new IndexedDbReadingListStore(databaseName).listNewestFirst()).resolves.toEqual([
      item("persistent", 300),
    ]);
  });

  it("deletes an item by identifier", async () => {
    const databaseName = createDatabaseName();
    const store = new IndexedDbReadingListStore(databaseName);
    await store.save(item("keep", 100));
    await store.save(item("remove", 200));

    await store.delete("remove");

    await expect(store.listNewestFirst()).resolves.toEqual([item("keep", 100)]);
  });

  it("atomically replaces the complete reading list", async () => {
    const databaseName = createDatabaseName();
    const store = new IndexedDbReadingListStore(databaseName);
    await store.save(item("remove", 100));

    await store.replaceAll([item("replacement-old", 200), item("replacement-new", 300)]);

    await expect(store.listNewestFirst()).resolves.toEqual([
      item("replacement-new", 300),
      item("replacement-old", 200),
    ]);
  });

  it("rejects invalid replacement data without clearing existing articles", async () => {
    const databaseName = createDatabaseName();
    const store = new IndexedDbReadingListStore(databaseName);
    const existing = item("keep", 100);
    await store.save(existing);

    await expect(
      store.replaceAll([{ ...item("invalid", 200), url: "javascript:alert(1)" }]),
    ).rejects.toThrow("invalid");
    await expect(store.listNewestFirst()).resolves.toEqual([existing]);
  });

  it("updates only bookmark state without changing order or article data", async () => {
    const databaseName = createDatabaseName();
    const store = new IndexedDbReadingListStore(databaseName);
    const original = item("bookmark", 200);
    await store.save(item("newer", 300));
    await store.save(original);

    await expect(store.setBookmarked("bookmark", true)).resolves.toEqual({
      ...original,
      bookmarked: true,
    });
    await expect(store.listNewestFirst()).resolves.toEqual([
      item("newer", 300),
      { ...original, bookmarked: true },
    ]);

    await expect(store.setBookmarked("bookmark", false)).resolves.toEqual({
      ...original,
      bookmarked: false,
    });
  });

  it("does not create a bookmark record for an unknown identifier", async () => {
    const databaseName = createDatabaseName();
    const store = new IndexedDbReadingListStore(databaseName);

    await expect(store.setBookmarked("missing", true)).rejects.toThrow(
      "could not be found",
    );
    await expect(store.listNewestFirst()).resolves.toEqual([]);
  });

  it("updates only the title and marks it as deliberately edited", async () => {
    const databaseName = createDatabaseName();
    const store = new IndexedDbReadingListStore(databaseName);
    const original = { ...item("rename", 200), bookmarked: true };
    await store.save(original);

    await expect(store.setTitle("rename", "  My remembered title  ")).resolves.toEqual({
      ...original,
      title: "My remembered title",
      titleEdited: true,
    });
    await expect(store.listNewestFirst()).resolves.toEqual([
      { ...original, title: "My remembered title", titleEdited: true },
    ]);
  });

  it("rejects an empty edited title without changing the item", async () => {
    const databaseName = createDatabaseName();
    const store = new IndexedDbReadingListStore(databaseName);
    const original = item("rename", 200);
    await store.save(original);

    await expect(store.setTitle("rename", "   ")).rejects.toThrow("Enter a title");
    await expect(store.listNewestFirst()).resolves.toEqual([original]);
  });
});

function item(id: string, savedAt: number): SavedItem {
  return {
    id,
    title: `Article ${id}`,
    url: `https://example.com/${id}`,
    savedAt,
  };
}

function createDatabaseName(): string {
  const name = `laters-test-${crypto.randomUUID()}`;
  databases.push(name);
  return name;
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not delete test database."));
    request.onblocked = () => reject(new Error("Test database deletion was blocked."));
  });
}
