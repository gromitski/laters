import { describe, expect, it } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import { createReadingListEntries, groupReadingListEntries } from "./readingListPresentation";
import { countVisibleReadingListItems, filterReadingListEntries } from "./readingListFilter";

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

  it("orders oldest first with deterministic ascending ties without mutating saved data", () => {
    const items = [item("new", 300), item("b", 100), item("a", 100)];
    const before = structuredClone(items);
    expect(createReadingListEntries(items, undefined, "oldest").map(e => e.item.id))
      .toEqual(["a", "b", "new"]);
    expect(createReadingListEntries(items).map(e => e.item.id)).toEqual(["new", "b", "a"]);
    expect(items).toEqual(before);
  });

  it("keeps a deletion ghost in oldest-first position across Search and Bookmarks", () => {
    const kept = { ...item("old", 100), bookmarked: true };
    const ghost = item("middle", 200);
    const entries = createReadingListEntries([item("new", 300), kept], ghost, "oldest");
    expect(entries.map(e => [e.item.id, e.isGhost])).toEqual([
      ["old", false], ["middle", true], ["new", false],
    ]);
    expect(filterReadingListEntries(entries, "bookmarked", "old").map(e => e.item.id))
      .toEqual(["old", "middle"]);
    expect(countVisibleReadingListItems(entries, "bookmarked", "old")).toBe(1);
    expect(createReadingListEntries([item("new", 300), ghost, kept], undefined, "oldest")
      .map(e => e.item.id)).toEqual(["old", "middle", "new"]);
  });
});

describe("publisher grouping", () => {
  it("groups normalised hosts alphabetically and retains newest-first deterministic ties", () => {
    const items = [
      { ...item("z", 100), url: "https://www.Zebra.example./one" },
      { ...item("a", 300), url: "https://alpha.example/one" },
      { ...item("b", 300), url: "https://www.alpha.example/two" },
      { ...item("older", 100), url: "https://ALPHA.example/three" },
      { ...item("sub", 200), url: "https://news.alpha.example/four" },
    ];
    const snapshot = structuredClone(items);
    const groups = groupReadingListEntries(createReadingListEntries(items));
    expect(groups.map(({ hostname, entries }) => [hostname, entries.map(e => e.item.id)]))
      .toEqual([
        ["alpha.example", ["b", "a", "older"]],
        ["news.alpha.example", ["sub"]],
        ["zebra.example", ["z"]],
      ]);
    expect(items).toEqual(snapshot);
  });

  it("composes with Search/Bookmarks and retains a ghost-only publisher without counting it", () => {
    const kept = { ...item("kept", 100), url: "https://alpha.example/one", bookmarked: true };
    const other = { ...item("other", 200), url: "https://beta.example/two" };
    const ghost = { ...item("ghost", 300), url: "https://zebra.example/three" };
    const entries = filterReadingListEntries(createReadingListEntries([kept, other], ghost), "bookmarked", "alpha");
    const groups = groupReadingListEntries(entries);
    expect(groups.map(g => g.hostname)).toEqual(["alpha.example", "zebra.example"]);
    expect(groups[1]!.entries[0]!.isGhost).toBe(true);
    expect(countVisibleReadingListItems(groups.flatMap(g => g.entries), "bookmarked", "alpha")).toBe(1);
  });

  it("restores an article to its publisher position without changing the default newest-first order", () => {
    const first = { ...item("first", 400), url: "https://zebra.example/one" };
    const restored = { ...item("restored", 300), url: "https://alpha.example/two" };
    const last = { ...item("last", 100), url: "https://alpha.example/three" };
    const entries = createReadingListEntries([last, restored, first]);
    expect(groupReadingListEntries(entries).flatMap(g => g.entries).map(e => e.item.id))
      .toEqual(["restored", "last", "first"]);
    expect(entries.map(e => e.item.id)).toEqual(["first", "restored", "last"]);
  });

  it("handles empty, single-publisher and no-match lists without empty groups", () => {
    expect(groupReadingListEntries([])).toEqual([]);
    const entries = createReadingListEntries([item("one", 100), item("two", 200)]);
    expect(groupReadingListEntries(entries)).toHaveLength(1);
    expect(groupReadingListEntries(filterReadingListEntries(entries, "all", "absent"))).toEqual([]);
  });
});
