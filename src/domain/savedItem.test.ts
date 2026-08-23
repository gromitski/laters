import { describe, expect, it } from "vitest";
import { createSavedItem, isSavedItem, SavedItemValidationError } from "./savedItem";

describe("createSavedItem", () => {
  it("normalises a valid article into a saved item", () => {
    const item = createSavedItem(
      { title: "  A useful article  ", url: " https://example.com/read?x=1 " },
      { createId: () => "item-1", now: () => 1_700_000_000_000 },
    );

    expect(item).toEqual({
      id: "item-1",
      title: "A useful article",
      url: "https://example.com/read?x=1",
      savedAt: 1_700_000_000_000,
    });
  });

  it("defaults a bare article address to HTTPS", () => {
    const item = createSavedItem(
      { title: "Wye Trains", url: "wyetrains.uk/status?line=hereford" },
      { createId: () => "item-1", now: () => 1_700_000_000_000 },
    );

    expect(item.url).toBe("https://wyetrains.uk/status?line=hereford");
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///tmp/article",
    "not a url",
    "https://user:secret@example.com/article",
    "https://example.com/a\\b",
    "https://example.com/article\n",
    "https://example.com/%0d%0aInjected",
    "https://example.com/%ZZ",
  ])(
    "rejects an unsafe or incomplete URL: %s",
    (url) => {
      expect(() => createSavedItem({ title: "Article", url })).toThrow(
        SavedItemValidationError,
      );
    },
  );

  it("rejects an excessively long URL", () => {
    expect(() =>
      createSavedItem({
        title: "Article",
        url: `https://example.com/${"a".repeat(8_192)}`,
      }),
    ).toThrow(SavedItemValidationError);
  });

  it("requires a title without inventing fallback behaviour", () => {
    expect(() => createSavedItem({ title: "  ", url: "https://example.com" })).toThrow(
      "Enter a title",
    );
  });
});

describe("isSavedItem", () => {
  it.each([undefined, false, true])(
    "accepts backward-compatible bookmark state %s",
    (bookmarked) => {
      expect(
        isSavedItem({
          id: "item-1",
          title: "Article",
          url: "https://example.com/article",
          savedAt: 1,
          ...(bookmarked === undefined ? {} : { bookmarked }),
        }),
      ).toBe(true);
    },
  );

  it("rejects invalid persisted bookmark state", () => {
    expect(
      isSavedItem({
        id: "item-1",
        title: "Article",
        url: "https://example.com/article",
        savedAt: 1,
        bookmarked: "yes",
      }),
    ).toBe(false);
  });

  it("rejects invalid persisted data", () => {
    expect(
      isSavedItem({
        id: "item-1",
        title: "Unsafe",
        url: "javascript:alert(1)",
        savedAt: 1,
      }),
    ).toBe(false);
  });

  it("rejects persisted URLs containing credentials or non-canonical text", () => {
    expect(
      isSavedItem({
        id: "item-1",
        title: "Credentials",
        url: "https://user:secret@example.com/article",
        savedAt: 1,
      }),
    ).toBe(false);
    expect(
      isSavedItem({
        id: "item-2",
        title: "Whitespace",
        url: " https://example.com/article ",
        savedAt: 1,
      }),
    ).toBe(false);
  });
});
