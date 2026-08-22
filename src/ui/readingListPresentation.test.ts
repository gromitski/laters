import { describe, expect, it } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import { createReadingListEntries } from "./readingListPresentation";

function item(id: string, savedAt: number): SavedItem {
  return {
    id,
    savedAt,
    title: `Article ${id}`,
    url: `https://example.com/${id}`,
  };
}

describe("createReadingListEntries", () => {
  it("keeps a deleted item in its deterministic list position as a ghost", () => {
    const entries = createReadingListEntries(
      [item("new", 300), item("old", 100)],
      item("middle", 200),
    );

    expect(entries.map(({ item: entry, isGhost }) => [entry.id, isGhost])).toEqual([
      ["new", false],
      ["middle", true],
      ["old", false],
    ]);
  });

  it("does not duplicate a pending item that is still in the stored list", () => {
    const pendingItem = item("same", 100);

    expect(createReadingListEntries([pendingItem], pendingItem)).toEqual([
      { item: pendingItem, isGhost: false },
    ]);
  });

  it("keeps complete bookmark state on a deleted ghost item", () => {
    const pendingItem = { ...item("bookmarked", 100), bookmarked: true };

    expect(createReadingListEntries([], pendingItem)).toEqual([
      { item: pendingItem, isGhost: true },
    ]);
  });
});
