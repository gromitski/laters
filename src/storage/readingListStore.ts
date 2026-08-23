import type { SavedItem } from "../domain/savedItem";

export interface ReadingListStore {
  save(item: SavedItem): Promise<void>;
  listNewestFirst(): Promise<SavedItem[]>;
  replaceAll(items: SavedItem[]): Promise<void>;
  setBookmarked(id: string, bookmarked: boolean): Promise<SavedItem>;
  setTitle(id: string, title: string): Promise<SavedItem>;
  delete(id: string): Promise<void>;
}
