import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import { IndexedDbReadingListStore } from "../storage/indexedDbReadingListStore";
import {
  createReadingListCsv,
  createReadingListExportFileName,
  exportReadingList,
  type ReadingListExportEnvironment,
} from "./readingListExport";

const databases: string[] = [];

afterEach(async () => {
  await Promise.all(databases.splice(0).map(deleteDatabase));
});

describe("reading-list CSV export", () => {
  it("creates a newest-first portable CSV with recovery tags", () => {
    expect(
      createReadingListCsv([
        item("older", 1_700_000_000_000),
        {
          ...item("newer", 1_800_000_000_000),
          readTimeMinutes: 7,
          bookmarked: true,
          titleEdited: true,
        },
      ]),
    ).toBe(
      [
        "url,title,created,tags,readtime",
        '"https://example.com/newer","Article newer","2027-01-15T08:00:00.000Z","laters-bookmarked, laters-title-edited","7"',
        '"https://example.com/older","Article older","2023-11-14T22:13:20.000Z","",""',
        "",
      ].join("\r\n"),
    );
  });

  it("escapes commas, quotes and line breaks without changing their text", () => {
    const csv = createReadingListCsv([
      {
        ...item("escaped", 1_700_000_000_000),
        title: 'A "quoted", two-line\narticle',
      },
    ]);

    expect(csv).toContain('"A ""quoted"", two-line\narticle"');
  });

  it.each(["=1+1", "+SUM(A1:A2)", "-2+3", "@danger"])(
    "neutralises a spreadsheet formula title while marking it as reversible: %s",
    (title) => {
      const csv = createReadingListCsv([{ ...item("protected", 1), title }]);

      expect(csv).toContain(`,"'${title}",`);
      expect(csv).toContain('"laters-protected-title"');
    },
  );

  it("does not alter a safe title beginning with an apostrophe", () => {
    const csv = createReadingListCsv([
      { ...item("apostrophe", 1), title: "'=already literal" },
    ]);

    expect(csv).toContain(",\"'=already literal\",");
    expect(csv).not.toContain("laters-protected-title");
  });

  it("creates a valid header-only export for an empty list", () => {
    expect(createReadingListCsv([])).toBe("url,title,created,tags,readtime\r\n");
  });

  it("rejects invalid saved data rather than exporting it", () => {
    expect(() =>
      createReadingListCsv([
        { ...item("unsafe", 1), url: "javascript:alert(1)" },
      ]),
    ).toThrow("invalid");
  });

  it("serializes no credentials, connection details or operation bookkeeping", () => {
    const csv = createReadingListCsv([
      {
        ...item("private-state", 1),
        accessToken: "secret-access-token",
        connectionAccount: "private-account-identifier",
        operationId: "pending-operation-id",
        remoteFileId: "drive-file-id",
      } as SavedItem,
    ]);

    expect(csv).not.toContain("secret-access-token");
    expect(csv).not.toContain("private-account-identifier");
    expect(csv).not.toContain("pending-operation-id");
    expect(csv).not.toContain("drive-file-id");
  });

  it("uses a sortable, versioned UTC filename", () => {
    expect(
      createReadingListExportFileName(new Date("2026-08-25T09:08:07.654Z")),
    ).toBe("laters-export-v2-2026-08-25T09-08-07Z.csv");
  });
});

describe("reading-list export delivery", () => {
  it("downloads the CSV file directly", async () => {
    const environment = createEnvironment();
    const store = { listNewestFirst: vi.fn(async () => [item("downloaded", 100)]) };

    await expect(
      exportReadingList(
        store,
        environment,
        () => new Date("2026-08-25T09:08:07.654Z"),
      ),
    ).resolves.toEqual({
      articleCount: 1,
      fileName: "laters-export-v2-2026-08-25T09-08-07Z.csv",
    });

    expect(environment.createObjectUrl).toHaveBeenCalledOnce();
    const exportedFile = vi.mocked(environment.createObjectUrl).mock.calls[0]![0];
    expect(exportedFile).toMatchObject({
      name: "laters-export-v2-2026-08-25T09-08-07Z.csv",
      type: "text/csv",
    });
    await expect(exportedFile.text()).resolves.toContain(
      '"https://example.com/downloaded"',
    );
    expect(environment.download).toHaveBeenCalledWith(
      "blob:laters-export",
      "laters-export-v2-2026-08-25T09-08-07Z.csv",
    );
    expect(environment.revokeObjectUrl).toHaveBeenCalledWith("blob:laters-export");
  });

  it("uses only the read-only list boundary and does not alter source objects", async () => {
    const sourceItems = [{ ...item("unchanged", 100), bookmarked: true }];
    const originalItems = structuredClone(sourceItems);
    const listNewestFirst = vi.fn(async () => sourceItems);
    const environment = createEnvironment();

    await exportReadingList({ listNewestFirst }, environment);

    expect(listNewestFirst).toHaveBeenCalledOnce();
    expect(sourceItems).toEqual(originalItems);
  });

  it("does not mutate the stored reading list or its pending sync queue", async () => {
    const databaseName = `laters-export-test-${crypto.randomUUID()}`;
    databases.push(databaseName);
    const store = new IndexedDbReadingListStore(databaseName);
    await store.save(item("stored", 100));
    await store.setBookmarked("stored", true);
    const itemsBefore = await store.listNewestFirst();
    const operationsBefore = await store.listPendingSyncOperations();

    await exportReadingList(store, createEnvironment());

    await expect(store.listNewestFirst()).resolves.toEqual(itemsBefore);
    await expect(store.listPendingSyncOperations()).resolves.toEqual(operationsBefore);
  });
});

function item(id: string, savedAt: number): SavedItem {
  return {
    id,
    title: `Article ${id}`,
    url: `https://example.com/${id}`,
    savedAt,
  };
}

function createEnvironment(): ReadingListExportEnvironment {
  return {
    createObjectUrl: vi.fn((_file: File) => "blob:laters-export"),
    download: vi.fn((_url: string, _fileName: string) => undefined),
    revokeObjectUrl: vi.fn((_url: string) => undefined),
  };
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not delete test database."));
    request.onblocked = () => reject(new Error("Test database deletion was blocked."));
  });
}
