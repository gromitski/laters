import { describe, expect, it, vi } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import type { ReadingListSyncOperation } from "./readingListSyncOperation";
import {
  GOOGLE_DRIVE_OPERATION_COMPACTION_THRESHOLD,
  GOOGLE_DRIVE_OPERATION_DOWNLOAD_CONCURRENCY,
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

  it("downloads at most four operations together and applies them deterministically", async () => {
    const operations: ReadingListSyncOperation[] = [
      addOperation("op-a", article("shared", 100)),
      {
        operationId: "op-b",
        type: "update",
        occurredAt: 20,
        item: article("shared", 200),
      },
      { operationId: "op-c", type: "delete", occurredAt: 30, itemId: "shared" },
      {
        operationId: "op-d",
        type: "restore",
        occurredAt: 40,
        item: article("shared", 300),
      },
      {
        operationId: "op-e",
        type: "update",
        occurredAt: 50,
        item: article("shared", 400),
      },
    ];
    const files = operations
      .map((operation) => ({
        id: `file-${operation.operationId}`,
        name: `laters-operation-${operation.operationId}.json`,
      }))
      .reverse();
    const operationsByFileId = new Map(
      operations.map((operation) => [`file-${operation.operationId}`, operation]),
    );
    const releases = new Map<string, () => void>();
    let activeDownloads = 0;
    let maximumActiveDownloads = 0;
    const request = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);

      if (url.endsWith("/article-file?alt=media")) {
        return checkpointResponse([]);
      }

      if (!url.includes("?alt=media")) {
        return jsonResponse({ files });
      }

      const fileId = new URL(url).pathname.split("/").at(-1)!;
      const operation = operationsByFileId.get(fileId)!;
      activeDownloads += 1;
      maximumActiveDownloads = Math.max(maximumActiveDownloads, activeDownloads);

      return new Promise<Response>((resolve) => {
        releases.set(fileId, () => {
          activeDownloads -= 1;
          resolve(jsonResponse(operation));
        });
      });
    });
    const store = createStore([]);
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      "article-file",
      checkpoint([]),
    );

    const syncing = session.sync(store);
    await vi.waitFor(() => {
      expect(releases.size).toBe(GOOGLE_DRIVE_OPERATION_DOWNLOAD_CONCURRENCY);
    });
    expect(maximumActiveDownloads).toBe(GOOGLE_DRIVE_OPERATION_DOWNLOAD_CONCURRENCY);

    for (const fileId of ["file-op-d", "file-op-c", "file-op-b", "file-op-a"]) {
      releases.get(fileId)!();
    }

    await vi.waitFor(() => {
      expect(releases.has("file-op-e")).toBe(true);
    });
    releases.get("file-op-e")!();

    await expect(syncing).resolves.toMatchObject({
      items: [article("shared", 400)],
      operationCount: 5,
    });
    expect(store.replaceAll).toHaveBeenCalledWith([article("shared", 400)]);
  });

  it("keeps local changes untouched and retries the complete batch after a download fails", async () => {
    const operations = [
      addOperation("op-a", article("a", 100)),
      addOperation("op-b", article("b", 200)),
      addOperation("op-c", article("c", 300)),
      addOperation("op-d", article("d", 400)),
    ];
    const files = operations.map((operation) => ({
      id: `file-${operation.operationId}`,
      name: `laters-operation-${operation.operationId}.json`,
    }));
    const operationsByFileId = new Map(
      operations.map((operation) => [`file-${operation.operationId}`, operation]),
    );
    const downloadAttempts = new Map<string, number>();
    const request = vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);

      if (url.endsWith("/article-file?alt=media")) {
        return checkpointResponse([]);
      }

      if (init?.method === "POST") {
        return jsonResponse({ id: "uploaded-local-operation" });
      }

      if (!url.includes("?alt=media")) {
        return jsonResponse({ files });
      }

      const fileId = new URL(url).pathname.split("/").at(-1)!;
      const attempt = (downloadAttempts.get(fileId) ?? 0) + 1;
      downloadAttempts.set(fileId, attempt);

      if (fileId === "file-op-b" && attempt === 1) {
        return new Response(null, { status: 503 });
      }

      return jsonResponse(operationsByFileId.get(fileId));
    });
    const pendingOperation = addOperation("local-pending", article("local", 500));
    const store = createStore([pendingOperation]);
    const session = new GoogleDriveLiveSyncSession(
      request,
      "temporary-token",
      "article-file",
      checkpoint([]),
    );

    await expect(session.sync(store)).rejects.toThrow(
      "Google Drive live-sync request failed (503).",
    );
    expect(store.listPendingSyncOperations).not.toHaveBeenCalled();
    expect(store.removePendingSyncOperations).not.toHaveBeenCalled();
    expect(store.replaceAll).not.toHaveBeenCalled();

    await expect(session.sync(store)).resolves.toMatchObject({
      items: [
        article("local", 500),
        article("d", 400),
        article("c", 300),
        article("b", 200),
        article("a", 100),
      ],
      operationCount: 5,
      uploadedCount: 1,
    });
    expect([...downloadAttempts.values()]).toEqual([2, 2, 2, 2]);
    expect(store.removePendingSyncOperations).toHaveBeenCalledWith(["local-pending"]);
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
