import { describe, expect, it } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import { createReadingListCsv } from "../export/readingListExport";
import {
  createReadingListImportPlan,
  MAX_IMPORT_ARTICLE_ROWS,
  MAX_IMPORT_FILE_BYTES,
  readReadingListImportFile,
} from "./readingListImport";

describe("reading-list CSV import", () => {
  it("round-trips the complete Laters v1 export contract", () => {
    const sourceItems: SavedItem[] = [
      {
        id: "source-newer",
        url: "https://example.com/newer",
        title: "=Remember this",
        savedAt: 1_800_000_000_000,
        readTimeMinutes: 7,
        bookmarked: true,
        titleEdited: true,
      },
      {
        id: "source-older",
        url: "https://example.com/older",
        title: "Older article",
        savedAt: 1_700_000_000_000,
      },
    ];
    const ids = ["imported-newer", "imported-older"];

    const plan = createReadingListImportPlan(createReadingListCsv(sourceItems), [], {
      createId: () => ids.shift()!,
      now: () => 1_900_000_000_000,
    });

    expect(plan).toMatchObject({
      newArticleCount: 2,
      existingArticleCount: 0,
      duplicateRowCount: 0,
      ignoredColumnCount: 0,
      ignoredTagCount: 0,
      totalArticleCount: 2,
    });
    expect(plan.items).toEqual([
      { ...sourceItems[0], id: "imported-newer" },
      { ...sourceItems[1], id: "imported-older" },
    ]);
  });

  it("imports a generic URL-only CSV with hostname titles and file-order times", () => {
    let nextId = 0;
    const plan = createReadingListImportPlan(
      "url\nhttps://www.example.com/first\nhttps://example.org/second\n",
      [],
      {
        createId: () => `id-${nextId++}`,
        now: () => 1_000,
      },
    );

    expect(plan.items).toEqual([
      {
        id: "id-0",
        url: "https://www.example.com/first",
        title: "example.com",
        savedAt: 1_000,
      },
      {
        id: "id-1",
        url: "https://example.org/second",
        title: "example.org",
        savedAt: 999,
      },
    ]);
  });

  it("imports optional reading times while leaving blank values absent", () => {
    const ids = ["with-time", "without-time"];
    const plan = createReadingListImportPlan(
      [
        "url,title,readtime",
        "https://example.com/with,With estimate, 12 ",
        "https://example.com/without,Without estimate,",
      ].join("\n"),
      [],
      { createId: () => ids.shift()!, now: () => 100 },
    );

    expect(plan.ignoredColumnCount).toBe(0);
    expect(plan.items[0]).toMatchObject({ readTimeMinutes: 12 });
    expect(plan.items[1]).not.toHaveProperty("readTimeMinutes");
  });

  it("recognises columns in any case and order while reporting ignored data", () => {
    const plan = createReadingListImportPlan(
      '\uFEFFNotes,TAGS,TITLE,URL,CREATED\n"private note","reading, laters-bookmarked","An article","https://example.com/article","2026-08-25T12:00:00Z"',
      [],
      { createId: () => "imported" },
    );

    expect(plan).toMatchObject({
      ignoredColumnCount: 1,
      ignoredTagCount: 1,
      newArticleCount: 1,
    });
    expect(plan.items[0]).toEqual({
      id: "imported",
      url: "https://example.com/article",
      title: "An article",
      savedAt: Date.parse("2026-08-25T12:00:00Z"),
      bookmarked: true,
    });
  });

  it("ignores credentials and private implementation columns", () => {
    const plan = createReadingListImportPlan(
      "url,title,accessToken,operationId,remoteFileId\nhttps://example.com/article,Article,secret-token,private-operation,drive-file",
      [],
      { createId: () => "fresh-private-id", now: () => 100 },
    );

    expect(plan.ignoredColumnCount).toBe(3);
    expect(JSON.stringify(plan.items)).not.toContain("secret-token");
    expect(JSON.stringify(plan.items)).not.toContain("private-operation");
    expect(JSON.stringify(plan.items)).not.toContain("drive-file");
    expect(plan.items[0]?.id).toBe("fresh-private-id");
  });

  it("preserves quoted commas, quotation marks and line breaks", () => {
    const plan = createReadingListImportPlan(
      'url,title\r\n"https://example.com/article","A ""quoted"", two-line\narticle"\r\n',
      [],
      { createId: () => "quoted", now: () => 100 },
    );

    expect(plan.items[0]?.title).toBe('A "quoted", two-line\narticle');
  });

  it("skips current-list and repeated-file URLs without overwriting anything", () => {
    const existing = item("existing", "https://example.com/existing", 500);
    const plan = createReadingListImportPlan(
      [
        "url,title",
        "https://example.com/existing,Replacement title",
        "https://example.com/new,First new title",
        "https://example.com/new,Second new title",
      ].join("\n"),
      [existing],
      { createId: () => "new-id", now: () => 1_000 },
    );

    expect(plan).toMatchObject({
      newArticleCount: 1,
      existingArticleCount: 1,
      duplicateRowCount: 1,
      totalArticleCount: 3,
    });
    expect(plan.items[0]).toMatchObject({
      id: "new-id",
      title: "First new title",
      url: "https://example.com/new",
    });
  });

  it("does not remove an apostrophe without the protected-title tag", () => {
    const plan = createReadingListImportPlan(
      "url,title,tags\nhttps://example.com/article,'=Literal,\n",
      [],
      { createId: () => "literal", now: () => 100 },
    );

    expect(plan.items[0]?.title).toBe("'=Literal");
  });

  it("rejects every invalid row together instead of returning a partial plan", () => {
    expect(() =>
      createReadingListImportPlan(
        [
          "url,title,created",
          "javascript:alert(1),Unsafe,2026-08-25T12:00:00Z",
          "https://example.com/article,Valid,not-a-time",
        ].join("\n"),
        [],
      ),
    ).toThrow(/Nothing was imported.*row 2.*row 3/u);
  });

  it("validates duplicate and existing-URL rows even though they would be skipped", () => {
    const existing = item("existing", "https://example.com/existing", 500);

    expect(() =>
      createReadingListImportPlan(
        [
          "url,title,created",
          "https://example.com/new,New article,2026-08-25T12:00:00Z",
          "https://example.com/new,Repeated article,not-a-time",
          "https://example.com/existing,Existing article,also-not-a-time",
        ].join("\n"),
        [existing],
      ),
    ).toThrow(/row 3.*row 4/u);
  });

  it.each([
    ["missing URL header", "title\nArticle", /must include a "url" column/u],
    ["duplicate header", "url,URL\nhttps://example.com,ignored", /duplicate column/u],
    ["unclosed quote", 'url,title\nhttps://example.com,"Article', /unclosed quoted/u],
    [
      "inconsistent protected title",
      "url,title,tags\nhttps://example.com,Article,laters-protected-title",
      /protected-title tag/u,
    ],
    [
      "impossible calendar time",
      "url,created\nhttps://example.com,2026-02-31T25:00:00Z",
      /invalid created time/u,
    ],
    [
      "zero readtime",
      "url,readtime\nhttps://example.com,0",
      /invalid readtime/u,
    ],
    [
      "fractional readtime",
      "url,readtime\nhttps://example.com,4.5",
      /invalid readtime/u,
    ],
    [
      "labelled readtime",
      "url,readtime\nhttps://example.com,7 min",
      /invalid readtime/u,
    ],
  ])("rejects %s", (_case, csv, expected) => {
    expect(() => createReadingListImportPlan(csv, [])).toThrow(expected);
  });

  it("rejects files over the article-row limit", () => {
    const rows = Array.from(
      { length: MAX_IMPORT_ARTICLE_ROWS + 1 },
      (_, index) => `https://example.com/${index}`,
    );

    expect(() =>
      createReadingListImportPlan(["url", ...rows].join("\n"), []),
    ).toThrow("more than 1,000 article rows");
  });
});

describe("reading-list import files", () => {
  it("reads a local UTF-8 CSV file", async () => {
    const file = new File(["url\nhttps://example.com"], "reading-list.CSV", {
      type: "text/csv",
    });

    await expect(readReadingListImportFile(file)).resolves.toContain("https://example.com");
  });

  it("rejects a non-CSV filename", async () => {
    await expect(
      readReadingListImportFile(new File(["url"], "reading-list.txt")),
    ).rejects.toThrow("Choose a CSV file");
  });

  it("rejects a file over 10 MB before reading it", async () => {
    const file = new File(
      [new Uint8Array(MAX_IMPORT_FILE_BYTES + 1)],
      "too-large.csv",
    );

    await expect(readReadingListImportFile(file)).rejects.toThrow("no larger than 10 MB");
  });

  it("rejects bytes that are not valid UTF-8", async () => {
    const file = new File([new Uint8Array([0xc3, 0x28])], "invalid.csv");

    await expect(readReadingListImportFile(file)).rejects.toThrow("valid UTF-8");
  });
});

function item(id: string, url: string, savedAt: number): SavedItem {
  return { id, url, savedAt, title: `Article ${id}`, bookmarked: true };
}
