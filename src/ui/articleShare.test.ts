import { describe, expect, it } from "vitest";
import { createArticleShareData } from "./articleShare";

describe("createArticleShareData", () => {
  it("shares only the article URL", () => {
    expect(createArticleShareData("https://example.com/article")).toEqual({
      url: "https://example.com/article",
    });
  });
});
