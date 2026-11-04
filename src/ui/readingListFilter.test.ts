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

  it("matches title and normalised publisher terms in any order without reordering or mutation", () => {
    const first = entry("new", 300, true);
    first.item.title = "A Walk Along the Coast";
    first.item.url = "https://www.Example.org./private-path?token=hidden-value";
    const second = entry("old", 100);
    second.item.title = "Coastal Notes";
    second.item.url = "https://example.net/another";
    const entries = [first, second];
    const before = structuredClone(entries);

    expect(filterReadingListEntries(entries, "all", "  EXAMPLE.ORG \t walk  ")).toEqual([first]);
    expect(filterReadingListEntries(entries, "all", "coast")).toEqual(entries);
    expect(filterReadingListEntries(entries, "all", "hidden-value")).toEqual([]);
    expect(filterReadingListEntries(entries, "all", "private-path")).toEqual([]);
    expect(filterReadingListEntries(entries, "all", "www.")).toEqual([]);
    expect(entries).toEqual(before);
  });

  it("combines search with bookmarks and treats blank queries as the current view", () => {
    const entries = [entry("saved", 300), entry("bookmark", 200, true)];
    expect(filterReadingListEntries(entries, "bookmarked", "article")).toEqual([entries[1]]);
    expect(filterReadingListEntries(entries, "all", " \n\t ")).toEqual(entries);
    expect(filterReadingListEntries(entries, "bookmarked", "saved")).toEqual([]);
    expect(filterReadingListEntries(entries, "all", ".*|<script>")).toEqual([]);
  });

  it("retains Undo through query and bookmark changes without counting a ghost as a match", () => {
    const ghost = entry("deleted", 300, false, true);
    const saved = entry("bookmark", 100, true);
    const entries = [ghost, saved];

    expect(filterReadingListEntries(entries, "bookmarked", "no results")).toEqual([ghost]);
    expect(countVisibleReadingListItems(entries, "bookmarked", "no results")).toBe(0);
    expect(filterReadingListEntries(entries, "all", "bookmark")).toEqual(entries);
    expect(countVisibleReadingListItems(entries, "all", "bookmark")).toBe(1);
    expect(filterReadingListEntries([{ ...ghost, isGhost: false }], "bookmarked", "no results")).toEqual([]);
  });

  it("reflects edited titles, bookmark updates and new resolved data using the same query", () => {
    const original = entry("one", 100);
    const renamed = { ...original, item: { ...original.item, title: "Renamed", bookmarked: true } };
    expect(filterReadingListEntries([original], "all", "article")).toHaveLength(1);
    expect(filterReadingListEntries([renamed], "all", "article")).toEqual([]);
    expect(filterReadingListEntries([renamed], "bookmarked", "renamed")).toEqual([renamed]);
    expect(filterReadingListEntries([], "bookmarked", "renamed")).toEqual([]);
  });

  it("distinguishes matching counts and search-empty states while retaining empty-library guidance", () => {
    expect(getReadingListViewPresentation("all", 4, 1, "walk").countLabel).toBe("1 match");
    expect(getReadingListViewPresentation("bookmarked", 4, 2, "walk").countLabel).toBe("2 matches");
    expect(getReadingListViewPresentation("all", 4, 0, "walk").emptyMessage).toMatch(/^No articles match/);
    expect(getReadingListViewPresentation("bookmarked", 4, 0, "walk").emptyMessage).toMatch(/^No bookmarked articles match/);
    expect(getReadingListViewPresentation("all", 0, 0, "walk").emptyMessage).toMatch(/^Nothing saved yet/);
    expect(getReadingListViewPresentation("all", 4, 4, "  ").countLabel).toBe("4 items");
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
