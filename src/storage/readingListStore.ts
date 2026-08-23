import type { SavedItem } from "../domain/savedItem";
import type {
  ReadingListSyncOperation,
  SavedItemSyncAction,
} from "../sync/readingListSyncOperation";

export interface ReadingListStore {
  save(item: SavedItem, syncAction?: SavedItemSyncAction): Promise<void>;
  restore(item: SavedItem): Promise<void>;
  listNewestFirst(): Promise<SavedItem[]>;
  replaceAll(items: SavedItem[]): Promise<void>;
  listPendingSyncOperations(): Promise<ReadingListSyncOperation[]>;
  removePendingSyncOperations(operationIds: string[]): Promise<void>;
  setBookmarked(id: string, bookmarked: boolean): Promise<SavedItem>;
  setTitle(id: string, title: string): Promise<SavedItem>;
  delete(id: string): Promise<void>;
}
