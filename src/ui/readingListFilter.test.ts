import { describe, expect, it } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import type { ReadingListEntry } from "./readingListPresentation";
import {
  countVisibleReadingListItems,
  filterReadingListEntries,
  getFocusIndexAfterRemoval,
  getReadingListViewPresentation,
  toggleReadingListView,
} from "./readingListFilter";

describe("reading-list filter", () => {
  it("keeps every deterministic entry in the default view", () => {
    const entries = [entry("new", 300), entry("saved", 200, true), entry("old", 100)];

    expect(filterReadingListEntries(entries, "all")).toEqual(entries);
    expect(countVisibleReadingListItems(entries, "all")).toBe(3);
  });

  it("shows only bookmarked entries without changing their order", () => {
    const entries = [
      entry("new-bookmark", 300, true),
      entry("middle", 200),
      entry("old-bookmark", 100, true),
    ];

    expect(
      filterReadingListEntries(entries, "bookmarked").map(({ item }) => item.id),
    ).toEqual(["new-bookmark", "old-bookmark"]);
    expect(countVisibleReadingListItems(entries, "bookmarked")).toBe(2);
  });

  it("retains a bookmarked deletion ghost without counting it as saved", () => {
    const entries = [entry("ghost", 200, true, true), entry("saved", 100, true)];

    expect(filterReadingListEntries(entries, "bookmarked")).toHaveLength(2);
    expect(countVisibleReadingListItems(entries, "bookmarked")).toBe(1);
  });

  it("presents restrained labels and view-specific counts", () => {
    expect(getReadingListViewPresentation("all", 12, 12)).toMatchObject({
      actionLabel: "Show bookmarks",
      countLabel: "12 items",
      heading: "Saved articles",
    });
    expect(getReadingListViewPresentation("bookmarked", 12, 3)).toMatchObject({
      actionLabel: "Show all",
      countLabel: "3 bookmarks",
      heading: "Bookmarked articles",
    });
  });

  it("distinguishes a filtered empty state from an empty reading list", () => {
    expect(getReadingListViewPresentation("bookmarked", 4, 0).emptyMessage).toBe(
      "No bookmarked articles yet. Bookmark one to keep it easy to find.",
    );
    expect(getReadingListViewPresentation("bookmarked", 0, 0).emptyMessage).toBe(
      "Nothing saved yet. On Android, share an article and choose Laters.",
    );
  });

  it("toggles transiently and chooses the next or previous focus position", () => {
    expect(toggleReadingListView("all")).toBe("bookmarked");
    expect(toggleReadingListView("bookmarked")).toBe("all");
    expect(getFocusIndexAfterRemoval(1, 2)).toBe(1);
    expect(getFocusIndexAfterRemoval(2, 2)).toBe(1);
    expect(getFocusIndexAfterRemoval(0, 0)).toBeUndefined();
  });
});

function entry(
  id: string,
  savedAt: number,
  bookmarked = false,
  isGhost = false,
): ReadingListEntry {
  const item: SavedItem = {
    id,
    savedAt,
    title: `Article ${id}`,
    url: `https://example.com/${id}`,
    ...(bookmarked ? { bookmarked: true } : {}),
  };

  return { item, isGhost };
}
