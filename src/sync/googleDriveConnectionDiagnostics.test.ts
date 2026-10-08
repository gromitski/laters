import { describe, expect, it } from "vitest";
import { GOOGLE_DRIVE_DIAGNOSTICS_KEY, GoogleDriveConnectionDiagnostics } from "./googleDriveConnectionDiagnostics";

function fixture() {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  } as Storage;
  let time = Date.UTC(2026, 9, 8, 12);
  const options = { getStorage: () => storage, now: () => time, onChange: () => undefined };
  return { values, options, advance: (seconds: number) => { time += seconds * 1_000; } };
}

describe("local Google Drive connection diagnostics", () => {
  it("keeps the supplied lifetime and restart evidence through a reload without storing credentials", () => {
    const { values, options, advance } = fixture();
    const initial = new GoogleDriveConnectionDiagnostics(options);
    initial.accessGranted(3_600, options.now() + 3_540_000);
    initial.record("connected");
    initial.record("backgrounded");
    advance(20 * 60);
    const reopened = new GoogleDriveConnectionDiagnostics({ ...options, navigationType: "reload" });
    expect(reopened.report()).toContain("Last Google access: 60 min");
    expect(reopened.report()).toContain("one-minute safety margin");
    expect(reopened.report()).toContain("Page reloaded; in-memory Google access was lost.");
    const stored = JSON.parse(values.get(GOOGLE_DRIVE_DIAGNOSTICS_KEY)!);
    expect(Object.keys(stored)).toEqual(["events", "lifetime"]);
    expect(Object.keys(stored.lifetime)).toEqual(["receivedAt", "seconds", "expiresAt"]);
  });

  it("distinguishes a browser discard, a restart in this tab and a new tab", () => {
    const { options } = fixture();
    expect(new GoogleDriveConnectionDiagnostics(options).report()).toContain("New page started");
    expect(new GoogleDriveConnectionDiagnostics(options).report()).toContain("Page started again in this tab");
    expect(new GoogleDriveConnectionDiagnostics({ ...options, wasDiscarded: true }).report()).toContain("Browser discarded the previous page");
    expect(new GoogleDriveConnectionDiagnostics(fixture().options).report()).toContain("New page started");
  });

  it("retains useful lifetime evidence while bounding repeated failures and later events", () => {
    const { values, options } = fixture();
    const diagnostics = new GoogleDriveConnectionDiagnostics(options);
    diagnostics.accessGranted(900, options.now() + 840_000);
    for (let i = 0; i < 20; i++) diagnostics.record("sync_failed", { status: 503 });
    expect(JSON.parse(values.get(GOOGLE_DRIVE_DIAGNOSTICS_KEY)!).events).toHaveLength(3);
    for (let i = 0; i < 20; i++) diagnostics.record(i % 2 ? "backgrounded" : "returned_connected");
    expect(JSON.parse(values.get(GOOGLE_DRIVE_DIAGNOSTICS_KEY)!).events).toHaveLength(8);
    expect(diagnostics.report()).toContain("Last Google access: 15 min");
  });

  it("does not trust arbitrary text, properties or error reasons in stored diagnostics", () => {
    const { values, options } = fixture();
    values.set(GOOGLE_DRIVE_DIAGNOSTICS_KEY, JSON.stringify({
      events: [
        { at: options.now(), kind: "sync_failed", status: 403, reason: "private account text", access_token: "private-credential" },
        { at: options.now(), kind: "<script>private</script>" },
        { at: "invalid", kind: "connected" },
      ],
      lifetime: { receivedAt: options.now(), seconds: 3600, access_token: "private-credential" },
    }));
    const diagnostics = new GoogleDriveConnectionDiagnostics(options);
    expect(diagnostics.report()).toContain("HTTP 403");
    expect(values.get(GOOGLE_DRIVE_DIAGNOSTICS_KEY)).not.toContain("private");
    expect(diagnostics.report()).not.toContain("<script>");
  });

  it("still reports events when browser storage is blocked or corrupt", () => {
    const { values, options } = fixture();
    values.set(GOOGLE_DRIVE_DIAGNOSTICS_KEY, "broken json");
    expect(new GoogleDriveConnectionDiagnostics(options).report()).toContain("New page started");
    const diagnostics = new GoogleDriveConnectionDiagnostics({
      ...options, getStorage: () => { throw new Error("blocked"); },
    });
    diagnostics.record("returned_disconnected", { seconds: 1200 });
    expect(diagnostics.report()).toContain("After 20 min");
  });

  it("keeps actual expiry separate from a Google rejection or a recoverable interruption", () => {
    const { options } = fixture();
    const diagnostics = new GoogleDriveConnectionDiagnostics(options);
    diagnostics.record("expired");
    diagnostics.record("rejected", { status: 403, reason: "userRateLimitExceeded" });
    diagnostics.record("sync_failed", { status: 503 });
    expect(diagnostics.report()).toContain("supplied access lifetime reached");
    expect(diagnostics.report()).toContain("HTTP 403 (userRateLimitExceeded)");
    expect(diagnostics.report()).toContain("access remains in memory for retry");
    diagnostics.accessGranted(Number.NaN);
    expect(diagnostics.report()).toContain("lifetime has not been recorded");
  });
});
