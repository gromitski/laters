import { describe, expect, it } from "vitest";
import { renderGoogleDriveControls, type GoogleDriveControlsState } from "./googleDriveControls";

function controls() {
  const action = () => ({ textContent: "", hidden: false, disabled: false, setAttribute() {} });
  const connect = action();
  const disconnect = action();
  const render = (state: GoogleDriveControlsState) => renderGoogleDriveControls(
    connect as unknown as HTMLButtonElement, disconnect as unknown as HTMLButtonElement, state,
  );
  return { connect, disconnect, render };
}

describe("Google Drive controls follow the current connection, not stored history", () => {
  it("shows only Connect before connecting, after reopening or after expiry", () => {
    const ui = controls();
    for (const previouslyConnected of [false, true]) {
      if (previouslyConnected) ui.render({ active: true, online: true, activity: "idle" });
      ui.render({ active: false, online: true, activity: "idle" });
      expect(ui.connect.textContent).toBe("Connect Google Drive");
      expect(ui.connect.disabled).toBe(false);
      expect(ui.disconnect.hidden).toBe(true);
    }
  });

  it("does not expose Disconnect while authorising or loading the initial list", () => {
    const ui = controls();
    ui.render({ active: false, online: true, activity: "authorising" });
    expect(ui.connect.textContent).toBe("Connecting…");
    expect(ui.connect.disabled).toBe(true);
    expect(ui.disconnect.hidden).toBe(true);
    ui.render({ active: false, online: true, activity: "loading" });
    expect(ui.connect.textContent).toBe("Syncing…");
    expect(ui.disconnect.hidden).toBe(true);
  });

  it("keeps an active connection visible through sync and a temporary failure", () => {
    const ui = controls();
    ui.render({ active: true, online: true, activity: "idle" });
    expect(ui.connect.textContent).toBe("Sync now");
    expect(ui.disconnect.hidden).toBe(false);
    ui.render({ active: true, online: true, activity: "syncing" });
    expect(ui.connect.textContent).toBe("Syncing…");
    expect(ui.connect.disabled).toBe(true);
    expect(ui.disconnect.disabled).toBe(false);
    ui.render({ active: true, online: true, activity: "retry" });
    expect(ui.connect.textContent).toBe("Retry sync");
    expect(ui.connect.disabled).toBe(false);
    expect(ui.disconnect.hidden).toBe(false);
  });

  it("stops offering sync offline but lets an active connection disconnect locally", () => {
    const ui = controls();
    ui.render({ active: true, online: false, activity: "idle" });
    expect(ui.connect.disabled).toBe(true);
    expect(ui.disconnect.hidden).toBe(false);
    expect(ui.disconnect.disabled).toBe(false);
    ui.render({ active: false, online: false, activity: "idle" });
    expect(ui.connect.disabled).toBe(true);
    expect(ui.disconnect.hidden).toBe(true);
  });

  it("removes Disconnect immediately and returns to Connect after local cleanup", () => {
    const ui = controls();
    ui.render({ active: true, online: true, activity: "idle" });
    ui.render({ active: false, online: true, activity: "disconnecting" });
    expect(ui.connect.textContent).toBe("Disconnecting…");
    expect(ui.connect.disabled).toBe(true);
    expect(ui.disconnect.hidden).toBe(true);
    ui.render({ active: false, online: true, activity: "idle" });
    expect(ui.connect.textContent).toBe("Connect Google Drive");
    expect(ui.connect.disabled).toBe(false);
  });

  it("returns to a usable Connect action after cancellation or a failed first connection", () => {
    const ui = controls();
    ui.render({ active: false, online: true, activity: "authorising" });
    ui.render({ active: false, online: true, activity: "idle" });
    expect(ui.connect.disabled).toBe(false);
    expect(ui.disconnect.hidden).toBe(true);
  });
});
