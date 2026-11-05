import type { SavedItem } from "../domain/savedItem";
import { normaliseSourceHostname } from "../domain/sourceIdentity";

export type ReadingListOrder = "newest" | "oldest" | "publisher";

export interface PublisherGroup {
  hostname: string;
  entries: ReadingListEntry[];
}

export interface ReadingListEntry {
  item: SavedItem;
  isGhost: boolean;
}

export function groupReadingListEntries(entries: ReadingListEntry[]): PublisherGroup[] {
  const groups = new Map<string, ReadingListEntry[]>();
  for (const entry of entries) {
    const hostname = normaliseSourceHostname(entry.item.url);
    const group = groups.get(hostname) ?? [];
    group.push(entry);
    groups.set(hostname, group);
  }
  return [...groups].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([hostname, group]) => ({
      hostname,
      entries: [...group].sort((left, right) =>
        right.item.savedAt - left.item.savedAt || right.item.id.localeCompare(left.item.id)),
    }));
}

export function createReadingListEntries(
  items: SavedItem[],
  pendingItem?: SavedItem,
  order: "newest" | "oldest" = "newest",
): ReadingListEntry[] {
  const entries = items.map((item) => ({ item, isGhost: false }));

  if (pendingItem && !items.some((item) => item.id === pendingItem.id)) {
    entries.push({ item: pendingItem, isGhost: true });
  }

  return entries.sort(
    (left, right) =>
      order === "oldest"
        ? left.item.savedAt - right.item.savedAt || left.item.id.localeCompare(right.item.id)
        : right.item.savedAt - left.item.savedAt || right.item.id.localeCompare(left.item.id),
  );
}
