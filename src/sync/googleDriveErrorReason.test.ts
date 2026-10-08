import { describe, expect, it, vi } from "vitest";
import { readGoogleDriveErrorReason } from "./googleDriveErrorReason";
import { runGoogleDriveConnectionProbe } from "./googleDriveConnection";

describe("Google Drive failure diagnostics", () => {
  it("retains a known reason without retaining free-text Google error messages", async () => {
    const response = new Response(JSON.stringify({ error: {
      message: "private account or file information",
      errors: [{ reason: "userRateLimitExceeded", message: "private" }],
    } }), { status: 403 });
    expect(await readGoogleDriveErrorReason(response)).toBe("userRateLimitExceeded");
  });

  it("ignores unknown reasons, non-JSON errors and empty responses", async () => {
    expect(await readGoogleDriveErrorReason(new Response('{"error":{"errors":[{"reason":"private"}]}}'))).toBeUndefined();
    expect(await readGoogleDriveErrorReason(new Response("not JSON"))).toBeUndefined();
    expect(await readGoogleDriveErrorReason(new Response(null))).toBeUndefined();
  });

  it("stops reading an oversized response body", async () => {
    const cancel = vi.fn();
    const response = new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(17 * 1024)); },
      cancel,
    }));
    expect(await readGoogleDriveErrorReason(response)).toBeUndefined();
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("preserves the HTTP failure and a quota reason at the real connection boundary", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      error: { errors: [{ reason: "userRateLimitExceeded" }] },
    }), { status: 403 }));
    await expect(runGoogleDriveConnectionProbe(request, "test-only-access")).rejects.toMatchObject({
      status: 403, reason: "userRateLimitExceeded", name: "GoogleDriveConnectionRequestError",
    });
  });
});
