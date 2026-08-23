import { isSavedItem, type SavedItem } from "../domain/savedItem";

const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_FILES_URL = "https://www.googleapis.com/upload/drive/v3/files";
const ARTICLE_FILE_NAME = "laters-reading-list.json";
const ARTICLE_SCHEMA_VERSION = 1;
const MAX_ARTICLE_COUNT = 10_000;
const MAX_SNAPSHOT_BYTES = 5 * 1024 * 1024;

interface ArticleSnapshot {
  schemaVersion: 1;
  updatedAt: string;
  items: SavedItem[];
}

export interface GoogleDriveArticleInitialisation {
  fileId: string;
  items: SavedItem[];
  source: "drive-loaded" | "local-uploaded";
  updatedAt: string;
}

export class GoogleDriveRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GoogleDriveRequestError";
  }
}

export async function initialiseGoogleDriveArticles(
  request: typeof fetch,
  accessToken: string,
  localItems: SavedItem[],
  now: () => Date = () => new Date(),
): Promise<GoogleDriveArticleInitialisation> {
  validateItems(localItems);
  const existingFileId = await findArticleFile(request, accessToken);

  if (existingFileId) {
    const snapshot = await readArticleSnapshot(request, accessToken, existingFileId);
    return {
      fileId: existingFileId,
      items: snapshot.items,
      source: "drive-loaded",
      updatedAt: snapshot.updatedAt,
    };
  }

  const snapshot = createSnapshot(localItems, now);
  const fileId = await createArticleFile(request, accessToken, snapshot);
  const confirmed = await readArticleSnapshot(request, accessToken, fileId);

  if (JSON.stringify(confirmed) !== JSON.stringify(snapshot)) {
    throw new Error("Google Drive returned unexpected reading-list data.");
  }

  return {
    fileId,
    items: confirmed.items,
    source: "local-uploaded",
    updatedAt: confirmed.updatedAt,
  };
}

export class GoogleDriveArticleSyncSession {
  private pendingItems: SavedItem[] | undefined;
  private activeUpload: Promise<void> | undefined;

  constructor(
    private readonly request: typeof fetch,
    private readonly accessToken: string,
    private readonly fileId: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  sync(items: SavedItem[]): Promise<void> {
    validateItems(items);
    this.pendingItems = items.map((item) => ({ ...item }));

    if (!this.activeUpload) {
      this.activeUpload = this.flush().finally(() => {
        this.activeUpload = undefined;
      });
    }

    return this.activeUpload;
  }

  private async flush(): Promise<void> {
    while (this.pendingItems) {
      const items = this.pendingItems;
      this.pendingItems = undefined;
      await writeArticleSnapshot(
        this.request,
        this.accessToken,
        this.fileId,
        createSnapshot(items, this.now),
      );
    }
  }
}

async function findArticleFile(
  request: typeof fetch,
  accessToken: string,
): Promise<string | undefined> {
  const listUrl = new URL(DRIVE_FILES_URL);
  listUrl.searchParams.set("spaces", "appDataFolder");
  listUrl.searchParams.set(
    "q",
    `name = '${ARTICLE_FILE_NAME}' and 'appDataFolder' in parents and trashed = false`,
  );
  listUrl.searchParams.set("fields", "files(id)");
  listUrl.searchParams.set("pageSize", "2");

  const result = await readJson<{ files?: Array<{ id?: string }> }>(
    await request(listUrl, { headers: authorisationHeaders(accessToken) }),
  );
  const fileIds = result.files?.flatMap((file) => (file.id ? [file.id] : [])) ?? [];

  if (fileIds.length > 1) {
    throw new Error("Google Drive contains more than one Laters reading-list file.");
  }

  return fileIds[0];
}

async function createArticleFile(
  request: typeof fetch,
  accessToken: string,
  snapshot: ArticleSnapshot,
): Promise<string> {
  const boundary = `laters_${crypto.randomUUID().replaceAll("-", "")}`;
  const metadata = JSON.stringify({
    name: ARTICLE_FILE_NAME,
    parents: ["appDataFolder"],
    mimeType: "application/json",
  });
  const body = [
    `--${boundary}\r\n`,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    metadata,
    `\r\n--${boundary}\r\n`,
    "Content-Type: application/json\r\n\r\n",
    JSON.stringify(snapshot),
    `\r\n--${boundary}--`,
  ].join("");
  const created = await readJson<{ id?: string }>(
    await request(`${DRIVE_UPLOAD_FILES_URL}?uploadType=multipart&fields=id`, {
      method: "POST",
      headers: {
        ...authorisationHeaders(accessToken),
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }),
  );

  if (!created.id) {
    throw new Error("Google Drive did not return a reading-list file identifier.");
  }

  return created.id;
}

async function readArticleSnapshot(
  request: typeof fetch,
  accessToken: string,
  fileId: string,
): Promise<ArticleSnapshot> {
  const response = await request(
    `${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}?alt=media`,
    { headers: authorisationHeaders(accessToken) },
  );
  const contentLength = Number(response.headers.get("Content-Length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_SNAPSHOT_BYTES) {
    throw new Error("The Google Drive reading list is too large for Laters to open safely.");
  }

  const text = await readText(response);

  if (new TextEncoder().encode(text).byteLength > MAX_SNAPSHOT_BYTES) {
    throw new Error("The Google Drive reading list is too large for Laters to open safely.");
  }

  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The Google Drive reading list is not valid JSON.");
  }

  if (!isArticleSnapshot(value)) {
    throw new Error("The Google Drive reading list contains invalid data.");
  }

  return value;
}

async function writeArticleSnapshot(
  request: typeof fetch,
  accessToken: string,
  fileId: string,
  snapshot: ArticleSnapshot,
): Promise<void> {
  const body = JSON.stringify(snapshot);

  if (new TextEncoder().encode(body).byteLength > MAX_SNAPSHOT_BYTES) {
    throw new Error("The reading list is too large to sync safely.");
  }

  const response = await request(
    `${DRIVE_UPLOAD_FILES_URL}/${encodeURIComponent(fileId)}?uploadType=media`,
    {
      method: "PATCH",
      headers: {
        ...authorisationHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body,
    },
  );

  if (!response.ok) {
    throw new GoogleDriveRequestError(
      `Google Drive reading-list write failed (${response.status}).`,
      response.status,
    );
  }
}

function createSnapshot(items: SavedItem[], now: () => Date): ArticleSnapshot {
  validateItems(items);
  const updatedAt = now().toISOString();

  if (updatedAt === "Invalid Date") {
    throw new Error("A valid sync time is required.");
  }

  return {
    schemaVersion: ARTICLE_SCHEMA_VERSION,
    updatedAt,
    items: items.map((item) => ({ ...item })),
  };
}

function isArticleSnapshot(value: unknown): value is ArticleSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ArticleSnapshot>;
  const updatedAt =
    typeof candidate.updatedAt === "string" ? new Date(candidate.updatedAt) : undefined;

  if (
    candidate.schemaVersion !== ARTICLE_SCHEMA_VERSION ||
    !updatedAt ||
    Number.isNaN(updatedAt.getTime()) ||
    !Array.isArray(candidate.items)
  ) {
    return false;
  }

  try {
    validateItems(candidate.items);
    return true;
  } catch {
    return false;
  }
}

function validateItems(items: unknown[]): asserts items is SavedItem[] {
  if (items.length > MAX_ARTICLE_COUNT || !items.every(isSavedItem)) {
    throw new Error("The Google Drive reading list contains invalid article data.");
  }

  const ids = new Set<string>();
  const urls = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id) || urls.has(item.url)) {
      throw new Error("The Google Drive reading list contains duplicate articles.");
    }

    ids.add(item.id);
    urls.add(item.url);
  }
}

function authorisationHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

async function readJson<T>(response: Response): Promise<T> {
  return JSON.parse(await readText(response)) as T;
}

async function readText(response: Response): Promise<string> {
  if (!response.ok) {
    throw new GoogleDriveRequestError(
      `Google Drive reading-list request failed (${response.status}).`,
      response.status,
    );
  }

  return response.text();
}
