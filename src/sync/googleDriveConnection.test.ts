import { describe, expect, it, vi } from "vitest";
import {
  GOOGLE_DRIVE_SCOPE,
  runGoogleDriveConnectionProbe,
} from "./googleDriveConnection";

describe("Google Drive connection proof", () => {
  it("uses only the private application-data scope", () => {
    expect(GOOGLE_DRIVE_SCOPE).toBe("https://www.googleapis.com/auth/drive.appdata");
  });

  it("creates, writes and confirms a connection-only file", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ files: [] }))
      .mockResolvedValueOnce(jsonResponse({ id: "connection-file" }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        jsonResponse({ schemaVersion: 1, lastConnectedAt: "2026-08-23T14:30:00.000Z" }),
      );

    await expect(
      runGoogleDriveConnectionProbe(
        request,
        "temporary-access-token",
        () => new Date("2026-08-23T14:30:00.000Z"),
      ),
    ).resolves.toEqual({
      fileId: "connection-file",
      lastConnectedAt: "2026-08-23T14:30:00.000Z",
    });

    expect(request).toHaveBeenCalledTimes(4);
    expect(String(request.mock.calls[0]![0])).toContain("spaces=appDataFolder");
    expect(request.mock.calls[1]![1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        name: "laters-connection.json",
        parents: ["appDataFolder"],
        mimeType: "application/json",
      }),
    });
    expect(request.mock.calls[2]![1]).toMatchObject({
      method: "PATCH",
      body: JSON.stringify({
        schemaVersion: 1,
        lastConnectedAt: "2026-08-23T14:30:00.000Z",
      }),
    });

    const uploadedBody = String(request.mock.calls[2]![1]?.body);
    expect(uploadedBody).not.toContain("url");
    expect(uploadedBody).not.toContain("title");
    expect(uploadedBody).not.toContain("bookmark");
  });

  it("reuses the existing connection file", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: "existing-file" }] }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        jsonResponse({ schemaVersion: 1, lastConnectedAt: "2026-08-23T15:00:00.000Z" }),
      );

    await runGoogleDriveConnectionProbe(
      request,
      "temporary-access-token",
      () => new Date("2026-08-23T15:00:00.000Z"),
    );

    expect(request).toHaveBeenCalledTimes(3);
    expect(String(request.mock.calls[1]![0])).toContain("/existing-file?uploadType=media");
  });
});

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
