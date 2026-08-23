import type { SavedItem } from "../domain/savedItem";
import type { ReadingListStore } from "../storage/readingListStore";

type CaptureStore = Pick<ReadingListStore, "save" | "listNewestFirst">;

export interface SavedCaptureResult {
  item: SavedItem;
  items: SavedItem[];
  wasDuplicate: boolean;
}

export async function saveCapturedItem(
  candidate: SavedItem,
  store: CaptureStore,
): Promise<SavedCaptureResult> {
  const existingItems = await store.listNewestFirst();
  const existingItem = existingItems.find((item) => item.url === candidate.url);
  const item = existingItem
    ? {
        ...candidate,
        id: existingItem.id,
        ...(existingItem.titleEdited === true
          ? { title: existingItem.title, titleEdited: true }
          : {}),
        ...(existingItem.bookmarked === undefined
          ? {}
          : { bookmarked: existingItem.bookmarked }),
      }
    : candidate;

  await store.save(item);

  const items = [...existingItems.filter((existing) => existing.id !== item.id), item].sort(
    (left, right) => right.savedAt - left.savedAt || right.id.localeCompare(left.id),
  );

  return { item, items, wasDuplicate: existingItem !== undefined };
}
