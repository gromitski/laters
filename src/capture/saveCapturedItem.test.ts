import { describe, expect, it, vi } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import { saveCapturedItem } from "./saveCapturedItem";

describe("saveCapturedItem", () => {
  it("saves a new capture at the top of the returned list", async () => {
    const older = item("older", "https://example.com/older", 100);
    const candidate = item("new", "https://example.com/new", 200);
    const save = vi.fn(async () => undefined);

    await expect(
      saveCapturedItem(candidate, {
        listNewestFirst: async () => [older],
        save,
      }),
    ).resolves.toEqual({ item: candidate, items: [candidate, older], wasDuplicate: false });
    expect(save).toHaveBeenCalledWith(candidate);
  });

  it.each([undefined, false, true])(
    "refreshes a duplicate while preserving bookmark state %s",
    async (bookmarked) => {
      const existing = {
        ...item("existing", "https://example.com/same", 100),
        ...(bookmarked === undefined ? {} : { bookmarked }),
      };
      const candidate = item("new-id", "https://example.com/same", 200);
      const save = vi.fn(async () => undefined);

      const result = await saveCapturedItem(candidate, {
        listNewestFirst: async () => [existing],
        save,
      });

      expect(result.wasDuplicate).toBe(true);
      expect(result.item).toEqual({
        ...candidate,
        id: "existing",
        ...(bookmarked === undefined ? {} : { bookmarked }),
      });
      expect(result.items).toEqual([result.item]);
      expect(save).toHaveBeenCalledWith(result.item);
    },
  );

  it("preserves a deliberately edited title when the exact URL is captured again", async () => {
    const existing = {
      ...item("existing", "https://example.com/same", 100),
      title: "My remembered title",
      titleEdited: true,
      bookmarked: true,
    };
    const candidate = item("new-id", "https://example.com/same", 200);

    const result = await saveCapturedItem(candidate, {
      listNewestFirst: async () => [existing],
      save: async () => undefined,
    });

    expect(result.item).toEqual({
      ...candidate,
      id: "existing",
      title: "My remembered title",
      titleEdited: true,
      bookmarked: true,
    });
  });
});

function item(id: string, url: string, savedAt: number): SavedItem {
  return { id, url, savedAt, title: `Article ${id}` };
}
