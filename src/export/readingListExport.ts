import { isSavedItem, type SavedItem } from "../domain/savedItem";
import type { ReadingListStore } from "../storage/readingListStore";

const EXPORT_FORMAT_VERSION = 1;
const BOOKMARKED_TAG = "laters-bookmarked";
const TITLE_EDITED_TAG = "laters-title-edited";
const PROTECTED_TITLE_TAG = "laters-protected-title";
const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@]/u;

type ExportStore = Pick<ReadingListStore, "listNewestFirst">;

export interface ReadingListExportEnvironment {
  canShare?(data: ShareData): boolean;
  share?(data: ShareData): Promise<void>;
  createObjectUrl(file: File): string;
  download(url: string, fileName: string): void;
  revokeObjectUrl(url: string): void;
}

export interface ReadingListExportResult {
  articleCount: number;
  fileName: string;
  outcome: "cancelled" | "downloaded" | "shared";
}

export async function exportReadingList(
  store: ExportStore,
  environment: ReadingListExportEnvironment,
  now: () => Date = () => new Date(),
): Promise<ReadingListExportResult> {
  const items = await store.listNewestFirst();
  const exportedAt = now();
  const fileName = createReadingListExportFileName(exportedAt);
  const file = new File([createReadingListCsv(items)], fileName, {
    type: "text/csv",
    lastModified: exportedAt.getTime(),
  });
  const outcome = await deliverReadingListExport(file, environment);

  return { articleCount: items.length, fileName, outcome };
}

export function createReadingListCsv(items: SavedItem[]): string {
  if (!items.every(isSavedItem)) {
    throw new Error("Saved article data is invalid and cannot be exported.");
  }

  const orderedItems = [...items].sort(
    (left, right) => right.savedAt - left.savedAt || right.id.localeCompare(left.id),
  );
  const rows = orderedItems.map((item) => {
    const { title, wasProtected } = protectSpreadsheetTitle(item.title);
    const tags = [
      ...(item.bookmarked ? [BOOKMARKED_TAG] : []),
      ...(item.titleEdited ? [TITLE_EDITED_TAG] : []),
      ...(wasProtected ? [PROTECTED_TITLE_TAG] : []),
    ];

    return [item.url, title, new Date(item.savedAt).toISOString(), tags.join(", ")]
      .map(escapeCsvCell)
      .join(",");
  });

  return ["url,title,created,tags", ...rows, ""].join("\r\n");
}

export function createReadingListExportFileName(exportedAt: Date): string {
  const isoTime = exportedAt.toISOString();
  const fileTime = isoTime.replace(/\.\d{3}Z$/u, "Z").replaceAll(":", "-");
  return `laters-export-v${EXPORT_FORMAT_VERSION}-${fileTime}.csv`;
}

async function deliverReadingListExport(
  file: File,
  environment: ReadingListExportEnvironment,
): Promise<ReadingListExportResult["outcome"]> {
  const shareData: ShareData = { files: [file] };

  if (environment.share && environment.canShare?.(shareData)) {
    try {
      await environment.share(shareData);
      return "shared";
    } catch (error) {
      if (isAbortError(error)) {
        return "cancelled";
      }
    }
  }

  const objectUrl = environment.createObjectUrl(file);

  try {
    environment.download(objectUrl, file.name);
  } finally {
    environment.revokeObjectUrl(objectUrl);
  }

  return "downloaded";
}

function protectSpreadsheetTitle(title: string): {
  title: string;
  wasProtected: boolean;
} {
  if (!SPREADSHEET_FORMULA_PREFIX.test(title)) {
    return { title, wasProtected: false };
  }

  return { title: `'${title}`, wasProtected: true };
}

function escapeCsvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}
