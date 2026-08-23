import {
  isSavedItem,
  normaliseArticleTitle,
  type SavedItem,
} from "../domain/savedItem";
import type { ReadingListStore } from "./readingListStore";
import {
  createDeleteSyncOperation,
  createSavedItemSyncOperation,
  isReadingListSyncOperation,
  type ReadingListSyncOperation,
  type SavedItemSyncAction,
} from "../sync/readingListSyncOperation";

const DATABASE_VERSION = 2;
const ITEM_STORE = "saved-items";
const SYNC_OPERATION_STORE = "pending-sync-operations";

export class IndexedDbReadingListStore implements ReadingListStore {
  constructor(private readonly databaseName = "laters") {}

  async save(item: SavedItem, syncAction: SavedItemSyncAction = "add"): Promise<void> {
    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(
        [ITEM_STORE, SYNC_OPERATION_STORE],
        "readwrite",
      );
      transaction.objectStore(ITEM_STORE).put(item);
      transaction
        .objectStore(SYNC_OPERATION_STORE)
        .put(createSavedItemSyncOperation(syncAction, item));
      await waitForTransaction(transaction);
    } finally {
      database.close();
    }
  }

  async restore(item: SavedItem): Promise<void> {
    return this.save(item, "restore");
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

  async replaceAll(items: SavedItem[]): Promise<void> {
    if (!items.every(isSavedItem)) {
      throw new Error("Replacement article data is invalid.");
    }

    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(ITEM_STORE, "readwrite");
      const itemStore = transaction.objectStore(ITEM_STORE);
      itemStore.clear();
      items.forEach((item) => itemStore.put(item));
      await waitForTransaction(transaction);
    } finally {
      database.close();
    }
  }

  async listPendingSyncOperations(): Promise<ReadingListSyncOperation[]> {
    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(SYNC_OPERATION_STORE, "readonly");
      const operations = await waitForRequest(
        transaction.objectStore(SYNC_OPERATION_STORE).getAll(),
      );
      await waitForTransaction(transaction);

      if (!operations.every(isReadingListSyncOperation)) {
        throw new Error("Pending sync data is invalid.");
      }

      return operations.sort(
        (left, right) =>
          left.occurredAt - right.occurredAt ||
          left.operationId.localeCompare(right.operationId),
      );
    } finally {
      database.close();
    }
  }

  async removePendingSyncOperations(operationIds: string[]): Promise<void> {
    if (operationIds.length === 0) {
      return;
    }

    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(SYNC_OPERATION_STORE, "readwrite");
      const operationStore = transaction.objectStore(SYNC_OPERATION_STORE);
      operationIds.forEach((operationId) => operationStore.delete(operationId));
      await waitForTransaction(transaction);
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
      const transaction = database.transaction(
        [ITEM_STORE, SYNC_OPERATION_STORE],
        "readwrite",
      );
      const itemStore = transaction.objectStore(ITEM_STORE);
      const currentItem = await waitForRequest(itemStore.get(id));

      if (!isSavedItem(currentItem)) {
        transaction.abort();
        throw new Error("The saved article could not be found.");
      }

      const updatedItem = { ...currentItem, bookmarked };
      itemStore.put(updatedItem);
      transaction
        .objectStore(SYNC_OPERATION_STORE)
        .put(createSavedItemSyncOperation("update", updatedItem));
      await waitForTransaction(transaction);
      return updatedItem;
    } finally {
      database.close();
    }
  }

  async setTitle(id: string, title: string): Promise<SavedItem> {
    if (!id) {
      throw new Error("A saved article identifier is required.");
    }

    const nextTitle = normaliseArticleTitle(title);
    const database = await this.openDatabase();

    try {
      const transaction = database.transaction(
        [ITEM_STORE, SYNC_OPERATION_STORE],
        "readwrite",
      );
      const itemStore = transaction.objectStore(ITEM_STORE);
      const currentItem = await waitForRequest(itemStore.get(id));

      if (!isSavedItem(currentItem)) {
        transaction.abort();
        throw new Error("The saved article could not be found.");
      }

      const updatedItem = { ...currentItem, title: nextTitle, titleEdited: true };
      itemStore.put(updatedItem);
      transaction
        .objectStore(SYNC_OPERATION_STORE)
        .put(createSavedItemSyncOperation("update", updatedItem));
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
      const transaction = database.transaction(
        [ITEM_STORE, SYNC_OPERATION_STORE],
        "readwrite",
      );
      transaction.objectStore(ITEM_STORE).delete(id);
      transaction
        .objectStore(SYNC_OPERATION_STORE)
        .put(createDeleteSyncOperation(id));
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

        if (!database.objectStoreNames.contains(SYNC_OPERATION_STORE)) {
          database.createObjectStore(SYNC_OPERATION_STORE, { keyPath: "operationId" });
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
