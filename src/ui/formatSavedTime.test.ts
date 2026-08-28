import { describe, expect, it } from "vitest";
import { formatSavedTime } from "./formatSavedTime";

describe("formatSavedTime", () => {
  const now = new Date("2026-08-21T12:00:00Z").getTime();

  it.each([
    [30_000, "just now"],
    [60_000, "1min old"],
    [2 * 60_000, "2mins old"],
    [60 * 60 * 1_000, "1hr old"],
    [2 * 60 * 60 * 1_000, "2hrs old"],
    [3 * 24 * 60 * 60 * 1_000, "3 days ago"],
  ])("formats an elapsed time of %i milliseconds", (elapsed, expected) => {
    expect(formatSavedTime(now - elapsed, now)).toBe(expected);
  });
});
