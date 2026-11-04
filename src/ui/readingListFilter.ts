import type { ReadingListEntry } from "./readingListPresentation";
import { normaliseSourceHostname } from "../domain/sourceIdentity";

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
  query = "",
): ReadingListEntry[] {
  const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean);
  return entries.filter(({ item, isGhost }) => {
    // Undo must remain available even when the view or query changes.
    if (isGhost) return true;
    if (view === "bookmarked" && item.bookmarked !== true) return false;
    if (terms.length === 0) return true;
    const searchable = `${item.title} ${normaliseSourceHostname(item.url)}`.toLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
}

export function countVisibleReadingListItems(
  entries: ReadingListEntry[],
  view: ReadingListView,
  query = "",
): number {
  return filterReadingListEntries(
    entries.filter((entry) => !entry.isGhost),
    view,
    query,
  ).length;
}

export function getReadingListViewPresentation(
  view: ReadingListView,
  totalCount: number,
  visibleCount: number,
  query = "",
): ReadingListViewPresentation {
  const searching = query.trim().length > 0;
  const searchPresentation = searching
    ? {
        countLabel: `${visibleCount} ${visibleCount === 1 ? "match" : "matches"}`,
        emptyMessage: totalCount === 0
          ? WHOLE_LIST_EMPTY_MESSAGE
          : view === "bookmarked"
            ? "No bookmarked articles match. Try another search, clear it or show all articles."
            : "No articles match. Try another search or clear it to see your saved articles.",
      }
    : {};
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
      ...searchPresentation,
    };
  }

  return {
    actionLabel: "Show bookmarks",
    countLabel: `${visibleCount} ${visibleCount === 1 ? "item" : "items"}`,
    emptyMessage: WHOLE_LIST_EMPTY_MESSAGE,
    heading: "Saved articles",
    listLabel: "Saved articles",
    ...searchPresentation,
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
