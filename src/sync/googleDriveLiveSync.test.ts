import { describe, expect, it, vi } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import type { ReadingListSyncOperation } from "./readingListSyncOperation";
import { GoogleDriveLiveSyncSession } from "./googleDriveLiveSync";

describe("Google Drive live sync", () => {
  it("uploads a pending operation immutably and clears it after Drive confirms", async () => {
    const operation = addOperation("phone-op", article("phone", 200));
    const request = vi
      .fn<typeof fetch>()
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
      [article("base", 100)],
    );

    await expect(session.sync(store)).resolves.toMatchObject({
      items: [article("phone", 200), article("base", 100)],
      uploadedCount: 1,
    });
    expect(String(request.mock.calls[1]![0])).toContain("uploadType=multipart");
    expect(String(request.mock.calls[1]![1]?.body)).toContain(
      "laters-operation-phone-op.json",
    );
    expect(store.removePendingSyncOperations).toHaveBeenCalledWith(["phone-op"]);
    expect(store.replaceAll).toHaveBeenCalledWith([
      article("phone", 200),
      article("base", 100),
    ]);
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
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(jsonResponse(operation))
      .mockResolvedValueOnce(jsonResponse(files));
    const store = createStore([]);
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      [article("base", 100)],
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
      .mockResolvedValueOnce(jsonResponse(files))
      .mockResolvedValueOnce(jsonResponse(operation))
      .mockResolvedValueOnce(jsonResponse(files));
    const store = createStore([operation]);
    const session = new GoogleDriveLiveSyncSession(request, "temporary-token", []);

    await expect(session.sync(store)).resolves.toMatchObject({ uploadedCount: 0 });
    expect(request.mock.calls.some((call) => call[1]?.method === "POST")).toBe(false);
    expect(store.removePendingSyncOperations).toHaveBeenCalledWith(["existing-op"]);
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

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
