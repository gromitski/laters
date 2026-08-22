export interface SavedItem {
  id: string;
  url: string;
  title: string;
  savedAt: number;
  bookmarked?: boolean;
}

export interface SavedItemInput {
  url: string;
  title: string;
}

export class SavedItemValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavedItemValidationError";
  }
}

export function createSavedItem(
  input: SavedItemInput,
  options: {
    createId?: () => string;
    now?: () => number;
  } = {},
): SavedItem {
  const title = input.title.trim();
  const url = parseArticleUrl(input.url);

  if (!title) {
    throw new SavedItemValidationError("Enter a title for this article.");
  }

  if (title.length > 240) {
    throw new SavedItemValidationError("Keep the article title to 240 characters or fewer.");
  }

  return {
    id: (options.createId ?? (() => crypto.randomUUID()))(),
    title,
    url: url.href,
    savedAt: (options.now ?? Date.now)(),
  };
}

export function isSavedItem(value: unknown): value is SavedItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SavedItem>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    candidate.title.length <= 240 &&
    typeof candidate.url === "string" &&
    isArticleUrl(candidate.url) &&
    typeof candidate.savedAt === "number" &&
    Number.isFinite(candidate.savedAt) &&
    candidate.savedAt >= 0 &&
    (candidate.bookmarked === undefined || typeof candidate.bookmarked === "boolean")
  );
}

function parseArticleUrl(rawUrl: string): URL {
  let url: URL;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new SavedItemValidationError("Enter a complete article URL, including https://.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SavedItemValidationError("Only HTTP or HTTPS article links can be saved.");
  }

  return url;
}

function isArticleUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
