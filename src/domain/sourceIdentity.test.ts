import { describe, expect, it } from "vitest";
import {
  createSourceIdentity,
  deriveSourceCharacters,
  hashSourceHostname,
  normaliseSourceHostname,
  SOURCE_COLOURS,
} from "./sourceIdentity";

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

describe("deriveSourceCharacters", () => {
  it.each([
    ["theverge.com", "TH"],
    ["aeon.co", "AE"],
    ["x.com", "XC"],
    ["9to5google.com", "9T"],
  ])("derives stable characters from %s", (hostname, expected) => {
    expect(deriveSourceCharacters(hostname)).toBe(expected);
  });
});

describe("hashSourceHostname", () => {
  it("uses stable unsigned 32-bit FNV-1a over UTF-8", () => {
    expect(hashSourceHostname("example.com")).toBe(1_125_968_678);
    expect(hashSourceHostname("aeon.co")).toBe(2_165_596_714);
  });
});

describe("createSourceIdentity", () => {
  it("uses one normalised hostname for its text, characters and palette", () => {
    expect(createSourceIdentity("https://WWW.Example.com:8443/story")).toEqual({
      hostname: "example.com",
      characters: "EX",
      colour: SOURCE_COLOURS[2],
      faviconUrl: "https://www.example.com:8443/favicon.ico",
    });
  });

  it("preserves the article scheme and port but not its path, query or fragment", () => {
    expect(createSourceIdentity("http://news.example.com:8080/a?private=yes#section").faviconUrl).toBe(
      "http://news.example.com:8080/favicon.ico",
    );
  });
});
