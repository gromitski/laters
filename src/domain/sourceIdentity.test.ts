import { describe, expect, it } from "vitest";
import { normaliseSourceHostname } from "./sourceIdentity";

describe("normaliseSourceHostname", () => {
  it.each([
    ["https://WWW.Example.com/article", "example.com"],
    ["https://www.news.example.com./article", "news.example.com"],
    ["https://example.com:8443/article", "example.com"],
  ])("normalises the source for %s", (url, expected) => {
    expect(normaliseSourceHostname(url)).toBe(expected);
  });

  it("removes only one leading www label", () => {
    expect(normaliseSourceHostname("https://www.www.example.com/article")).toBe(
      "www.example.com",
    );
  });
});
