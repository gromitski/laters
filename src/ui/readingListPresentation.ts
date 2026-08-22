import type { SavedItem } from "../domain/savedItem";

export interface ReadingListEntry {
  item: SavedItem;
  isGhost: boolean;
}

export function createReadingListEntries(
  items: SavedItem[],
  pendingItem?: SavedItem,
): ReadingListEntry[] {
  const entries = items.map((item) => ({ item, isGhost: false }));

  if (pendingItem && !items.some((item) => item.id === pendingItem.id)) {
    entries.push({ item: pendingItem, isGhost: true });
  }

  return entries.sort(
    (left, right) =>
      right.item.savedAt - left.item.savedAt || right.item.id.localeCompare(left.item.id),
  );
}
