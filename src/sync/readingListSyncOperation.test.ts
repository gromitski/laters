import { describe, expect, it } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import {
  applyReadingListSyncOperations,
  createDeleteSyncOperation,
  createSavedItemSyncOperation,
  isReadingListSyncOperation,
} from "./readingListSyncOperation";

describe("reading-list sync operations", () => {
  it("combines additions from different devices deterministically", () => {
    expect(
      applyReadingListSyncOperations(
        [article("base", 100)],
        [
          createSavedItemSyncOperation("add", article("phone", 200), fixed("phone-op", 20)),
          createSavedItemSyncOperation("add", article("desktop", 300), fixed("desktop-op", 10)),
        ],
      ),
    ).toEqual([article("desktop", 300), article("phone", 200), article("base", 100)]);
  });

  it("keeps a deletion effective against a later ordinary stale update", () => {
    const original = article("deleted", 100);
    const operations = [
      createDeleteSyncOperation(original.id, fixed("delete-op", 10)),
      createSavedItemSyncOperation(
        "update",
        { ...original, bookmarked: true },
        fixed("stale-update", 20),
      ),
    ];

    expect(applyReadingListSyncOperations([original], operations)).toEqual([]);
  });

  it("allows an explicit Undo restore to revive the same identifier", () => {
    const original = article("restored", 100);
    const operations = [
      createDeleteSyncOperation(original.id, fixed("delete-op", 10)),
      createSavedItemSyncOperation("restore", original, fixed("restore-op", 20)),
    ];

    expect(applyReadingListSyncOperations([original], operations)).toEqual([original]);
  });

  it("validates operation payloads", () => {
    expect(
      isReadingListSyncOperation(
        createSavedItemSyncOperation("add", article("valid", 100), fixed("valid-op", 10)),
      ),
    ).toBe(true);
    expect(
      isReadingListSyncOperation({ operationId: "bad", type: "delete", occurredAt: 10 }),
    ).toBe(false);
  });
});

function article(id: string, savedAt: number): SavedItem {
  return { id, title: `Article ${id}`, url: `https://example.com/${id}`, savedAt };
}

function fixed(operationId: string, occurredAt: number) {
  return { createId: () => operationId, now: () => occurredAt };
}
