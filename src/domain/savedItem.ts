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

const MAX_ARTICLE_URL_LENGTH = 8_192;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/u;
const FORBIDDEN_TRIMMED_URL_CHARACTER = /[\s\\]/u;
const MALFORMED_PERCENT_ESCAPE = /%(?![0-9a-f]{2})/iu;
const ENCODED_CONTROL_CHARACTER = /%(?:0[0-9a-f]|1[0-9a-f]|7f)/iu;
const HTTP_SCHEME = /^https?:\/\//iu;
const EXPLICIT_SCHEME = /^([a-z][a-z0-9+.-]*):(.*)$/iu;

export function createSavedItem(
  input: SavedItemInput,
  options: {
    createId?: () => string;
    now?: () => number;
  } = {},
): SavedItem {
  const title = input.title.trim();
  const url = parseArticleUrl(input.url, true);

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
    isCanonicalArticleUrl(candidate.url) &&
    typeof candidate.savedAt === "number" &&
    Number.isFinite(candidate.savedAt) &&
    candidate.savedAt >= 0 &&
    (candidate.bookmarked === undefined || typeof candidate.bookmarked === "boolean")
  );
}

export function normaliseArticleUrl(rawUrl: string, addDefaultScheme = false): string {
  return parseArticleUrl(rawUrl, addDefaultScheme).href;
}

function parseArticleUrl(rawUrl: string, addDefaultScheme: boolean): URL {
  const trimmedUrl = rawUrl.trim();

  if (
    !trimmedUrl ||
    trimmedUrl.length > MAX_ARTICLE_URL_LENGTH ||
    CONTROL_CHARACTER.test(rawUrl) ||
    FORBIDDEN_TRIMMED_URL_CHARACTER.test(trimmedUrl) ||
    MALFORMED_PERCENT_ESCAPE.test(trimmedUrl) ||
    ENCODED_CONTROL_CHARACTER.test(trimmedUrl)
  ) {
    throw new SavedItemValidationError("Enter a valid article URL.");
  }

  const candidateUrl = addDefaultScheme ? addHttpsScheme(trimmedUrl) : trimmedUrl;
  let url: URL;

  try {
    url = new URL(candidateUrl);
  } catch {
    throw new SavedItemValidationError("Enter a valid article URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SavedItemValidationError("Only HTTP or HTTPS article links can be saved.");
  }

  if (!url.hostname || url.username || url.password) {
    throw new SavedItemValidationError("Enter an article URL without sign-in details.");
  }

  if (url.href.length > MAX_ARTICLE_URL_LENGTH) {
    throw new SavedItemValidationError("That article URL is too long to save safely.");
  }

  return url;
}

function addHttpsScheme(rawUrl: string): string {
  if (HTTP_SCHEME.test(rawUrl)) {
    return rawUrl;
  }

  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  const scheme = rawUrl.match(EXPLICIT_SCHEME);

  if (
    scheme &&
    !looksLikeBareHostWithPort(scheme[1] ?? "", scheme[2] ?? "")
  ) {
    throw new SavedItemValidationError("Only HTTP or HTTPS article links can be saved.");
  }

  const candidateUrl = `https://${rawUrl}`;

  try {
    const url = new URL(candidateUrl);

    if (!url.hostname.includes(".") && !isIpAddress(url.hostname)) {
      throw new SavedItemValidationError("Enter a complete article address.");
    }
  } catch (error) {
    if (error instanceof SavedItemValidationError) {
      throw error;
    }

    throw new SavedItemValidationError("Enter a valid article URL.");
  }

  return candidateUrl;
}

function looksLikeBareHostWithPort(schemeCandidate: string, remainder: string): boolean {
  return (
    (schemeCandidate.includes(".") || schemeCandidate === "localhost") &&
    /^\d+(?:[/?#]|$)/u.test(remainder)
  );
}

function isIpAddress(hostname: string): boolean {
  return /^\d+(?:\.\d+){3}$/u.test(hostname) || /^\[[0-9a-f:]+\]$/iu.test(hostname);
}

function isCanonicalArticleUrl(rawUrl: string): boolean {
  try {
    return normaliseArticleUrl(rawUrl) === rawUrl;
  } catch {
    return false;
  }
}
