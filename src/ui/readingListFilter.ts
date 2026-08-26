import type { ReadingListEntry } from "./readingListPresentation";

export type ReadingListView = "all" | "bookmarked";

export interface ReadingListViewPresentation {
  actionLabel: string;
  countLabel: string;
  emptyMessage: string;
  heading: string;
  listLabel: string;
}

const WHOLE_LIST_EMPTY_MESSAGE =
  "Nothing saved yet. On Android, share an article and choose Laters.";

export function toggleReadingListView(view: ReadingListView): ReadingListView {
  return view === "all" ? "bookmarked" : "all";
}

export function filterReadingListEntries(
  entries: ReadingListEntry[],
  view: ReadingListView,
): ReadingListEntry[] {
  return view === "bookmarked"
    ? entries.filter((entry) => entry.item.bookmarked === true)
    : entries;
}

export function countVisibleReadingListItems(
  entries: ReadingListEntry[],
  view: ReadingListView,
): number {
  return filterReadingListEntries(
    entries.filter((entry) => !entry.isGhost),
    view,
  ).length;
}

export function getReadingListViewPresentation(
  view: ReadingListView,
  totalCount: number,
  visibleCount: number,
): ReadingListViewPresentation {
  if (view === "bookmarked") {
    return {
      actionLabel: "Show all",
      countLabel: `${visibleCount} ${visibleCount === 1 ? "bookmark" : "bookmarks"}`,
      emptyMessage:
        totalCount === 0
          ? WHOLE_LIST_EMPTY_MESSAGE
          : "No bookmarked articles yet. Bookmark one to keep it easy to find.",
      heading: "Bookmarked articles",
      listLabel: "Bookmarked articles",
    };
  }

  return {
    actionLabel: "Show bookmarks",
    countLabel: `${visibleCount} ${visibleCount === 1 ? "item" : "items"}`,
    emptyMessage: WHOLE_LIST_EMPTY_MESSAGE,
    heading: "Saved articles",
    listLabel: "Saved articles",
  };
}

export function getFocusIndexAfterRemoval(
  removedIndex: number,
  remainingCount: number,
): number | undefined {
  if (remainingCount <= 0) {
    return undefined;
  }

  return Math.min(Math.max(removedIndex, 0), remainingCount - 1);
}
