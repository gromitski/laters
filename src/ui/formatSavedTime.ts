const relativeTime = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

export function formatSavedTime(savedAt: number, now = Date.now()): string {
  const elapsedSeconds = Math.max(0, Math.floor((now - savedAt) / 1_000));

  if (elapsedSeconds < 60) {
    return "just now";
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return relativeTime.format(-elapsedMinutes, "minute");
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return relativeTime.format(-elapsedHours, "hour");
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 30) {
    return relativeTime.format(-elapsedDays, "day");
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: savedAt < startOfCurrentYear(now) ? "numeric" : undefined,
  }).format(savedAt);
}

function startOfCurrentYear(now: number): number {
  const date = new Date(now);
  return new Date(date.getFullYear(), 0, 1).getTime();
}
