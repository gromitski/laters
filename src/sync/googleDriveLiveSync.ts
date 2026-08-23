import type { SavedItem } from "../domain/savedItem";
import type { ReadingListStore } from "../storage/readingListStore";
import { GoogleDriveRequestError } from "./googleDriveArticleSync";
import {
  applyReadingListSyncOperations,
  isReadingListSyncOperation,
  type ReadingListSyncOperation,
} from "./readingListSyncOperation";

const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_FILES_URL = "https://www.googleapis.com/upload/drive/v3/files";
const OPERATION_FILE_PREFIX = "laters-operation-";
const MAX_OPERATION_FILES = 10_000;
const MAX_OPERATION_BYTES = 32 * 1024;

type LiveSyncStore = Pick<
  ReadingListStore,
  "listPendingSyncOperations" | "removePendingSyncOperations" | "replaceAll"
>;

export interface GoogleDriveLiveSyncResult {
  items: SavedItem[];
  operationCount: number;
  uploadedCount: number;
}

export class GoogleDriveLiveSyncSession {
  private readonly remoteOperations = new Map<string, ReadingListSyncOperation>();
  private activeSync: Promise<GoogleDriveLiveSyncResult> | undefined;
  private rerunRequested = false;

  constructor(
    private readonly request: typeof fetch,
    private readonly accessToken: string,
    private readonly baseItems: SavedItem[],
  ) {}

  sync(store: LiveSyncStore): Promise<GoogleDriveLiveSyncResult> {
    this.rerunRequested = true;

    if (!this.activeSync) {
      this.activeSync = this.runSyncLoop(store).finally(() => {
        this.activeSync = undefined;
      });
    }

    return this.activeSync;
  }

  private async runSyncLoop(store: LiveSyncStore): Promise<GoogleDriveLiveSyncResult> {
    let result: GoogleDriveLiveSyncResult = {
      items: [...this.baseItems],
      operationCount: this.remoteOperations.size,
      uploadedCount: 0,
    };

    while (this.rerunRequested) {
      this.rerunRequested = false;
      result = await this.runSyncPass(store);
    }

    return result;
  }

  private async runSyncPass(store: LiveSyncStore): Promise<GoogleDriveLiveSyncResult> {
    let files = await listOperationFiles(this.request, this.accessToken);
    await this.downloadUnseenOperations(files);

    const pendingOperations = await store.listPendingSyncOperations();
    const remoteOperationIds = new Set(
      files.map((file) => operationIdFromFileName(file.name)).filter(isString),
    );
    const acknowledgedOperationIds: string[] = [];
    let uploadedCount = 0;

    for (const operation of pendingOperations) {
      if (!remoteOperationIds.has(operation.operationId)) {
        await uploadOperation(this.request, this.accessToken, operation);
        remoteOperationIds.add(operation.operationId);
        uploadedCount += 1;
      }

      this.remoteOperations.set(operation.operationId, operation);
      acknowledgedOperationIds.push(operation.operationId);
    }

    await store.removePendingSyncOperations(acknowledgedOperationIds);

    files = await listOperationFiles(this.request, this.accessToken);
    await this.downloadUnseenOperations(files);
    const items = applyReadingListSyncOperations(
      this.baseItems,
      [...this.remoteOperations.values()],
    );
    await store.replaceAll(items);

    return {
      items,
      operationCount: this.remoteOperations.size,
      uploadedCount,
    };
  }

  private async downloadUnseenOperations(files: DriveOperationFile[]): Promise<void> {
    for (const file of files) {
      const operationId = operationIdFromFileName(file.name);

      if (!operationId || this.remoteOperations.has(operationId)) {
        continue;
      }

      const operation = await downloadOperation(this.request, this.accessToken, file.id);

      if (operation.operationId !== operationId) {
        throw new Error("A Google Drive sync operation has an unexpected identifier.");
      }

      this.remoteOperations.set(operation.operationId, operation);
    }
  }
}

interface DriveOperationFile {
  id: string;
  name: string;
}

async function listOperationFiles(
  request: typeof fetch,
  accessToken: string,
): Promise<DriveOperationFile[]> {
  const files: DriveOperationFile[] = [];
  let pageToken: string | undefined;

  do {
    const listUrl = new URL(DRIVE_FILES_URL);
    listUrl.searchParams.set("spaces", "appDataFolder");
    listUrl.searchParams.set(
      "q",
      `name contains '${OPERATION_FILE_PREFIX}' and 'appDataFolder' in parents and trashed = false`,
    );
    listUrl.searchParams.set("fields", "nextPageToken,files(id,name)");
    listUrl.searchParams.set("pageSize", "1000");

    if (pageToken) {
      listUrl.searchParams.set("pageToken", pageToken);
    }

    const result = await readJson<{
      nextPageToken?: string;
      files?: Array<{ id?: string; name?: string }>;
    }>(await request(listUrl, { headers: authorisationHeaders(accessToken) }));

    for (const file of result.files ?? []) {
      if (file.id && file.name && operationIdFromFileName(file.name)) {
        files.push({ id: file.id, name: file.name });
      }
    }

    if (files.length > MAX_OPERATION_FILES) {
      throw new Error("Google Drive contains too many Laters changes to sync safely.");
    }

    pageToken = result.nextPageToken;
  } while (pageToken);

  const names = new Set<string>();

  for (const file of files) {
    if (names.has(file.name)) {
      throw new Error("Google Drive contains a duplicate Laters sync operation.");
    }

    names.add(file.name);
  }

  return files.sort((left, right) => left.name.localeCompare(right.name));
}

async function uploadOperation(
  request: typeof fetch,
  accessToken: string,
  operation: ReadingListSyncOperation,
): Promise<void> {
  const content = JSON.stringify(operation);

  if (new TextEncoder().encode(content).byteLength > MAX_OPERATION_BYTES) {
    throw new Error("A reading-list change is too large to sync safely.");
  }

  const boundary = `laters_${crypto.randomUUID().replaceAll("-", "")}`;
  const metadata = JSON.stringify({
    name: operationFileName(operation.operationId),
    parents: ["appDataFolder"],
    mimeType: "application/json",
  });
  const body = [
    `--${boundary}\r\n`,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    metadata,
    `\r\n--${boundary}\r\n`,
    "Content-Type: application/json\r\n\r\n",
    content,
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
    throw new Error("Google Drive did not confirm a Laters sync operation.");
  }
}

async function downloadOperation(
  request: typeof fetch,
  accessToken: string,
  fileId: string,
): Promise<ReadingListSyncOperation> {
  const response = await request(
    `${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}?alt=media`,
    { headers: authorisationHeaders(accessToken) },
  );
  const contentLength = Number(response.headers.get("Content-Length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_OPERATION_BYTES) {
    throw new Error("A Google Drive sync operation is too large to open safely.");
  }

  const text = await readText(response);

  if (new TextEncoder().encode(text).byteLength > MAX_OPERATION_BYTES) {
    throw new Error("A Google Drive sync operation is too large to open safely.");
  }

  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("A Google Drive sync operation is not valid JSON.");
  }

  if (!isReadingListSyncOperation(value)) {
    throw new Error("A Google Drive sync operation contains invalid data.");
  }

  return value;
}

function operationFileName(operationId: string): string {
  return `${OPERATION_FILE_PREFIX}${operationId}.json`;
}

function operationIdFromFileName(fileName: string): string | undefined {
  if (!fileName.startsWith(OPERATION_FILE_PREFIX) || !fileName.endsWith(".json")) {
    return undefined;
  }

  const operationId = fileName.slice(OPERATION_FILE_PREFIX.length, -".json".length);
  return /^[A-Za-z0-9_-]{1,128}$/u.test(operationId) ? operationId : undefined;
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
      `Google Drive live-sync request failed (${response.status}).`,
      response.status,
    );
  }

  return response.text();
}

function isString(value: string | undefined): value is string {
  return value !== undefined;
}
