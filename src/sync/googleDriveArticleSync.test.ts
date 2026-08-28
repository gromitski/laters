import { describe, expect, it, vi } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import {
  GoogleDriveArticleSyncSession,
  initialiseGoogleDriveArticles,
  readGoogleDriveArticleCheckpoint,
  writeGoogleDriveArticleCheckpoint,
} from "./googleDriveArticleSync";

describe("Google Drive article sync", () => {
  it("uploads the local list when Drive has no article snapshot", async () => {
    const items = [{ ...article("local", 100), readTimeMinutes: 8 }];
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: "article-file" }))
      .mockResolvedValueOnce(
        jsonResponse({
          schemaVersion: 2,
          updatedAt: "2026-08-23T16:00:00.000Z",
          items,
          compactedOperationIds: [],
        }),
      );

    await expect(
      initialiseGoogleDriveArticles(
        request,
        "temporary-token",
        items,
        () => new Date("2026-08-23T16:00:00.000Z"),
      ),
    ).resolves.toEqual({
      fileId: "article-file",
      source: "local-uploaded",
      updatedAt: "2026-08-23T16:00:00.000Z",
      items,
      compactedOperationIds: [],
    });

    expect(String(request.mock.calls[1]![0])).toContain("uploadType=multipart");
    expect(request.mock.calls[1]![1]).toMatchObject({
      method: "POST",
    });
    expect(request.mock.calls[1]![1]?.headers).toMatchObject({
      "Content-Type": expect.stringContaining("multipart/related"),
    });
    expect(String(request.mock.calls[1]![1]?.body)).toContain(
      JSON.stringify({
        schemaVersion: 2,
        updatedAt: "2026-08-23T16:00:00.000Z",
        items,
        compactedOperationIds: [],
      }),
    );
  });

  it("loads an existing Drive snapshot without uploading local data", async () => {
    const remoteItems = [{ ...article("remote", 200), readTimeMinutes: 12 }];
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: "existing-file" }] }))
      .mockResolvedValueOnce(
        jsonResponse({
          schemaVersion: 1,
          updatedAt: "2026-08-23T17:00:00.000Z",
          items: remoteItems,
        }),
      );

    await expect(
      initialiseGoogleDriveArticles(request, "temporary-token", [article("local", 100)]),
    ).resolves.toEqual({
      fileId: "existing-file",
      source: "drive-loaded",
      updatedAt: "2026-08-23T17:00:00.000Z",
      items: remoteItems,
      compactedOperationIds: [],
    });
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls.some((call) => call[1]?.method === "PATCH")).toBe(false);
  });

  it("loads cleanup metadata while keeping old snapshots compatible", async () => {
    const items = [article("remote", 200)];
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          schemaVersion: 2,
          updatedAt: "2026-08-23T17:00:00.000Z",
          items,
          compactedOperationIds: ["old-change"],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          schemaVersion: 1,
          updatedAt: "2026-08-23T16:00:00.000Z",
          items,
        }),
      );

    await expect(
      readGoogleDriveArticleCheckpoint(request, "temporary-token", "article-file"),
    ).resolves.toEqual({
      updatedAt: "2026-08-23T17:00:00.000Z",
      items,
      compactedOperationIds: ["old-change"],
    });
    await expect(
      readGoogleDriveArticleCheckpoint(request, "temporary-token", "article-file"),
    ).resolves.toEqual({
      updatedAt: "2026-08-23T16:00:00.000Z",
      items,
      compactedOperationIds: [],
    });
  });

  it("writes the exact operation identifiers covered by a cleanup checkpoint", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    const items = [article("current", 300)];

    await expect(
      writeGoogleDriveArticleCheckpoint(
        request,
        "temporary-token",
        "article-file",
        items,
        ["change-one", "change-two"],
        () => new Date("2026-08-23T18:00:00.000Z"),
      ),
    ).resolves.toEqual({
      updatedAt: "2026-08-23T18:00:00.000Z",
      items,
      compactedOperationIds: ["change-one", "change-two"],
    });
    expect(JSON.parse(String(request.mock.calls[0]![1]?.body))).toEqual({
      schemaVersion: 2,
      updatedAt: "2026-08-23T18:00:00.000Z",
      items,
      compactedOperationIds: ["change-one", "change-two"],
    });
  });

  it("rejects duplicate or malformed cleanup identifiers", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        schemaVersion: 2,
        updatedAt: "2026-08-23T18:00:00.000Z",
        items: [],
        compactedOperationIds: ["duplicate", "duplicate"],
      }),
    );

    await expect(
      readGoogleDriveArticleCheckpoint(request, "temporary-token", "article-file"),
    ).rejects.toThrow("invalid data");
  });

  it("rejects invalid or duplicate remote articles", async () => {
    const duplicate = article("same", 100);
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: "existing-file" }] }))
      .mockResolvedValueOnce(
        jsonResponse({
          schemaVersion: 1,
          updatedAt: "2026-08-23T17:00:00.000Z",
          items: [duplicate, { ...duplicate, id: "different-id" }],
        }),
      );

    await expect(
      initialiseGoogleDriveArticles(request, "temporary-token", []),
    ).rejects.toThrow("invalid data");
  });

  it("serializes rapid changes and uploads only the newest pending snapshot next", async () => {
    let releaseFirstUpload: (() => void) | undefined;
    const firstUpload = new Promise<Response>((resolve) => {
      releaseFirstUpload = () => resolve(new Response(null, { status: 200 }));
    });
    const request = vi
      .fn<typeof fetch>()
      .mockReturnValueOnce(firstUpload)
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    let tick = 0;
    const session = new GoogleDriveArticleSyncSession(
      request,
      "temporary-token",
      "article-file",
      () => new Date(1_000 + tick++),
    );

    const completion = session.sync([article("first", 100)]);
    void session.sync([article("second", 200)]);
    void session.sync([article("latest", 300)]);
    expect(request).toHaveBeenCalledTimes(1);

    releaseFirstUpload?.();
    await completion;

    expect(request).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(request.mock.calls[1]![1]?.body)).items).toEqual([
      article("latest", 300),
    ]);
  });

  it("reports a failed upload and allows a later retry", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    const session = new GoogleDriveArticleSyncSession(
      request,
      "temporary-token",
      "article-file",
    );

    await expect(session.sync([article("first", 100)])).rejects.toThrow("503");
    await expect(session.sync([article("retry", 200)])).resolves.toBeUndefined();
  });
});

function article(id: string, savedAt: number): SavedItem {
  return {
    id,
    url: `https://example.com/${id}`,
    title: `Article ${id}`,
    savedAt,
  };
}

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
