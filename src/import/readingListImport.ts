import {
  normaliseArticleTitle,
  normaliseArticleUrl,
  SavedItemValidationError,
  type SavedItem,
} from "../domain/savedItem";

export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_IMPORT_ARTICLE_ROWS = 1_000;

const RECOGNISED_COLUMNS = new Set(["url", "title", "created", "tags"]);
const BOOKMARKED_TAG = "laters-bookmarked";
const TITLE_EDITED_TAG = "laters-title-edited";
const PROTECTED_TITLE_TAG = "laters-protected-title";
const ISO_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/u;

export class ReadingListImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReadingListImportError";
  }
}

export interface ReadingListImportPlan {
  items: SavedItem[];
  newArticleCount: number;
  existingArticleCount: number;
  duplicateRowCount: number;
  ignoredColumnCount: number;
  ignoredTagCount: number;
  totalArticleCount: number;
}

interface ReadingListImportOptions {
  createId?: () => string;
  now?: () => number;
}

export async function readReadingListImportFile(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new ReadingListImportError("Choose a CSV file to import.");
  }

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new ReadingListImportError("Choose a CSV file no larger than 10 MB.");
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
  } catch {
    throw new ReadingListImportError("That file is not valid UTF-8 CSV.");
  }
}

export function createReadingListImportPlan(
  csv: string,
  existingItems: SavedItem[],
  options: ReadingListImportOptions = {},
): ReadingListImportPlan {
  if (new TextEncoder().encode(csv).byteLength > MAX_IMPORT_FILE_BYTES) {
    throw new ReadingListImportError("Choose a CSV file no larger than 10 MB.");
  }

  const rows = parseCsvRows(csv.replace(/^\uFEFF/u, "")).filter(
    (row) => !row.every((cell) => cell === ""),
  );

  if (rows.length === 0) {
    throw new ReadingListImportError("That CSV file is empty.");
  }

  const headers = rows[0]!.map((header) => header.trim().toLowerCase());
  validateHeaders(headers);

  const articleRows = rows.slice(1);

  if (articleRows.length > MAX_IMPORT_ARTICLE_ROWS) {
    throw new ReadingListImportError(
      `That CSV contains more than ${MAX_IMPORT_ARTICLE_ROWS.toLocaleString("en-GB")} article rows.`,
    );
  }

  const columnIndexes = new Map(headers.map((header, index) => [header, index]));
  const ignoredColumnCount = headers.filter(
    (header) => !RECOGNISED_COLUMNS.has(header),
  ).length;
  const existingUrls = new Set(existingItems.map((item) => item.url));
  const fileUrls = new Set<string>();
  const importedAt = (options.now ?? Date.now)();
  const createId = options.createId ?? (() => crypto.randomUUID());
  const items: SavedItem[] = [];
  const errors: string[] = [];
  let existingArticleCount = 0;
  let duplicateRowCount = 0;
  let ignoredTagCount = 0;

  articleRows.forEach((row, index) => {
    const sourceRow = index + 2;

    if (row.length > headers.length) {
      errors.push(`row ${sourceRow} has more values than the header`);
      return;
    }

    try {
      const url = normaliseArticleUrl(readCell(row, columnIndexes, "url"), false);
      const tags = readTags(readCell(row, columnIndexes, "tags"));
      ignoredTagCount += tags.filter((tag) => !isRecognisedTag(tag)).length;
      const rawTitle = readCell(row, columnIndexes, "title").trim();
      const title = restoreProtectedTitle(
        rawTitle || new URL(url).hostname.replace(/^www\./iu, ""),
        tags,
      );
      const savedAt = readSavedAt(
        readCell(row, columnIndexes, "created"),
        Math.max(0, importedAt - index),
      );
      const normalisedTitle = normaliseArticleTitle(title);

      if (fileUrls.has(url)) {
        duplicateRowCount += 1;
        return;
      }

      fileUrls.add(url);

      if (existingUrls.has(url)) {
        existingArticleCount += 1;
        return;
      }

      const item: SavedItem = {
        id: createId(),
        url,
        title: normalisedTitle,
        savedAt,
        ...(tags.includes(BOOKMARKED_TAG) ? { bookmarked: true } : {}),
        ...(tags.includes(TITLE_EDITED_TAG) ? { titleEdited: true } : {}),
      };

      items.push(item);
    } catch (error) {
      errors.push(`row ${sourceRow} ${readRowError(error)}`);
    }
  });

  if (errors.length > 0) {
    const shownErrors = errors.slice(0, 5).join("; ");
    const remaining = errors.length - 5;
    throw new ReadingListImportError(
      `Nothing was imported because ${shownErrors}${remaining > 0 ? `; and ${remaining} more rows need attention` : ""}.`,
    );
  }

  return {
    items,
    newArticleCount: items.length,
    existingArticleCount,
    duplicateRowCount,
    ignoredColumnCount,
    ignoredTagCount,
    totalArticleCount: articleRows.length,
  };
}

function validateHeaders(headers: string[]): void {
  if (headers.length === 0 || headers.every((header) => header === "")) {
    throw new ReadingListImportError("That CSV file has no header row.");
  }

  if (headers.some((header) => header === "")) {
    throw new ReadingListImportError("Every CSV column needs a header.");
  }

  if (new Set(headers).size !== headers.length) {
    throw new ReadingListImportError("The CSV header contains a duplicate column name.");
  }

  if (!headers.includes("url")) {
    throw new ReadingListImportError('The CSV header must include a "url" column.');
  }
}

function readCell(
  row: string[],
  columnIndexes: Map<string, number>,
  column: string,
): string {
  const index = columnIndexes.get(column);
  return index === undefined ? "" : (row[index] ?? "");
}

function readTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function isRecognisedTag(tag: string): boolean {
  return (
    tag === BOOKMARKED_TAG ||
    tag === TITLE_EDITED_TAG ||
    tag === PROTECTED_TITLE_TAG
  );
}

function restoreProtectedTitle(title: string, tags: string[]): string {
  if (!tags.includes(PROTECTED_TITLE_TAG)) {
    return title;
  }

  if (!title.startsWith("'")) {
    throw new ReadingListImportError(
      "has a protected-title tag but no protected title",
    );
  }

  return title.slice(1);
}

function readSavedAt(value: string, fallback: number): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  const match = trimmed.match(ISO_DATE_TIME);

  if (!match || !hasValidDateTimeParts(match)) {
    throw new ReadingListImportError("has an invalid created time");
  }

  const savedAt = Date.parse(trimmed);

  if (!Number.isFinite(savedAt) || savedAt < 0) {
    throw new ReadingListImportError("has an invalid created time");
  }

  return savedAt;
}

function hasValidDateTimeParts(match: RegExpMatchArray): boolean {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = Number(match[7] ?? 0);
  const offsetMinute = Number(match[8] ?? 0);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    offsetHour > 23 ||
    offsetMinute > 59
  ) {
    return false;
  }

  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function readRowError(error: unknown): string {
  if (error instanceof ReadingListImportError) {
    return error.message;
  }

  if (error instanceof SavedItemValidationError) {
    return error.message.toLowerCase().replace(/[.]$/u, "");
  }

  return "contains invalid article data";
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let afterQuote = false;
  let sourceRow = 1;

  const finishCell = () => {
    row.push(cell);
    cell = "";
    afterQuote = false;
  };
  const finishRow = () => {
    finishCell();
    rows.push(row);
    row = [];
    sourceRow += 1;
  };

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]!;

    if (inQuotes) {
      if (character !== '"') {
        cell += character;
        continue;
      }

      if (csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = false;
        afterQuote = true;
      }
      continue;
    }

    if (afterQuote && character !== "," && character !== "\r" && character !== "\n") {
      throw new ReadingListImportError(
        `Nothing was imported because row ${sourceRow} contains text after a closing quote.`,
      );
    }

    if (character === '"') {
      if (cell !== "") {
        throw new ReadingListImportError(
          `Nothing was imported because row ${sourceRow} contains an unexpected quote.`,
        );
      }
      inQuotes = true;
    } else if (character === ",") {
      finishCell();
    } else if (character === "\r" || character === "\n") {
      if (character === "\r" && csv[index + 1] === "\n") {
        index += 1;
      }
      finishRow();
    } else {
      cell += character;
    }
  }

  if (inQuotes) {
    throw new ReadingListImportError(
      `Nothing was imported because row ${sourceRow} has an unclosed quoted value.`,
    );
  }

  if (row.length > 0 || cell !== "" || afterQuote) {
    finishRow();
  }

  return rows;
}
