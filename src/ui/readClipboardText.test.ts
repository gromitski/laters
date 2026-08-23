import { describe, expect, it, vi } from "vitest";
import { readClipboardText } from "./readClipboardText";

describe("readClipboardText", () => {
  it("reads text only through the supplied clipboard action", async () => {
    const readText = vi.fn(async () => "https://example.com/article");

    await expect(readClipboardText({ readText })).resolves.toBe(
      "https://example.com/article",
    );
    expect(readText).toHaveBeenCalledOnce();
  });

  it("falls back safely when clipboard reading is unavailable or denied", async () => {
    await expect(readClipboardText(undefined)).resolves.toBeUndefined();
    await expect(
      readClipboardText({
        readText: vi.fn(async () => {
          throw new DOMException("Denied", "NotAllowedError");
        }),
      }),
    ).resolves.toBeUndefined();
  });
});
