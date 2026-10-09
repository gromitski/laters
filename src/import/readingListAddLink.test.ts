import "fake-indexeddb/auto";
import { describe, expect, it, vi } from "vitest";
import {
  ADD_LINK_STORAGE_KEY, createAddLinkInstructions, enableAddLinks, importReadingListAddLink,
  MAX_ADD_LINK_LENGTH, readAddLinkCode, readReadingListAddLink, useAddLinkCode,
} from "./readingListAddLink";
import { createReadingListImportPlan } from "./readingListImport";
import { IndexedDbReadingListStore } from "../storage/indexedDbReadingListStore";

const code = "a".repeat(64);
const csv = 'url,title,readtime\nhttps://example.com/article?q=one+two&x=1#part,"Café, \"\"ideas\"\" & more",4';
const link = (data = csv, key = code) => `#add=v1&key=${key}&data=${encodeURIComponent(data)}`;

function storage() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
  };
}

describe("reading-list add-links", () => {
  it("requires deliberate setup, preserves its random code and invalidates old links on disable", () => {
    const preferences = storage();
    expect(readAddLinkCode(preferences)).toBeUndefined();
    const first = enableAddLinks(preferences);
    expect(first).toMatch(/^[a-f0-9]{64}$/u);
    expect(enableAddLinks(preferences)).toBe(first);
    preferences.removeItem(ADD_LINK_STORAGE_KEY);
    expect(() => readReadingListAddLink(link(csv, first), readAddLinkCode(preferences))).toThrow("Nothing was added");
    expect(enableAddLinks(preferences)).not.toBe(first);
  });

  it("fails closed when site storage is unavailable or contains an invalid code", () => {
    expect(readAddLinkCode({ getItem: () => { throw new Error("Denied"); } })).toBeUndefined();
    const preferences = storage();
    preferences.setItem(ADD_LINK_STORAGE_KEY, "not-a-code");
    expect(readAddLinkCode(preferences)).toBeUndefined();
    expect(() => enableAddLinks({ ...preferences, setItem: () => { throw new Error("Denied"); } })).toThrow("Denied");
  });

  it("accepts only a complete pasted code and preserves existing authorisation on invalid input", () => {
    const preferences = storage();
    useAddLinkCode(preferences, " \n" + code + "\n ");
    for (const value of ["", "not-a-code", "a".repeat(63), "a".repeat(65), "A".repeat(64), "a".repeat(32) + " " + "a".repeat(32)]) {
      expect(() => useAddLinkCode(preferences, value)).toThrow("64-character");
      expect(readAddLinkCode(preferences)).toBe(code);
    }
    expect(() => useAddLinkCode({ getItem: () => null, setItem: () => undefined }, code)).toThrow("could not be saved");
  });

  it("uses the same handoff on two explicitly paired installations with normal article sync operations", async () => {
    const desktop = storage();
    const mobile = storage();
    const sharedCode = enableAddLinks(desktop);
    const previousMobileCode = enableAddLinks(mobile);
    expect(() => readReadingListAddLink(link(csv, sharedCode), readAddLinkCode(mobile))).toThrow("Nothing was added");
    useAddLinkCode(mobile, sharedCode);
    expect(() => readReadingListAddLink(link(csv, previousMobileCode), readAddLinkCode(mobile))).toThrow("Nothing was added");
    for (const preferences of [desktop, mobile]) {
      const store = new IndexedDbReadingListStore("paired-add-link-test-" + crypto.randomUUID());
      const { result } = await importReadingListAddLink(link(csv, sharedCode), {
        readCode: () => readAddLinkCode(preferences),
        prepareImport: async (data) => createReadingListImportPlan(data, await store.listNewestFirst()),
        commitImport: (plan) => store.importNew(plan.items),
      });
      expect(result.importedItems).toHaveLength(1);
      const pending = await store.listPendingSyncOperations();
      expect(pending).toHaveLength(1);
      expect(JSON.stringify(pending)).not.toContain(sharedCode);
    }
    mobile.removeItem(ADD_LINK_STORAGE_KEY);
    expect(() => readReadingListAddLink(link(csv, sharedCode), readAddLinkCode(mobile))).toThrow("Nothing was added");
    expect(readReadingListAddLink(link(csv, sharedCode), readAddLinkCode(desktop)).csv).toBe(csv);
  });

  it("preserves Unicode, quoted CSV titles, plus signs and URL query and fragment data", () => {
    const result = readReadingListAddLink(link(), code);
    expect(result.csv).toBe(csv);
    const plan = createReadingListImportPlan(result.csv, []);
    expect(plan.items[0]).toMatchObject({
      url: "https://example.com/article?q=one+two&x=1#part",
      title: 'Café, "ideas" & more', readTimeMinutes: 4,
    });
  });

  it("accepts stricter Markdown-safe encoding for unmatched parentheses", () => {
    const data = "url,title\nhttps://example.com/article,An idea (part one";
    const encoded = encodeURIComponent(data).replace(/[!'()*]/gu,
      (character) => "%" + character.charCodeAt(0).toString(16).toUpperCase());
    expect(encoded).not.toContain("(");
    expect(readReadingListAddLink(`#add=v1&key=${code}&data=${encoded}`, code).csv).toBe(data);
  });

  it.each([
    "#add=v2&key=" + code + "&data=" + encodeURIComponent(csv),
    link() + "&extra=1",
    link() + "&key=" + code,
    "#add=v1&key=" + code,
    "#add=v1&key=" + code + "&data=%ZZ",
    "#add=v1&key=" + code + "&data=%C3",
  ])("rejects unsupported or malformed fields without disclosing input", (fragment) => {
    expect(() => readReadingListAddLink(fragment, code)).toThrow("Nothing was added");
  });

  it("bounds link length and total rows including duplicates", () => {
    expect(() => readReadingListAddLink(link() + "x".repeat(MAX_ADD_LINK_LENGTH), code)).toThrow("shorter");
    const rows = "url\n" + Array(26).fill("https://example.com/article").join("\n");
    expect(() => readReadingListAddLink(link(rows), code)).toThrow("1–25");
    expect(() => readReadingListAddLink(link("url,title"), code)).toThrow("1–25");
  });

  it.each([
    "url\njavascript:alert(1)",
    "url\nhttps://secret@example.com/article",
    "url,readtime\nhttps://example.com/article,0",
    "url\nhttps://example.com/valid\nnot a URL",
  ])("rejects the entire invalid batch before preparing or saving", async (data) => {
    const prepareImport = vi.fn();
    const commitImport = vi.fn();
    await expect(importReadingListAddLink(link(data), { readCode: () => code, prepareImport, commitImport })).rejects.toThrow();
    expect(prepareImport).not.toHaveBeenCalled();
    expect(commitImport).not.toHaveBeenCalled();
  });

  it.each([undefined, "b".repeat(64)])("rejects disabled or wrong-browser codes before any preparation", async (currentCode) => {
    const prepareImport = vi.fn();
    const commitImport = vi.fn();
    await expect(importReadingListAddLink(link(), { readCode: () => currentCode, prepareImport, commitImport })).rejects.toThrow("browser");
    expect(prepareImport).not.toHaveBeenCalled();
    expect(commitImport).not.toHaveBeenCalled();
  });

  it("checks revocation again after an asynchronous preparation", async () => {
    let activeCode: string | undefined = code;
    const commitImport = vi.fn();
    await expect(importReadingListAddLink(link(), {
      readCode: () => activeCode,
      prepareImport: async (data) => {
        const plan = createReadingListImportPlan(data, []);
        activeCode = undefined;
        return plan;
      },
      commitImport,
    })).rejects.toThrow("Nothing was added");
    expect(commitImport).not.toHaveBeenCalled();
  });

  it("rejects a pending import if pairing replaces its code during preparation", async () => {
    const preferences = storage();
    useAddLinkCode(preferences, code);
    const commitImport = vi.fn();
    await expect(importReadingListAddLink(link(), {
      readCode: () => readAddLinkCode(preferences),
      prepareImport: async (data) => {
        const plan = createReadingListImportPlan(data, []);
        useAddLinkCode(preferences, "b".repeat(64));
        return plan;
      },
      commitImport,
    })).rejects.toThrow("Nothing was added");
    expect(commitImport).not.toHaveBeenCalled();
  });

  it("adds atomically through the existing store, queues sync and preserves existing articles on replay", async () => {
    const store = new IndexedDbReadingListStore("add-link-test-" + crypto.randomUUID());
    const options = {
      readCode: () => code,
      prepareImport: async (data: string) => createReadingListImportPlan(data, await store.listNewestFirst()),
      commitImport: (plan: ReturnType<typeof createReadingListImportPlan>) => store.importNew(plan.items),
    };
    const first = await importReadingListAddLink(link(), options);
    expect(first.result.importedItems).toHaveLength(1);
    expect(await store.listPendingSyncOperations()).toHaveLength(1);
    const item = first.result.importedItems[0]!;
    await store.setTitle(item.id, "My edited title");
    await store.setBookmarked(item.id, true);
    const before = await store.listNewestFirst();
    const pending = await store.listPendingSyncOperations();
    const replay = await importReadingListAddLink(link(), options);
    expect(replay.result.importedItems).toHaveLength(0);
    expect(await store.listNewestFirst()).toEqual(before);
    expect(await store.listPendingSyncOperations()).toEqual(pending);
  });

  it("produces private portable instructions for the current host with explicit triage and encoding boundaries", () => {
    const instructions = createAddLinkInstructions("https://example.org/", code);
    expect(instructions).toContain(`https://example.org/#add=v1&key=${code}&data=`);
    expect(instructions).toContain("only the articles I accept");
    expect(instructions).toContain("encodeURIComponent(csv)");
    expect(instructions).toContain(String(MAX_ADD_LINK_LENGTH));
    expect(instructions).toContain("never guess");
    expect(instructions).toContain("CSV as a fallback");
  });
});
