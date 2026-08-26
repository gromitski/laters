import type { SavedItem } from "../domain/savedItem";
import type { ReadingListStore } from "../storage/readingListStore";
import {
  GoogleDriveRequestError,
  readGoogleDriveArticleCheckpoint,
  writeGoogleDriveArticleCheckpoint,
  type GoogleDriveArticleCheckpoint,
} from "./googleDriveArticleSync";
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
export const GOOGLE_DRIVE_OPERATION_DOWNLOAD_CONCURRENCY = 4;
export const GOOGLE_DRIVE_OPERATION_COMPACTION_THRESHOLD = 100;

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
  private baseItems: SavedItem[];
  private compactedOperationIds: Set<string>;
  private checkpointFingerprint: string;
  private activeSync: Promise<GoogleDriveLiveSyncResult> | undefined;
  private rerunRequested = false;
  private readonly compactionThreshold: number;
  private readonly now: () => Date;

  constructor(
    private readonly request: typeof fetch,
    private readonly accessToken: string,
    private readonly articleFileId: string,
    checkpoint: GoogleDriveArticleCheckpoint,
    options: { compactionThreshold?: number; now?: () => Date } = {},
  ) {
    this.baseItems = checkpoint.items.map((item) => ({ ...item }));
    this.compactedOperationIds = new Set(checkpoint.compactedOperationIds);
    this.checkpointFingerprint = fingerprintCheckpoint(checkpoint);
    this.compactionThreshold =
      options.compactionThreshold ?? GOOGLE_DRIVE_OPERATION_COMPACTION_THRESHOLD;
    this.now = options.now ?? (() => new Date());
  }

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
    await this.refreshCheckpoint();
    let files = await listOperationFiles(this.request, this.accessToken);
    const compactedAtPassStart = new Set(this.compactedOperationIds);
    const cleanupWasPendingAtPassStart = compactedAtPassStart.size > 0;
    await this.cleanupCheckpointedFiles(files);
    let activeFiles = files.filter(
      (file) => !compactedAtPassStart.has(operationIdFromFileName(file.name) ?? ""),
    );
    await this.downloadUnseenOperations(activeFiles);

    const pendingOperations = await store.listPendingSyncOperations();
    const remoteOperationIds = new Set(
      activeFiles.map((file) => operationIdFromFileName(file.name)).filter(isString),
    );
    const acknowledgedOperationIds: string[] = [];
    let uploadedCount = 0;

    for (const operation of pendingOperations) {
      if (compactedAtPassStart.has(operation.operationId)) {
        acknowledgedOperationIds.push(operation.operationId);
        continue;
      }

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
    const ignoredOperationIds = new Set([
      ...compactedAtPassStart,
      ...this.compactedOperationIds,
    ]);
    activeFiles = files.filter(
      (file) => !ignoredOperationIds.has(operationIdFromFileName(file.name) ?? ""),
    );
    await this.downloadUnseenOperations(activeFiles);
    const items = applyReadingListSyncOperations(
      this.baseItems,
      [...this.remoteOperations.values()],
    );
    await store.replaceAll(items);
    if (!cleanupWasPendingAtPassStart) {
      await this.compactIfNeeded(activeFiles, items);
    }

    return {
      items,
      operationCount: this.remoteOperations.size,
      uploadedCount,
    };
  }

  private async refreshCheckpoint(): Promise<void> {
    const checkpoint = await readGoogleDriveArticleCheckpoint(
      this.request,
      this.accessToken,
      this.articleFileId,
    );
    const fingerprint = fingerprintCheckpoint(checkpoint);

    if (fingerprint !== this.checkpointFingerprint) {
      this.applyCheckpoint(checkpoint);
    }
  }

  private applyCheckpoint(checkpoint: GoogleDriveArticleCheckpoint): void {
    this.baseItems = checkpoint.items.map((item) => ({ ...item }));
    this.compactedOperationIds = new Set(checkpoint.compactedOperationIds);
    this.checkpointFingerprint = fingerprintCheckpoint(checkpoint);
    this.remoteOperations.clear();
  }

  private async cleanupCheckpointedFiles(files: DriveOperationFile[]): Promise<void> {
    if (this.compactedOperationIds.size === 0) {
      return;
    }

    let cleanupFailed = false;

    for (const file of files) {
      const operationId = operationIdFromFileName(file.name);

      if (!operationId || !this.compactedOperationIds.has(operationId)) {
        continue;
      }

      try {
        await deleteOperationFile(this.request, this.accessToken, file.id);
      } catch (error) {
        if (isAuthorizationError(error)) {
          throw error;
        }
        cleanupFailed = true;
      }
    }

    if (cleanupFailed) {
      return;
    }

    try {
      const checkpoint = await writeGoogleDriveArticleCheckpoint(
        this.request,
        this.accessToken,
        this.articleFileId,
        this.baseItems,
        [],
        this.now,
      );
      this.applyCheckpoint(checkpoint);
    } catch (error) {
      if (isAuthorizationError(error)) {
        throw error;
      }
    }
  }

  private async compactIfNeeded(
    files: DriveOperationFile[],
    items: SavedItem[],
  ): Promise<void> {
    if (files.length < this.compactionThreshold) {
      return;
    }

    const operationIds = files
      .map((file) => operationIdFromFileName(file.name))
      .filter(isString);

    try {
      const checkpoint = await writeGoogleDriveArticleCheckpoint(
        this.request,
        this.accessToken,
        this.articleFileId,
        items,
        operationIds,
        this.now,
      );
      this.applyCheckpoint(checkpoint);
    } catch (error) {
      if (isAuthorizationError(error)) {
        throw error;
      }
    }
  }

  private async downloadUnseenOperations(files: DriveOperationFile[]): Promise<void> {
    const unseenFiles = files
      .map((file) => ({ file, operationId: operationIdFromFileName(file.name) }))
      .filter(
        (entry): entry is { file: DriveOperationFile; operationId: string } =>
          entry.operationId !== undefined && !this.remoteOperations.has(entry.operationId),
      );
    const downloadedOperations: ReadingListSyncOperation[] = [];

    for (
      let offset = 0;
      offset < unseenFiles.length;
      offset += GOOGLE_DRIVE_OPERATION_DOWNLOAD_CONCURRENCY
    ) {
      const batch = unseenFiles.slice(
        offset,
        offset + GOOGLE_DRIVE_OPERATION_DOWNLOAD_CONCURRENCY,
      );
      const results = await Promise.allSettled(
        batch.map(async ({ file, operationId }) => {
          const operation = await downloadOperation(
            this.request,
            this.accessToken,
            file.id,
          );

          if (operation.operationId !== operationId) {
            throw new Error("A Google Drive sync operation has an unexpected identifier.");
          }

          return operation;
        }),
      );
      const failedDownloads = results.filter(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );
      const failedDownload =
        failedDownloads.find((result) => isAuthorizationError(result.reason)) ??
        failedDownloads[0];

      if (failedDownload) {
        throw failedDownload.reason;
      }

      for (const result of results) {
        if (result.status === "fulfilled") {
          downloadedOperations.push(result.value);
        }
      }
    }

    for (const operation of downloadedOperations) {
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

async function deleteOperationFile(
  request: typeof fetch,
  accessToken: string,
  fileId: string,
): Promise<void> {
  const response = await request(`${DRIVE_FILES_URL}/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: authorisationHeaders(accessToken),
  });

  if (!response.ok) {
    throw new GoogleDriveRequestError(
      `Google Drive cleanup request failed (${response.status}).`,
      response.status,
    );
  }
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

function fingerprintCheckpoint(checkpoint: GoogleDriveArticleCheckpoint): string {
  return JSON.stringify(checkpoint);
}

function isAuthorizationError(error: unknown): boolean {
  return (
    error instanceof GoogleDriveRequestError &&
    (error.status === 401 || error.status === 403)
  );
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
