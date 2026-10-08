import { safeGoogleDriveErrorReason } from "./googleDriveErrorReason";

export const GOOGLE_DRIVE_DIAGNOSTICS_KEY = "laters-google-drive-diagnostics";
const MAX_EVENTS = 8;
const EVENT_TEXT = {
  page_started: "New page started; Google access is not retained between pages.",
  page_reloaded: "Page reloaded; in-memory Google access was lost.",
  page_discarded: "Browser discarded the previous page; in-memory Google access was lost.",
  page_restarted: "Page started again in this tab; in-memory Google access was lost.",
  backgrounded: "Page moved to the background.",
  returned_connected: "Returned to the same page with Google access still in memory.",
  returned_disconnected: "Returned to the same page without active Google access.",
  permission_requested: "Google permission requested.",
  permission_cancelled: "Google permission screen was closed or permission was declined.",
  popup_failed: "Browser could not open Google's permission screen.",
  identity_failed: "Google's permission service could not be loaded.",
  access_granted: "Google access received; starting Drive sync.",
  connected: "Drive sync connected.",
  expired: "Google's supplied access lifetime reached its planned expiry.",
  rejected: "Google rejected a Drive request; Laters cleared the connection.",
  connection_failed: "Connection attempt failed.",
  sync_failed: "Drive sync interrupted; access remains in memory for retry.",
  offline: "Browser reported offline; this event does not clear Google access.",
  disconnected: "Disconnect selected; in-memory Google access cleared.",
} as const;
type EventKind = keyof typeof EVENT_TEXT;
interface DiagnosticEvent {
  at: number;
  kind: EventKind;
  seconds?: number;
  status?: number;
  reason?: string;
}
interface AccessLifetime {
  receivedAt: number;
  seconds: number;
  expiresAt?: number;
}
interface Options {
  getStorage(): Storage;
  navigationType?: string;
  wasDiscarded?: boolean;
  now?: () => number;
  onChange(report: string): void;
}

export class GoogleDriveConnectionDiagnostics {
  private events: DiagnosticEvent[] = [];
  private lifetime?: AccessLifetime;
  private readonly now: () => number;
  private readonly pageStartedAt: number;

  constructor(private readonly options: Options) {
    this.now = options.now ?? Date.now;
    this.pageStartedAt = this.now();
    this.restore();
    const kind = options.wasDiscarded ? "page_discarded"
      : options.navigationType === "reload" ? "page_reloaded"
      : this.events.length > 0 ? "page_restarted" : "page_started";
    this.record(kind);
  }

  record(kind: EventKind, details: { seconds?: number; status?: number; reason?: string } = {}): void {
    const event: DiagnosticEvent = { at: this.now(), kind };
    if (validDuration(details.seconds)) event.seconds = details.seconds;
    if (validStatus(details.status)) event.status = details.status;
    const reason = safeGoogleDriveErrorReason(details.reason);
    if (reason) event.reason = reason;
    const previous = this.events.at(-1);
    if (previous?.kind === kind && previous.status === event.status && previous.reason === event.reason) {
      this.events[this.events.length - 1] = event;
    } else {
      this.events.push(event);
      this.events = this.events.slice(-MAX_EVENTS);
    }
    try {
      this.options.getStorage().setItem(GOOGLE_DRIVE_DIAGNOSTICS_KEY,
        JSON.stringify({ events: this.events, lifetime: this.lifetime }));
    } catch {
      // Storage may be blocked; diagnostics remain useful in this page.
    }
    this.options.onChange(this.report());
  }

  accessGranted(seconds: number, expiresAt?: number): void {
    this.lifetime = validDuration(seconds) && seconds > 0
      ? { receivedAt: this.now(), seconds, ...(validTime(expiresAt) ? { expiresAt } : {}) }
      : undefined;
    this.record("access_granted");
  }

  report(): string {
    const lines = [`Current page started: ${formatTime(this.pageStartedAt)}.`];
    if (this.lifetime) {
      lines.push(`Last Google access: ${formatDuration(this.lifetime.seconds)}, received ${formatTime(this.lifetime.receivedAt)}.`);
      lines.push(this.lifetime.expiresAt !== undefined
        ? `Planned pause: ${formatTime(this.lifetime.expiresAt)} (one-minute safety margin).`
        : "Google's expiry could not be calculated.");
    } else {
      lines.push("Google access lifetime has not been recorded in this tab.");
    }
    lines.push("", "Recent events:");
    for (const event of this.events) {
      let detail = EVENT_TEXT[event.kind];
      if (event.seconds !== undefined) detail += ` After ${formatDuration(event.seconds)}.`;
      if (event.status !== undefined) detail += ` HTTP ${event.status}${event.reason ? ` (${event.reason})` : ""}.`;
      lines.push(`${formatTime(event.at)} — ${detail}`);
    }
    return lines.join("\n");
  }

  private restore(): void {
    try {
      const raw = this.options.getStorage().getItem(GOOGLE_DRIVE_DIAGNOSTICS_KEY);
      if (!raw || raw.length > 8_192) return;
      const stored = JSON.parse(raw);
      if (Array.isArray(stored?.events)) {
        for (const event of stored.events.slice(-MAX_EVENTS)) {
          if (!event || !validTime(event.at) || typeof event.kind !== "string" ||
              !Object.hasOwn(EVENT_TEXT, event.kind)) continue;
          this.events.push({ at: event.at, kind: event.kind as EventKind,
            ...(validDuration(event.seconds) ? { seconds: event.seconds } : {}),
            ...(validStatus(event.status) ? { status: event.status } : {}),
            ...(safeGoogleDriveErrorReason(event.reason) ? { reason: event.reason } : {}),
          });
        }
      }
      const lifetime = stored?.lifetime;
      if (lifetime && validTime(lifetime.receivedAt) && validDuration(lifetime.seconds) && lifetime.seconds > 0) {
        this.lifetime = { receivedAt: lifetime.receivedAt, seconds: lifetime.seconds,
          ...(validTime(lifetime.expiresAt) ? { expiresAt: lifetime.expiresAt } : {}),
        };
      }
    } catch {
      // Malformed or unavailable diagnostics never affect the reading list or credentials.
    }
  }
}

function validTime(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 8.64e15;
}
function validDuration(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 31_536_000;
}
function validStatus(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 599;
}
function formatTime(value: number): string {
  return new Date(value).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function formatDuration(seconds: number): string {
  return seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${Math.round(seconds)} sec`;
}
