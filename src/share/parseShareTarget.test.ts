import { describe, expect, it } from "vitest";
import { SavedItemValidationError } from "../domain/savedItem";
import { parseShareTarget } from "./parseShareTarget";

describe("parseShareTarget", () => {
  it("uses explicit URL and title fields when both are valid", () => {
    expect(
      parseShareTarget({
        title: "A useful article",
        text: "Optional description",
        url: "https://example.com/read",
      }),
    ).toEqual({
      title: "A useful article",
      url: "https://example.com/read",
    });
  });

  it("extracts an Android-style URL from the text field", () => {
    expect(
      parseShareTarget({
        title: "Tomatoes in August",
        text: "Worth reading https://example.com/tomatoes.",
      }),
    ).toEqual({
      title: "Tomatoes in August",
      url: "https://example.com/tomatoes",
    });
  });

  it("preserves balanced parentheses that are part of a shared URL", () => {
    expect(
      parseShareTarget({
        text: "https://en.wikipedia.org/wiki/Function_(mathematics)",
      }),
    ).toEqual({
      title: "en.wikipedia.org",
      url: "https://en.wikipedia.org/wiki/Function_(mathematics)",
    });
  });

  it("removes unmatched closing punctuation from a shared URL", () => {
    expect(
      parseShareTarget({
        text: "Read (https://example.com/article).",
      }),
    ).toEqual({
      title: "Read",
      url: "https://example.com/article",
    });
  });

  it("uses useful surrounding text when no separate title is supplied", () => {
    expect(
      parseShareTarget({
        text: "A thoughtful long read — https://example.com/essay",
      }),
    ).toEqual({
      title: "A thoughtful long read",
      url: "https://example.com/essay",
    });
  });

  it("falls back to the hostname without fetching page metadata", () => {
    expect(parseShareTarget({ text: "https://www.example.com/read" })).toEqual({
      title: "example.com",
      url: "https://www.example.com/read",
    });
  });

  it("rejects shares without a valid HTTP or HTTPS URL", () => {
    expect(() =>
      parseShareTarget({ title: "Unsafe", text: "javascript:alert(1)" }),
    ).toThrow(SavedItemValidationError);
  });
});
