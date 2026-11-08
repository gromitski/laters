export type GoogleDriveActivity = "idle" | "authorising" | "loading" | "syncing" | "retry" | "disconnecting";

export interface GoogleDriveControlsState {
  active: boolean;
  online: boolean;
  activity: GoogleDriveActivity;
}

export function renderGoogleDriveControls(
  connect: HTMLButtonElement,
  disconnect: HTMLButtonElement,
  state: GoogleDriveControlsState,
): void {
  const busy = ["authorising", "loading", "syncing", "disconnecting"].includes(state.activity);
  connect.textContent = state.activity === "authorising" ? "Connecting…"
    : state.activity === "disconnecting" ? "Disconnecting…"
    : state.activity === "loading" || state.activity === "syncing" ? "Syncing…"
    : state.active ? state.activity === "retry" ? "Retry sync" : "Sync now"
    : "Connect Google Drive";
  connect.disabled = busy || !state.online;
  connect.setAttribute("aria-busy", String(busy));
  // A stored account association is never evidence of a live connection.
  disconnect.hidden = !state.active;
  disconnect.disabled = !state.active;
}
