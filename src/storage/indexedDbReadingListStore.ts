import { isSavedItem, type SavedItem } from "../domain/savedItem";
import type { ReadingListStore } from "./readingListStore";

const DATABASE_VERSION = 1;
const ITEM_STORE = "saved-items";

export class IndexedDbReadingListStore implements ReadingListStore {
  constructor(private readonly databaseName = "laters") {}

  async save(item: SavedItem): Promise<void> {
    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(ITEM_STORE, "readwrite");
      transaction.objectStore(ITEM_STORE).put(item);
      await waitForTransaction(transaction);
    } finally {
      database.close();
    }
  }

  async listNewestFirst(): Promise<SavedItem[]> {
    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(ITEM_STORE, "readonly");
      const request = transaction.objectStore(ITEM_STORE).getAll();
      const records = await waitForRequest(request);
      await waitForTransaction(transaction);

      if (!records.every(isSavedItem)) {
        throw new Error("Saved article data is invalid.");
      }

      return [...records].sort(
        (left, right) => right.savedAt - left.savedAt || right.id.localeCompare(left.id),
      );
    } finally {
      database.close();
    }
  }

  async setBookmarked(id: string, bookmarked: boolean): Promise<SavedItem> {
    if (!id) {
      throw new Error("A saved article identifier is required.");
    }

    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(ITEM_STORE, "readwrite");
      const itemStore = transaction.objectStore(ITEM_STORE);
      const currentItem = await waitForRequest(itemStore.get(id));

      if (!isSavedItem(currentItem)) {
        transaction.abort();
        throw new Error("The saved article could not be found.");
      }

      const updatedItem = { ...currentItem, bookmarked };
      itemStore.put(updatedItem);
      await waitForTransaction(transaction);
      return updatedItem;
    } finally {
      database.close();
    }
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error("A saved article identifier is required.");
    }

    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(ITEM_STORE, "readwrite");
      transaction.objectStore(ITEM_STORE).delete(id);
      await waitForTransaction(transaction);
    } finally {
      database.close();
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(ITEM_STORE)) {
          database.createObjectStore(ITEM_STORE, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Could not open local storage."));
      request.onblocked = () => reject(new Error("Local storage is blocked by another app window."));
    });
  }
}

function waitForRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local storage request failed."));
  });
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Local storage update was cancelled."));
    transaction.onerror = () => reject(transaction.error ?? new Error("Local storage update failed."));
  });
}
