export interface BookmarkControlState {
  label: string;
  pressed: boolean;
}

export function getBookmarkControlState(
  articleTitle: string,
  bookmarked: boolean,
): BookmarkControlState {
  return {
    label: bookmarked
      ? `Remove bookmark from “${articleTitle}”`
      : `Bookmark “${articleTitle}”`,
    pressed: bookmarked,
  };
}
