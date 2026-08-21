import type { SavedItem } from "../domain/savedItem";

export interface ReadingListStore {
  save(item: SavedItem): Promise<void>;
  listNewestFirst(): Promise<SavedItem[]>;
  delete(id: string): Promise<void>;
}
