import { describe, expect, it } from "vitest";
import { shouldActivateArticleRow, type ArticleRowActivationContext } from "./articleRowActivation";

const primaryRowClick: ArticleRowActivationContext = {
  button: 0,
  defaultPrevented: false,
  targetIsInteractive: false,
  hasSelectedText: false,
};

describe("shouldActivateArticleRow", () => {
  it("accepts a primary click on non-interactive row space", () => {
    expect(shouldActivateArticleRow(primaryRowClick)).toBe(true);
  });

  it.each([
    ["a non-primary click", { button: 1 }],
    ["an already prevented event", { defaultPrevented: true }],
    ["an interactive descendant", { targetIsInteractive: true }],
    ["selected row text", { hasSelectedText: true }],
  ])("rejects %s", (_description, override) => {
    expect(shouldActivateArticleRow({ ...primaryRowClick, ...override })).toBe(false);
  });
});
