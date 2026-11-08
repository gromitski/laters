import { describe, expect, it, vi } from "vitest";
import {
  GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_SCOPE,
  connectGoogleDrive,
  runGoogleDriveConnectionProbe,
} from "./googleDriveConnection";

describe("Google Drive connection proof", () => {
  it("opens the explicit Google account chooser when switching accounts", async () => {
    let prompt: string | undefined;
    const target = { google: { accounts: { oauth2: {
      initTokenClient: (configuration: { prompt?: string; callback(response: { access_token: string; expires_in: number }): void }) => {
        prompt = configuration.prompt;
        return { requestAccessToken: () => configuration.callback({ access_token: "temporary-token", expires_in: 3600 }) };
      },
    } } } } as unknown as Window;
    await expect(connectGoogleDrive(GOOGLE_DRIVE_CLIENT_ID, target, {} as Document, true))
      .resolves.toEqual({ accessToken: "temporary-token", expiresInSeconds: 3600 });
    expect(prompt).toBe("select_account");
  });

  it("refuses ambiguous connection files before touching article data", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({ files: [{ id: "one" }, { id: "two" }] }));
    await expect(runGoogleDriveConnectionProbe(request, "temporary-token")).rejects.toThrow("ambiguous");
    expect(request).toHaveBeenCalledOnce();
  });
  it("uses the production-only web client", () => {
    expect(GOOGLE_DRIVE_CLIENT_ID).toBe(
      "1097498587853-7cc0naone93knmrof6lf79upgqrkcavd.apps.googleusercontent.com",
    );
  });

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
