import { isSavedItem, type SavedItem } from "../domain/savedItem";

export type SavedItemSyncAction = "add" | "update" | "restore";
let lastOperationTime = 0;

export type ReadingListSyncOperation =
  | {
      operationId: string;
      type: SavedItemSyncAction;
      occurredAt: number;
      item: SavedItem;
    }
  | {
      operationId: string;
      type: "delete";
      occurredAt: number;
      itemId: string;
    };

export function createSavedItemSyncOperation(
  type: SavedItemSyncAction,
  item: SavedItem,
  options: { createId?: () => string; now?: () => number } = {},
): ReadingListSyncOperation {
  return {
    operationId: (options.createId ?? (() => crypto.randomUUID()))(),
    type,
    occurredAt: (options.now ?? monotonicNow)(),
    item: { ...item },
  };
}

export function createDeleteSyncOperation(
  itemId: string,
  options: { createId?: () => string; now?: () => number } = {},
): ReadingListSyncOperation {
  return {
    operationId: (options.createId ?? (() => crypto.randomUUID()))(),
    type: "delete",
    occurredAt: (options.now ?? monotonicNow)(),
    itemId,
  };
}

export function isReadingListSyncOperation(value: unknown): value is ReadingListSyncOperation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ReadingListSyncOperation> & { item?: unknown };

  if (
    typeof candidate.operationId !== "string" ||
    !/^[A-Za-z0-9_-]{1,128}$/u.test(candidate.operationId) ||
    typeof candidate.occurredAt !== "number" ||
    !Number.isFinite(candidate.occurredAt) ||
    candidate.occurredAt < 0
  ) {
    return false;
  }

  if (candidate.type === "delete") {
    return typeof candidate.itemId === "string" && candidate.itemId.length > 0;
  }

  return (
    (candidate.type === "add" ||
      candidate.type === "update" ||
      candidate.type === "restore") &&
    isSavedItem(candidate.item)
  );
}

export function applyReadingListSyncOperations(
  baseItems: SavedItem[],
  operations: ReadingListSyncOperation[],
): SavedItem[] {
  const items = new Map(baseItems.map((item) => [item.id, { ...item }]));
  const deletedIds = new Set<string>();
  const orderedOperations = [...operations].sort(compareOperations);

  for (const operation of orderedOperations) {
    if (operation.type === "delete") {
      items.delete(operation.itemId);
      deletedIds.add(operation.itemId);
      continue;
    }

    if (operation.type === "restore") {
      deletedIds.delete(operation.item.id);
      items.set(operation.item.id, { ...operation.item });
      continue;
    }

    if (deletedIds.has(operation.item.id)) {
      continue;
    }

    if (operation.type === "add" || items.has(operation.item.id)) {
      items.set(operation.item.id, { ...operation.item });
    }
  }

  return [...items.values()].sort(
    (left, right) => right.savedAt - left.savedAt || right.id.localeCompare(left.id),
  );
}

function compareOperations(
  left: ReadingListSyncOperation,
  right: ReadingListSyncOperation,
): number {
  return left.occurredAt - right.occurredAt || left.operationId.localeCompare(right.operationId);
}

function monotonicNow(): number {
  lastOperationTime = Math.max(Date.now(), lastOperationTime + 1);
  return lastOperationTime;
}
