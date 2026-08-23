import { describe, expect, it, vi } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import type { ReadingListSyncOperation } from "./readingListSyncOperation";
import {
  GOOGLE_DRIVE_OPERATION_COMPACTION_THRESHOLD,
  GoogleDriveLiveSyncSession,
} from "./googleDriveLiveSync";

describe("Google Drive live sync", () => {
  it("starts automatic housekeeping at one hundred Drive changes", () => {
    expect(GOOGLE_DRIVE_OPERATION_COMPACTION_THRESHOLD).toBe(100);
  });

  it("uploads a pending operation immutably and clears it after Drive confirms", async () => {
    const operation = addOperation("phone-op", article("phone", 200));
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(checkpointResponse([article("base", 100)]))
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: "created-operation-file" }))
      .mockResolvedValueOnce(
        jsonResponse({
          files: [{ id: "created-operation-file", name: "laters-operation-phone-op.json" }],
        }),
      );
    const store = createStore([operation]);
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      "article-file",
      checkpoint([article("base", 100)]),
    );

    await expect(session.sync(store)).resolves.toMatchObject({
      items: [article("phone", 200), article("base", 100)],
      uploadedCount: 1,
    });
    const upload = request.mock.calls.find((call) => call[1]?.method === "POST");
    expect(String(upload?.[0])).toContain("uploadType=multipart");
    expect(String(upload?.[1]?.body)).toContain("laters-operation-phone-op.json");
    expect(store.removePendingSyncOperations).toHaveBeenCalledWith(["phone-op"]);
    expect(store.replaceAll).toHaveBeenCalledWith([
      article("phone", 200),
      article("base", 100),
    ]);
    expect(
      request.mock.calls.some(
        (call) => call[1]?.method === "PATCH" || call[1]?.method === "DELETE",
      ),
    ).toBe(false);
  });

  it("downloads an unseen delete operation and removes the matching local item", async () => {
    const operation: ReadingListSyncOperation = {
      operationId: "desktop-delete",
      type: "delete",
      occurredAt: 20,
      itemId: "base",
    };
    const files = {
      files: [{ id: "delete-file", name: "laters-operation-desktop-delete.json" }],
    };
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(checkpointResponse([article("base", 100)]))
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(jsonResponse(operation))
      .mockResolvedValueOnce(jsonResponse(files));
    const store = createStore([]);
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      "article-file",
      checkpoint([article("base", 100)]),
    );

    await expect(session.sync(store)).resolves.toMatchObject({ items: [] });
    expect(store.replaceAll).toHaveBeenCalledWith([]);
  });

  it("reuses an existing immutable operation after an uncertain prior upload", async () => {
    const operation = addOperation("existing-op", article("existing", 200));
    const files = {
      files: [{ id: "existing-file", name: "laters-operation-existing-op.json" }],
    };
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(checkpointResponse([]))
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(jsonResponse(operation))
      .mockResolvedValueOnce(jsonResponse(files));
    const store = createStore([operation]);
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      "article-file",
      checkpoint([]),
    );

    await expect(session.sync(store)).resolves.toMatchObject({ uploadedCount: 0 });
    expect(request.mock.calls.some((call) => call[1]?.method === "POST")).toBe(false);
    expect(store.removePendingSyncOperations).toHaveBeenCalledWith(["existing-op"]);
  });

  it("adopts a newer Drive checkpoint before sending local changes", async () => {
    const latestItems = [article("latest", 300)];
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(checkpointResponse(latestItems))
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ files: [] }));
    const store = createStore([]);
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      "article-file",
      checkpoint([article("old", 100)]),
    );

    await expect(session.sync(store)).resolves.toMatchObject({ items: latestItems });
    expect(store.replaceAll).toHaveBeenCalledWith(latestItems);
  });

  it("checkpoints and removes operation files after the housekeeping threshold", async () => {
    const first = addOperation("first-change", article("first", 200));
    const second = addOperation("second-change", article("second", 300));
    const files = {
      files: [
        { id: "first-file", name: "laters-operation-first-change.json" },
        { id: "second-file", name: "laters-operation-second-change.json" },
      ],
    };
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(checkpointResponse([article("base", 100)]))
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(jsonResponse(first))
      .mockResolvedValueOnce(jsonResponse(second))
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        checkpointResponse(
          [article("second", 300), article("first", 200), article("base", 100)],
          ["first-change", "second-change"],
        ),
      )
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(jsonResponse({ files: [] }));
    const store = createStore([]);
    let tick = 0;
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      "article-file",
      checkpoint([article("base", 100)]),
      { compactionThreshold: 2, now: () => new Date(1_000 + tick++) },
    );

    await expect(session.sync(store)).resolves.toMatchObject({ operationCount: 0 });

    expect(request.mock.calls.some((call) => call[1]?.method === "DELETE")).toBe(false);

    await expect(session.sync(store)).resolves.toMatchObject({ operationCount: 0 });

    const patchBodies = request.mock.calls
      .filter((call) => call[1]?.method === "PATCH")
      .map((call) => JSON.parse(String(call[1]?.body)));
    expect(patchBodies[0]).toMatchObject({
      schemaVersion: 2,
      compactedOperationIds: ["first-change", "second-change"],
      items: [article("second", 300), article("first", 200), article("base", 100)],
    });
    expect(patchBodies[1]).toMatchObject({ compactedOperationIds: [] });
    expect(
      request.mock.calls.filter((call) => call[1]?.method === "DELETE"),
    ).toHaveLength(2);
  });

  it("keeps syncing from a checkpoint when Drive cleanup is interrupted", async () => {
    const currentItems = [article("current", 300)];
    const files = {
      files: [{ id: "old-file", name: "laters-operation-old-change.json" }],
    };
    const pendingDuplicate = addOperation("old-change", article("outdated", 100));
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(checkpointResponse(currentItems, ["old-change"]))
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(checkpointResponse(currentItems, ["old-change"]))
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(jsonResponse({ files: [] }));
    const store = createStore([pendingDuplicate]);
    store.listPendingSyncOperations
      .mockResolvedValueOnce([pendingDuplicate])
      .mockResolvedValueOnce([]);
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      "article-file",
      checkpoint(currentItems, ["old-change"]),
    );

    await expect(session.sync(store)).resolves.toMatchObject({
      items: currentItems,
      operationCount: 0,
      uploadedCount: 0,
    });
    expect(request.mock.calls.some((call) => call[1]?.method === "POST")).toBe(false);
    expect(store.removePendingSyncOperations).toHaveBeenCalledWith(["old-change"]);
    expect(store.replaceAll).toHaveBeenCalledWith(currentItems);

    await expect(session.sync(store)).resolves.toMatchObject({
      items: currentItems,
      operationCount: 0,
      uploadedCount: 0,
    });
    expect(
      request.mock.calls.filter((call) => call[1]?.method === "DELETE"),
    ).toHaveLength(2);
    expect(
      request.mock.calls
        .filter((call) => call[1]?.method === "PATCH")
        .map((call) => JSON.parse(String(call[1]?.body))),
    ).toContainEqual(expect.objectContaining({ compactedOperationIds: [] }));
  });
});

function createStore(operations: ReadingListSyncOperation[]) {
  return {
    listPendingSyncOperations: vi.fn(async () => operations),
    removePendingSyncOperations: vi.fn(async () => undefined),
    replaceAll: vi.fn(async () => undefined),
  };
}

function addOperation(operationId: string, item: SavedItem): ReadingListSyncOperation {
  return { operationId, type: "add", occurredAt: 10, item };
}

function article(id: string, savedAt: number): SavedItem {
  return { id, title: `Article ${id}`, url: `https://example.com/${id}`, savedAt };
}

function checkpoint(items: SavedItem[], compactedOperationIds: string[] = []) {
  return {
    updatedAt: "2026-08-23T20:00:00.000Z",
    items,
    compactedOperationIds,
  };
}

function checkpointResponse(
  items: SavedItem[],
  compactedOperationIds: string[] = [],
): Response {
  return jsonResponse({
    schemaVersion: 2,
    ...checkpoint(items, compactedOperationIds),
  });
}

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
