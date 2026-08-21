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

  it.each(["javascript:alert(1)", "file:///tmp/article", "not a url"])(
    "rejects an unsafe or incomplete URL: %s",
    (url) => {
      expect(() => createSavedItem({ title: "Article", url })).toThrow(
        SavedItemValidationError,
      );
    },
  );

  it("requires a title without inventing fallback behaviour", () => {
    expect(() => createSavedItem({ title: "  ", url: "https://example.com" })).toThrow(
      "Enter a title",
    );
  });
});

describe("isSavedItem", () => {
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
});
