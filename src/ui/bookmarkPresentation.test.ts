import { describe, expect, it } from "vitest";
import { getBookmarkControlState } from "./bookmarkPresentation";

describe("getBookmarkControlState", () => {
  it("describes an unbookmarked article as an available action", () => {
    expect(getBookmarkControlState("A useful article", false)).toEqual({
      label: "Bookmark “A useful article”",
      pressed: false,
    });
  });

  it("describes a bookmarked article as a pressed removal action", () => {
    expect(getBookmarkControlState("A useful article", true)).toEqual({
      label: "Remove bookmark from “A useful article”",
      pressed: true,
    });
  });
});
