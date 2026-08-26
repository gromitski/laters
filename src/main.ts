import "@ionic/core/css/core.css";
import "./styles.css";
import { saveCapturedItem } from "./capture/saveCapturedItem";
import type { SavedItem } from "./domain/savedItem";
import { createSavedItem, SavedItemValidationError } from "./domain/savedItem";
import {
  exportReadingList,
  type ReadingListExportEnvironment,
} from "./export/readingListExport";
import {
  createReadingListImportPlan,
  readReadingListImportFile,
  ReadingListImportError,
  type ReadingListImportPlan,
} from "./import/readingListImport";
import { createSourceIdentity, type SourceIdentity } from "./domain/sourceIdentity";
import {
  requestApplicationInstall,
  type ApplicationInstallPrompt,
} from "./pwa/installApplication";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import { IndexedDbReadingListStore } from "./storage/indexedDbReadingListStore";
import { requestPersistentStorage } from "./storage/requestPersistentStorage";
import {
  connectGoogleDrive,
  GOOGLE_DRIVE_CLIENT_ID,
  GoogleDriveConnectionRequestError,
  revokeGoogleDriveAccess,
  runGoogleDriveConnectionProbe,
} from "./sync/googleDriveConnection";
import {
  GoogleDriveRequestError,
  initialiseGoogleDriveArticles,
} from "./sync/googleDriveArticleSync";
import {
  calculateGoogleDriveCredentialExpiry,
  removeLegacyGoogleDriveCredential,
} from "./sync/googleDriveSessionToken";
import { GoogleDriveLiveSyncSession } from "./sync/googleDriveLiveSync";
import { parseShareTarget } from "./share/parseShareTarget";
import { shouldActivateArticleRow } from "./ui/articleRowActivation";
import { createArticleShareData } from "./ui/articleShare";
import { formatSavedTime } from "./ui/formatSavedTime";
import { getBookmarkControlState } from "./ui/bookmarkPresentation";
import {
  installApplicationMenu,
  setApplicationMenuSyncState,
} from "./ui/applicationMenu";
import { createReadingListEntries } from "./ui/readingListPresentation";
import { installReadingListExportAction } from "./ui/readingListExportAction";
import {
  installReadingListImportAction,
  type ReadingListImportReview,
  type ReadingListImportResult,
} from "./ui/readingListImportAction";
import { loadPublisherFavicon } from "./ui/loadPublisherFavicon";
import { readClipboardText } from "./ui/readClipboardText";
import {
  ARTICLE_TITLE_CHANGED_EVENT,
  BOOKMARK_STATE_CHANGED_EVENT,
  createMobileArticleShell,
} from "./ui/mobileArticleShell";

const store = new IndexedDbReadingListStore();
const UNDO_WINDOW_MS = 7_000;
const ROW_COLLAPSE_MS = 460;
const GOOGLE_DRIVE_POLL_MS = 20_000;
const INTERACTIVE_ROW_TARGET_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [role="link"]';

interface PendingDeletion {
  item: SavedItem;
  isLeaving: boolean;
}

let currentItems: SavedItem[] = [];
let pendingDeletion: PendingDeletion | undefined;
let undoTimer: number | undefined;
let collapseTimer: number | undefined;
let hasRenderedInitialItems = false;
let googleDriveSyncSession: GoogleDriveLiveSyncSession | undefined;
let googleDriveAccessToken: string | undefined;
let googleDriveCredentialExpiresAt: number | undefined;
let googleDrivePollTimer: number | undefined;
let googleDriveStatusVersion = 0;

const list = requireElement<HTMLUListElement>("article-list");
const loadingState = requireElement<HTMLParagraphElement>("loading-state");
const emptyState = requireElement<HTMLParagraphElement>("empty-state");
const itemCount = requireElement<HTMLParagraphElement>("item-count");
const listHeading = requireElement<HTMLHeadingElement>("list-heading");
const statusMessage = requireElement<HTMLDivElement>("status-message");
const errorMessage = requireElement<HTMLParagraphElement>("error-message");
const updateMessage = requireElement<HTMLDivElement>("update-message");
const updateAction = requireElement<HTMLButtonElement>("update-action");
const installAction = requireElement<HTMLButtonElement>("install-action");
const applicationMenu = requireElement<HTMLIonModalElement>("application-menu");
const applicationMenuAction = requireElement<HTMLButtonElement>(
  "application-menu-action",
);
const applicationMenuCloseAction = requireElement<HTMLButtonElement>(
  "application-menu-close-action",
);
const googleDriveConnectAction = requireElement<HTMLButtonElement>(
  "google-drive-connect-action",
);
const googleDriveDisconnectAction = requireElement<HTMLButtonElement>(
  "google-drive-disconnect-action",
);
const googleDriveConnectionStatus = requireElement<HTMLParagraphElement>(
  "google-drive-connection-status",
);
const exportDataAction = requireElement<HTMLButtonElement>("export-data-action");
const exportDataStatus = requireElement<HTMLParagraphElement>("export-data-status");
const importDataAction = requireElement<HTMLButtonElement>("import-data-action");
const importDataFile = requireElement<HTMLInputElement>("import-data-file");
const importDataReview = requireElement<HTMLElement>("import-data-review");
const importDataSummary = requireElement<HTMLParagraphElement>("import-data-summary");
const importDataWarning = requireElement<HTMLParagraphElement>("import-data-warning");
const importDataConfirmAction = requireElement<HTMLButtonElement>(
  "import-data-confirm-action",
);
const importDataCancelAction = requireElement<HTMLButtonElement>(
  "import-data-cancel-action",
);
const importDataStatus = requireElement<HTMLParagraphElement>("import-data-status");
const pasteRow = createPasteToAddRow();

let applicationInstallPrompt: ApplicationInstallPrompt | undefined;

installApplicationMenu({
  modal: applicationMenu,
  openAction: applicationMenuAction,
  closeAction: applicationMenuCloseAction,
});
setGoogleDriveMenuState("disconnected");
removeStoredGoogleDriveCredential();

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  applicationInstallPrompt = event as ApplicationInstallPrompt;
  installAction.hidden = false;
  document.documentElement.classList.add("has-install-action");
});

window.addEventListener("appinstalled", hideInstallAction);

installAction.addEventListener("click", () => {
  const prompt = applicationInstallPrompt;

  if (!prompt) {
    hideInstallAction();
    return;
  }

  applicationInstallPrompt = undefined;
  installAction.disabled = true;

  void requestApplicationInstall(prompt)
    .catch(() => {
      showError(
        "Laters could not open the installation prompt. Use your browser's Install option instead.",
      );
    })
    .finally(hideInstallAction);
});

googleDriveConnectAction.addEventListener("click", () => {
  const activeSessionAtStart = googleDriveSyncSession;
  setGoogleDriveMenuState("checking");
  googleDriveConnectAction.disabled = true;
  googleDriveConnectAction.textContent = "Connecting…";
  googleDriveConnectionStatus.textContent = "Opening Google’s private permission screen…";

  void connectGoogleDrive(GOOGLE_DRIVE_CLIENT_ID)
    .then(async ({ accessToken, expiresInSeconds }) => {
      const expiresAt = calculateGoogleDriveCredentialExpiry(expiresInSeconds);
      await establishGoogleDriveLiveSync(accessToken, expiresAt);
    })
    .catch((error) => {
      if (isGoogleDriveAuthorizationError(error)) {
        pauseGoogleDriveSync(
          "Google permission expired. Your changes are safe locally; resume sync to send them.",
        );
      } else if (
        activeSessionAtStart &&
        googleDriveSyncSession === activeSessionAtStart
      ) {
        setGoogleDriveMenuState("connected");
        googleDriveConnectAction.textContent = "Reconnect Google Drive";
        googleDriveConnectionStatus.textContent = `Up to date in Google Drive. Checking every ${GOOGLE_DRIVE_POLL_MS / 1_000} seconds while open.`;
        startGoogleDrivePolling();
      } else {
        stopGoogleDrivePolling();
        googleDriveSyncSession = undefined;
        googleDriveAccessToken = undefined;
        googleDriveCredentialExpiresAt = undefined;
        googleDriveDisconnectAction.hidden = true;
        setGoogleDriveMenuState("disconnected");
        googleDriveConnectAction.textContent = hasRememberedGoogleDriveConnection()
          ? "Resume Google Drive"
          : "Connect Google Drive";
        googleDriveConnectionStatus.textContent = googleDriveConnectionError(error);
      }
    })
    .finally(() => {
      googleDriveConnectAction.disabled = false;
    });
});

googleDriveDisconnectAction.addEventListener("click", () => {
  const accessToken = googleDriveAccessToken;

  if (!accessToken) {
    disconnectGoogleDriveLocally();
    return;
  }

  googleDriveConnectAction.disabled = true;
  googleDriveDisconnectAction.disabled = true;
  clearGoogleDriveSession();
  forgetGoogleDriveConnection();
  googleDriveConnectionStatus.textContent = "Disconnecting from Google Drive…";
  googleDriveConnectAction.textContent = "Connect Google Drive";
  setGoogleDriveMenuState("checking");

  void revokeGoogleDriveAccess(accessToken)
    .then(() => {
      googleDriveConnectionStatus.textContent =
        "Disconnected and Google permission revoked. Existing hidden Drive data was not deleted.";
      announceHiddenStatus("Google Drive disconnected.");
    })
    .catch(() => {
      googleDriveConnectionStatus.textContent =
        "Disconnected here, but Google permission could not be revoked. Remove Laters in Google Account permissions.";
    })
    .finally(() => {
      googleDriveConnectAction.disabled = false;
      googleDriveDisconnectAction.disabled = false;
      googleDriveDisconnectAction.hidden = true;
      setGoogleDriveMenuState("disconnected");
    });
});

installReadingListExportAction({
  action: exportDataAction,
  status: exportDataStatus,
  beforeExport: clearFeedback,
  runExport: () => exportReadingList(store, browserExportEnvironment()),
});

installReadingListImportAction({
  action: importDataAction,
  fileInput: importDataFile,
  review: importDataReview,
  summary: importDataSummary,
  warning: importDataWarning,
  confirmAction: importDataConfirmAction,
  cancelAction: importDataCancelAction,
  status: importDataStatus,
  beforeChoose: () => {
    clearFeedback();
    exportDataStatus.textContent = "";
  },
  prepareImport: prepareReadingListImport,
  runImport: commitReadingListImport,
  readError: readingListImportError,
  afterImport: revealCompletedImport,
});

showRememberedGoogleDriveConnection();

showShareResult();
const initialListLoad = refreshList();
void initialListLoad.then(showWaitingGoogleDriveChanges);
void requestPersistentStorage();
void registerServiceWorker(showUpdateAvailable);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    if (googleDriveSyncSession) {
      syncArticlesToGoogleDrive("Checking Google Drive for changes…");
    } else {
      void refreshList();
    }
  }
});

window.addEventListener("online", () => {
  syncArticlesToGoogleDrive("Back online. Checking Google Drive…");
});

window.addEventListener("offline", () => {
  setGoogleDriveMenuState("disconnected");

  if (googleDriveSyncSession) {
    googleDriveConnectionStatus.textContent =
      "Offline. Changes remain queued safely until the connection returns.";
  }
});

function showUpdateAvailable(applyUpdate: () => void): void {
  updateAction.addEventListener(
    "click",
    () => {
      updateAction.disabled = true;
      updateAction.textContent = "Updating…";
      applyUpdate();
    },
    { once: true },
  );
  updateMessage.hidden = false;
}

function browserExportEnvironment(): ReadingListExportEnvironment {
  return {
    createObjectUrl: (file) => URL.createObjectURL(file),
    download: (url, fileName) => {
      const action = document.createElement("a");
      action.href = url;
      action.download = fileName;
      action.hidden = true;
      document.body.append(action);
      action.click();
      action.remove();
    },
    revokeObjectUrl: (url) => URL.revokeObjectURL(url),
  };
}

async function prepareReadingListImport(file: File): Promise<ReadingListImportReview> {
  const csv = await readReadingListImportFile(file);
  createReadingListImportPlan(csv, []);
  const session = googleDriveSyncSession;

  if (session) {
    setBusy(true);
    setGoogleDriveMenuState("checking");
    googleDriveConnectionStatus.textContent =
      "Checking Google Drive before reviewing this import…";

    try {
      const result = await session.sync(store);

      if (session !== googleDriveSyncSession) {
        throw new Error("Google Drive disconnected during import review.");
      }

      finalisePendingDeletion();
      currentItems = result.items;
      renderItems();
      setGoogleDriveMenuState("connected");
      googleDriveConnectionStatus.textContent = `Up to date in Google Drive. Checking every ${GOOGLE_DRIVE_POLL_MS / 1_000} seconds while open.`;
    } catch (error) {
      handleGoogleDriveSyncError(error);
      throw new ReadingListImportError(
        "Laters could not refresh Google Drive before the import. No articles were imported. Resume or disconnect Drive, then try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const existingItems = await store.listNewestFirst();
  const plan = createReadingListImportPlan(csv, existingItems);

  return {
    ...plan,
    ...(!session && hasRememberedGoogleDriveConnection()
      ? {
          connectionWarning:
            "Google Drive is not connected, so duplicate checking covers this device only. Resume Drive first if you want its latest list included.",
        }
      : {}),
  };
}

async function commitReadingListImport(
  plan: ReadingListImportPlan,
): Promise<ReadingListImportResult> {
  clearFeedback();
  finalisePendingDeletion();
  setBusy(true);

  try {
    const result = await store.importNew(plan.items);
    currentItems = result.items;
    renderItems();
    syncArticlesToGoogleDrive("Syncing imported articles to Google Drive…");
    return {
      importedCount: result.importedItems.length,
      firstImportedItemId: result.importedItems[0]?.id,
    };
  } finally {
    setBusy(false);
  }
}

function revealCompletedImport(result: ReadingListImportResult): void {
  const firstImportedItemId = result.firstImportedItemId;

  if (!firstImportedItemId) {
    importDataAction.focus({ preventScroll: true });
    return;
  }

  void applicationMenu
    .dismiss(undefined, "import-complete")
    .then(() => {
      showStatus(
        `Imported ${result.importedCount} ${result.importedCount === 1 ? "article" : "articles"}. Showing the first imported article.`,
      );
      window.requestAnimationFrame(() => {
        highlightSavedArticle(firstImportedItemId, "center");
        focusArticle(firstImportedItemId, true);
      });
    })
    .catch(() => {
      importDataAction.focus({ preventScroll: true });
    });
}

function readingListImportError(error: unknown): string {
  if (error instanceof ReadingListImportError) {
    return error.message;
  }

  return "Laters could not import that CSV. No articles were imported.";
}

function hideInstallAction(): void {
  applicationInstallPrompt = undefined;
  installAction.hidden = true;
  installAction.disabled = false;
  document.documentElement.classList.remove("has-install-action");
}

function showRememberedGoogleDriveConnection(): void {
  try {
    const lastConnectedAt = window.localStorage.getItem("laters-google-drive-last-connected");

    if (!lastConnectedAt) {
      return;
    }

    const connectedAt = new Date(lastConnectedAt);

    if (Number.isNaN(connectedAt.getTime())) {
      return;
    }

    googleDriveConnectAction.textContent = "Reconnect Google Drive";
    googleDriveConnectionStatus.textContent = `Last connected ${connectedAt.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    })}. Reconnect to load the Drive copy.`;
  } catch {
    // Connection history is optional and must never affect the local reading list.
  }
}

function rememberGoogleDriveConnection(lastConnectedAt: string): void {
  try {
    window.localStorage.setItem("laters-google-drive-last-connected", lastConnectedAt);
  } catch {
    // A successful Drive check remains valid even when local preferences cannot be stored.
  }
}

function hasRememberedGoogleDriveConnection(): boolean {
  try {
    return window.localStorage.getItem("laters-google-drive-last-connected") !== null;
  } catch {
    return false;
  }
}

function removeStoredGoogleDriveCredential(): void {
  try {
    removeLegacyGoogleDriveCredential(window.localStorage);
  } catch {
    // Old credential cleanup must not prevent the local reading list from loading.
  }
}

async function showWaitingGoogleDriveChanges(): Promise<void> {
  try {
    const pendingOperations = await store.listPendingSyncOperations();

    if (pendingOperations.length > 0 && hasRememberedGoogleDriveConnection()) {
      googleDriveConnectAction.textContent = "Resume Google Drive";
      googleDriveConnectionStatus.textContent = `${pendingOperations.length} ${pendingOperations.length === 1 ? "change is" : "changes are"} waiting to sync.`;
    }
  } catch {
    // The main list already reports local storage errors; this status is optional.
  }
}

async function establishGoogleDriveLiveSync(
  accessToken: string,
  expiresAt?: number,
): Promise<void> {
  setGoogleDriveMenuState("checking");
  const probe = await runGoogleDriveConnectionProbe(fetch, accessToken);
  const localItems = await store.listNewestFirst();
  const articles = await initialiseGoogleDriveArticles(fetch, accessToken, localItems);
  const session = new GoogleDriveLiveSyncSession(
    fetch,
    accessToken,
    articles.fileId,
    articles,
  );
  googleDriveSyncSession = session;
  googleDriveAccessToken = accessToken;
  googleDriveCredentialExpiresAt = expiresAt;
  const result = await session.sync(store);

  finalisePendingDeletion();
  currentItems = result.items;
  renderItems();
  rememberGoogleDriveConnection(probe.lastConnectedAt);
  startGoogleDrivePolling();
  setGoogleDriveMenuState("connected");
  googleDriveDisconnectAction.hidden = false;
  googleDriveConnectAction.textContent = "Reconnect Google Drive";
  googleDriveConnectionStatus.textContent = `Up to date in Google Drive. Checking every ${GOOGLE_DRIVE_POLL_MS / 1_000} seconds while open.`;
  announceHiddenStatus(
    `Google Drive sync is active with ${result.items.length} ${result.items.length === 1 ? "article" : "articles"}.`,
  );
}

function googleDriveConnectionError(error: unknown): string {
  if (error instanceof Error && error.message === "google-popup-failed") {
    return "Google could not open its permission screen. Select Connect again.";
  }

  if (error instanceof Error && error.message === "google-popup-closed") {
    return "Connection cancelled. Your articles remain local.";
  }

  return "Google Drive sync could not start. Your articles remain local.";
}

function syncArticlesToGoogleDrive(
  progressMessage = "Saving the latest changes to Google Drive…",
): void {
  const session = googleDriveSyncSession;

  if (!session) {
    setGoogleDriveMenuState("disconnected");

    if (hasRememberedGoogleDriveConnection()) {
      googleDriveConnectAction.textContent = "Resume Google Drive";
      googleDriveConnectionStatus.textContent = "A local change is waiting to sync.";
    }
    return;
  }

  if (
    googleDriveCredentialExpiresAt !== undefined &&
    googleDriveCredentialExpiresAt <= Date.now()
  ) {
    pauseGoogleDriveSync(
      "Google permission expired. Your changes are safe locally; resume sync to send them.",
    );
    return;
  }

  const statusVersion = ++googleDriveStatusVersion;
  setGoogleDriveMenuState("checking");
  googleDriveConnectionStatus.textContent = progressMessage;

  void session
    .sync(store)
    .then((result) => {
      if (
        session !== googleDriveSyncSession ||
        statusVersion !== googleDriveStatusVersion
      ) {
        return;
      }

      setGoogleDriveMenuState("connected");

      if (!savedItemListsEqual(currentItems, result.items)) {
        finalisePendingDeletion();
        currentItems = result.items;
        renderItems();
        announceHiddenStatus("Google Drive changes were applied to this device.");
      }

      if (statusVersion === googleDriveStatusVersion) {
        googleDriveConnectionStatus.textContent = `Up to date in Google Drive. Checking every ${GOOGLE_DRIVE_POLL_MS / 1_000} seconds while open.`;
      }
    })
    .catch((error: unknown) => {
      if (statusVersion !== googleDriveStatusVersion) {
        return;
      }

      handleGoogleDriveSyncError(error);
    });
}

function handleGoogleDriveSyncError(error: unknown): void {
  if (isGoogleDriveAuthorizationError(error)) {
    pauseGoogleDriveSync(
      "Google permission expired. Your changes are safe locally; resume sync to send them.",
    );
    return;
  }

  googleDriveConnectionStatus.textContent =
    "Google Drive could not sync just now. Changes remain queued safely on this device.";
  setGoogleDriveMenuState("disconnected");
}

function isGoogleDriveAuthorizationError(error: unknown): boolean {
  return (
    (error instanceof GoogleDriveRequestError ||
      error instanceof GoogleDriveConnectionRequestError) &&
    (error.status === 401 || error.status === 403)
  );
}

function pauseGoogleDriveSync(message: string): void {
  clearGoogleDriveSession();
  googleDriveConnectAction.textContent = "Resume Google Drive";
  googleDriveConnectionStatus.textContent = message;
  setGoogleDriveMenuState("disconnected");
}

function clearGoogleDriveSession(): void {
  stopGoogleDrivePolling();
  googleDriveStatusVersion += 1;
  googleDriveSyncSession = undefined;
  googleDriveAccessToken = undefined;
  googleDriveCredentialExpiresAt = undefined;
  googleDriveDisconnectAction.hidden = true;
}

function disconnectGoogleDriveLocally(): void {
  clearGoogleDriveSession();
  forgetGoogleDriveConnection();
  googleDriveConnectAction.textContent = "Connect Google Drive";
  googleDriveConnectionStatus.textContent =
    "Disconnected. Existing hidden Drive data was not deleted.";
  setGoogleDriveMenuState("disconnected");
}

function forgetGoogleDriveConnection(): void {
  try {
    window.localStorage.removeItem("laters-google-drive-last-connected");
  } catch {
    // Connection history is optional and does not contain a Google credential.
  }
}

function startGoogleDrivePolling(): void {
  stopGoogleDrivePolling();
  googleDrivePollTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      syncArticlesToGoogleDrive("Checking Google Drive for changes…");
    }
  }, GOOGLE_DRIVE_POLL_MS);
}

function stopGoogleDrivePolling(): void {
  if (googleDrivePollTimer !== undefined) {
    window.clearInterval(googleDrivePollTimer);
    googleDrivePollTimer = undefined;
  }
}

function setGoogleDriveMenuState(
  state: "connected" | "checking" | "disconnected",
): void {
  setApplicationMenuSyncState(applicationMenuAction, state);
}

function savedItemListsEqual(left: SavedItem[], right: SavedItem[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function refreshList(): Promise<void> {
  setBusy(true);

  try {
    currentItems = await store.listNewestFirst();
    renderItems(!hasRenderedInitialItems);
    hasRenderedInitialItems = true;
  } catch (error) {
    list.replaceChildren();
    emptyState.hidden = true;
    itemCount.textContent = "";
    showError(readableError(error, "Your saved articles could not be loaded."));
  } finally {
    loadingState.hidden = true;
    setBusy(false);
  }
}

function renderItems(animateEntries = false): void {
  const entries = createReadingListEntries(currentItems, pendingDeletion?.item);
  const rows = entries.map((entry, index) =>
    entry.isGhost
      ? createGhostRow(entry.item, pendingDeletion?.isLeaving ?? false)
      : createArticleRow(entry.item, animateEntries, index),
  );

  list.replaceChildren(pasteRow, ...rows);
  updateListSummary();
}

function updateListSummary(): void {
  emptyState.hidden = currentItems.length > 0;
  itemCount.textContent = `${currentItems.length} ${currentItems.length === 1 ? "item" : "items"}`;
}

function createPasteToAddRow(): HTMLLIElement {
  const row = document.createElement("li");
  row.className = "paste-row";
  row.setAttribute("role", "presentation");

  const pasteButton = document.createElement("button");
  pasteButton.className = "paste-action";
  pasteButton.type = "button";

  const icon = createSvg("paste-action-icon", "0 0 24 24");
  icon.setAttribute("stroke-width", "2");
  const clipboard = document.createElementNS("http://www.w3.org/2000/svg", "path");
  clipboard.setAttribute("d", "M9 5V3h6v2m-8 0H5v16h14V5h-2M9 5h6v3H9z");
  icon.append(clipboard);

  const label = document.createElement("span");
  label.textContent = "Paste a link";
  pasteButton.append(icon, label);

  const showPasteButton = (): void => {
    row.classList.remove("is-editing");
    row.replaceChildren(pasteButton);
  };

  const showPasteEntryForm = (): void => {
    row.classList.add("is-editing");

    const form = document.createElement("form");
    form.className = "paste-entry-form";
    form.noValidate = true;

    const inputLabel = document.createElement("label");
    inputLabel.className = "visually-hidden";
    inputLabel.htmlFor = "paste-entry-url";
    inputLabel.textContent = "Article URL";

    const controls = document.createElement("div");
    controls.className = "paste-entry-controls";

    const input = document.createElement("input");
    input.id = "paste-entry-url";
    input.className = "paste-entry-input";
    input.type = "url";
    input.inputMode = "url";
    input.autocomplete = "off";
    input.autocapitalize = "none";
    input.spellcheck = false;
    input.placeholder = "https://example.com/article";
    input.setAttribute("aria-describedby", "paste-entry-error");

    const addButton = document.createElement("button");
    addButton.className = "paste-add-action";
    addButton.type = "submit";
    addButton.textContent = "Add";

    const error = document.createElement("p");
    error.id = "paste-entry-error";
    error.className = "paste-entry-error";
    error.textContent = "That doesn't look like a link";
    error.hidden = true;

    const clearInputError = (): void => {
      input.removeAttribute("aria-invalid");
      error.hidden = true;
    };

    input.addEventListener("input", clearInputError);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !input.value.trim()) {
        event.preventDefault();
        showPasteButton();
        pasteButton.focus();
      }
    });

    form.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!row.contains(document.activeElement) && !input.value.trim()) {
          showPasteButton();
        }
      }, 0);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearInputError();

      void savePastedValue(input.value, "manual").then((result) => {
        if (result !== "invalid") {
          return;
        }

        input.setAttribute("aria-invalid", "true");
        error.hidden = false;
        input.focus();
      });
    });

    controls.append(input, addButton);
    form.append(inputLabel, controls, error);
    row.replaceChildren(form);
    window.requestAnimationFrame(() => input.focus());
  };

  pasteButton.addEventListener("click", () => {
    clearFeedback();
    pasteButton.disabled = true;

    const clipboard = "clipboard" in navigator ? navigator.clipboard : undefined;

    void readClipboardText(clipboard).then(async (clipboardText) => {
      if (!clipboardText) {
        pasteButton.disabled = false;
        showPasteEntryForm();
        return;
      }

      const result = await savePastedValue(clipboardText, "clipboard");
      pasteButton.disabled = false;

      if (result === "invalid") {
        showPasteEntryForm();
      }
    });
  });

  showPasteButton();
  return row;

  async function savePastedValue(
    value: string,
    source: "clipboard" | "manual",
  ): Promise<"saved" | "invalid" | "storage-error"> {
    let candidate: SavedItem;

    try {
      const input =
        source === "clipboard"
          ? parseShareTarget({ text: value })
          : parseShareTarget({ url: value });
      candidate = createSavedItem(input);
    } catch (error) {
      if (error instanceof SavedItemValidationError) {
        return "invalid";
      }

      showError("Laters could not understand that link. Please try again.");
      return "storage-error";
    }

    clearFeedback();
    finalisePendingDeletion();
    setBusy(true);

    try {
      const result = await saveCapturedItem(candidate, store);
      currentItems = result.items;
      syncArticlesToGoogleDrive();
      showPasteButton();
      renderItems();
      highlightSavedArticle(result.item.id);
      announceHiddenStatus(
        `Saved. ${currentItems.length} ${currentItems.length === 1 ? "article" : "articles"}.`,
      );
      return "saved";
    } catch {
      showError("Laters could not save that article. Please try again.");
      return "storage-error";
    } finally {
      setBusy(false);
    }
  }
}

function highlightSavedArticle(
  itemId: string,
  block: ScrollLogicalPosition = "nearest",
): void {
  const row = findRow(itemId);

  if (!row) {
    return;
  }

  row.classList.add("is-paste-highlight");
  row.scrollIntoView({ block });
  window.setTimeout(() => row.classList.remove("is-paste-highlight"), 1_100);
}

function createArticleRow(item: SavedItem, animate: boolean, index: number): HTMLLIElement {
  let currentItem = item;
  const source = createSourceIdentity(item.url);
  const row = document.createElement("div");
  row.className = "article-row";
  row.classList.toggle("is-bookmarked", item.bookmarked === true);

  if (animate) {
    row.classList.add("is-entering");
    row.style.setProperty("--entry-delay", `${Math.min(index, 6) * 60}ms`);
  }

  const content = document.createElement("div");
  content.className = "article-content";

  const sourceMarker = createSourceMarker(source);

  const link = document.createElement("a");
  link.className = "article-link";
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = item.title;

  const newTabHint = document.createElement("span");
  newTabHint.className = "visually-hidden";
  newTabHint.textContent = " (opens in a new tab)";
  link.append(newTabHint);

  let hadSelectionAtPointerDown = false;
  row.addEventListener("pointerdown", () => {
    hadSelectionAtPointerDown = selectionIntersectsRow(window.getSelection(), row);
  });
  row.addEventListener("pointercancel", () => {
    hadSelectionAtPointerDown = false;
  });
  row.addEventListener("click", (event) => {
    const target = event.target;
    const selection = window.getSelection();
    const hasSelectedText =
      hadSelectionAtPointerDown || selectionIntersectsRow(selection, row);
    hadSelectionAtPointerDown = false;

    if (
      shouldActivateArticleRow({
        button: event.button,
        defaultPrevented: event.defaultPrevented,
        targetIsInteractive:
          target instanceof Element && target.closest(INTERACTIVE_ROW_TARGET_SELECTOR) !== null,
        hasSelectedText,
      })
    ) {
      link.click();
    }
  });

  const meta = document.createElement("div");
  meta.className = "article-meta";

  const bookmarkButton = createBookmarkButton(item);
  bookmarkButton.addEventListener("click", () => {
    void (async () => {
      const updatedItem = await setArticleBookmarked(
        currentItem,
        currentItem.bookmarked !== true,
        row,
        bookmarkButton,
      );

      if (updatedItem) {
        currentItem = updatedItem;
      }
    })();
  });

  const metaText = document.createElement("span");
  metaText.className = "article-meta-text";

  const hostname = document.createElement("span");
  hostname.className = "article-hostname";
  hostname.textContent = source.hostname;

  const separator = document.createElement("span");
  separator.className = "article-meta-separator";
  separator.setAttribute("aria-hidden", "true");
  separator.textContent = "·";

  const savedTime = document.createElement("span");
  savedTime.textContent = `Saved ${formatSavedTime(item.savedAt)}`;

  metaText.append(hostname, separator, savedTime);
  meta.append(bookmarkButton, metaText);

  const deleteButton = createIconButton(`Delete “${item.title}”`);
  deleteButton.addEventListener("click", () => {
    void deleteArticle(currentItem, deleteButton);
  });

  content.append(link, meta);
  row.append(sourceMarker, content, deleteButton);
  return createMobileArticleShell(row, item.id, {
    getTitle: () => currentItem.title,
    getHostname: () => source.hostname,
    isBookmarked: () => currentItem.bookmarked === true,
    canOpenMenu: () => list.getAttribute("aria-busy") !== "true",
    read: () => link.click(),
    share: () => shareArticle(currentItem),
    updateTitle: async (title) => {
      const updatedItem = await setArticleTitle(
        currentItem,
        title,
        row,
        link,
        newTabHint,
        bookmarkButton,
        deleteButton,
      );

      if (!updatedItem) {
        return false;
      }

      currentItem = updatedItem;
      row.dispatchEvent(new CustomEvent(ARTICLE_TITLE_CHANGED_EVENT));
      return true;
    },
    toggleBookmark: async () => {
      const updatedItem = await setArticleBookmarked(
        currentItem,
        currentItem.bookmarked !== true,
        row,
        bookmarkButton,
      );

      if (updatedItem) {
        currentItem = updatedItem;
      }
    },
    delete: () => deleteArticle(currentItem, deleteButton),
  });
}

async function setArticleTitle(
  item: SavedItem,
  title: string,
  row: HTMLElement,
  link: HTMLAnchorElement,
  newTabHint: HTMLSpanElement,
  bookmarkButton: HTMLButtonElement,
  deleteButton: HTMLButtonElement,
): Promise<SavedItem | undefined> {
  clearFeedback();
  setRowActionsDisabled(row, true);

  try {
    const updatedItem = await store.setTitle(item.id, title);
    currentItems = currentItems.map((candidate) =>
      candidate.id === updatedItem.id ? updatedItem : candidate,
    );
    syncArticlesToGoogleDrive();
    link.replaceChildren(updatedItem.title, newTabHint);
    setBookmarkPresentation(
      bookmarkButton,
      updatedItem,
      updatedItem.bookmarked === true,
    );
    deleteButton.setAttribute("aria-label", `Delete “${updatedItem.title}”`);
    announceHiddenStatus(`Title changed to “${updatedItem.title}”.`);
    return updatedItem;
  } catch {
    return undefined;
  } finally {
    if (list.getAttribute("aria-busy") !== "true") {
      setRowActionsDisabled(row, false);
    }
  }
}

function shareArticle(item: SavedItem): void {
  clearFeedback();

  const shareData = createArticleShareData(item.url);

  if (
    typeof navigator.share !== "function" ||
    (typeof navigator.canShare === "function" && !navigator.canShare(shareData))
  ) {
    showError("Sharing is not available in this browser.");
    return;
  }

  void navigator.share(shareData).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    showError("Laters could not open the share sheet. Please try again.");
  });
}

function selectionIntersectsRow(selection: Selection | null, row: HTMLElement): boolean {
  if (!selection || selection.isCollapsed) {
    return false;
  }

  return [selection.anchorNode, selection.focusNode].some(
    (node) => node !== null && row.contains(node),
  );
}

function createSourceMarker(source: SourceIdentity): HTMLSpanElement {
  const marker = document.createElement("span");
  marker.className = "source-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.style.setProperty("--source-colour", source.colour);

  const fallback = document.createElement("span");
  fallback.className = `source-fallback${source.characters.length > 1 ? " is-two-character" : ""}`;
  fallback.textContent = source.characters;

  const favicon = document.createElement("img");
  favicon.className = "source-favicon";
  favicon.alt = "";
  favicon.draggable = false;

  marker.append(fallback, favicon);
  loadPublisherFavicon(favicon, source.faviconUrl, () => {
    marker.classList.add("has-favicon");
  });
  return marker;
}

function createBookmarkButton(item: SavedItem): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "bookmark-action";
  button.type = "button";

  const hollowIcon = createBookmarkIcon(
    "/icons/bookmark-star-hollow.svg",
    "bookmark-icon-hollow",
  );
  const filledIcon = createBookmarkIcon(
    "/icons/bookmark-star-filled.svg",
    "bookmark-icon-filled",
  );
  button.append(hollowIcon, filledIcon);
  setBookmarkPresentation(button, item, item.bookmarked === true);
  return button;
}

function createBookmarkIcon(source: string, stateClass: string): HTMLImageElement {
  const icon = document.createElement("img");
  icon.className = `bookmark-icon ${stateClass}`;
  icon.src = source;
  icon.alt = "";
  icon.draggable = false;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

async function setArticleBookmarked(
  item: SavedItem,
  bookmarked: boolean,
  row: HTMLElement,
  button: HTMLButtonElement,
): Promise<SavedItem | undefined> {
  clearFeedback();
  setRowActionsDisabled(row, true);
  setBookmarkPresentation(button, item, bookmarked);
  row.classList.toggle("is-bookmarked", bookmarked);
  row.dispatchEvent(
    new CustomEvent(BOOKMARK_STATE_CHANGED_EVENT, { detail: { bookmarked } }),
  );

  try {
    const updatedItem = await store.setBookmarked(item.id, bookmarked);
    currentItems = currentItems.map((candidate) =>
      candidate.id === updatedItem.id ? updatedItem : candidate,
    );
    syncArticlesToGoogleDrive();
    return updatedItem;
  } catch {
    setBookmarkPresentation(button, item, item.bookmarked === true);
    row.classList.toggle("is-bookmarked", item.bookmarked === true);
    row.dispatchEvent(
      new CustomEvent(BOOKMARK_STATE_CHANGED_EVENT, {
        detail: { bookmarked: item.bookmarked === true },
      }),
    );
    showError("Laters could not update that bookmark. Please try again.");
    return undefined;
  } finally {
    if (list.getAttribute("aria-busy") !== "true") {
      setRowActionsDisabled(row, false);
    }
  }
}

function setBookmarkPresentation(
  button: HTMLButtonElement,
  item: SavedItem,
  bookmarked: boolean,
): void {
  const state = getBookmarkControlState(item.title, bookmarked);
  button.setAttribute("aria-pressed", String(state.pressed));
  button.setAttribute("aria-label", state.label);
}

function setRowActionsDisabled(row: HTMLElement, disabled: boolean): void {
  row.querySelectorAll<HTMLButtonElement>("button").forEach((action) => {
    action.disabled = disabled;
  });

  const shell = row.closest(".article-row-shell");
  const slidingItem = shell?.querySelector<HTMLIonItemSlidingElement>("ion-item-sliding");
  const swipeActions = shell?.querySelectorAll<HTMLIonItemOptionElement>("ion-item-option");

  if (slidingItem) {
    slidingItem.disabled = disabled;
  }

  swipeActions?.forEach((swipeAction) => {
    swipeAction.disabled = disabled;
  });
}

function createGhostRow(item: SavedItem, isLeaving: boolean): HTMLLIElement {
  const row = document.createElement("li");
  row.className = `article-row is-ghost${isLeaving ? " is-leaving" : ""}`;
  row.dataset.itemId = item.id;

  const message = document.createElement("p");
  message.className = "article-ghost";
  message.textContent = `Deleted “${item.title}”.`;

  const undoButton = createIconButton("Undo delete", true);
  undoButton.addEventListener("click", () => {
    undoButton.disabled = true;
    void restoreArticle(item);
  });

  row.append(message, undoButton);
  return row;
}

function createIconButton(label: string, includeRing = false): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "delete-action";
  button.type = "button";
  button.setAttribute("aria-label", label);

  if (includeRing) {
    const ring = createSvg("undo-ring", "0 0 36 36");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "18");
    circle.setAttribute("cy", "18");
    circle.setAttribute("r", "16");
    ring.append(circle);
    button.append(ring);
  }

  const icons = document.createElement("span");
  icons.className = "delete-icons";

  const xIcon = createSvg("icon-x", "0 0 24 24");
  const xPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  xPath.setAttribute("d", "M6 6l12 12M18 6L6 18");
  xIcon.append(xPath);

  const undoIcon = createSvg("icon-undo", "0 0 24 24");
  const undoCorner = document.createElementNS("http://www.w3.org/2000/svg", "path");
  undoCorner.setAttribute("d", "M3 3v6h6");
  const undoArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  undoArrow.setAttribute("d", "M3.5 9a9 9 0 1 0 2.2-3.4L3 8");
  undoIcon.append(undoCorner, undoArrow);

  icons.append(xIcon, undoIcon);
  button.append(icons);
  return button;
}

function createSvg(className: string, viewBox: string): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add(className);
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2.4");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

async function deleteArticle(item: SavedItem, button: HTMLButtonElement): Promise<void> {
  clearFeedback();
  finalisePendingDeletion();
  const articleRow = findRow(item.id);
  const activeButton = articleRow?.querySelector<HTMLButtonElement>(".delete-action") ?? button;
  activeButton.disabled = true;

  try {
    await store.delete(item.id);
    currentItems = currentItems.filter((candidate) => candidate.id !== item.id);
    syncArticlesToGoogleDrive();
    pendingDeletion = { item, isLeaving: false };
    const ghostRow = createGhostRow(item, false);

    if (articleRow?.isConnected) {
      articleRow.replaceWith(ghostRow);
      updateListSummary();
    } else {
      renderItems();
    }

    announceHiddenStatus(`Deleted “${item.title}”.`);
    focusUndo(item.id, true);
    window.requestAnimationFrame(() => focusUndo(item.id, true));
    undoTimer = window.setTimeout(() => expireUndo(item), UNDO_WINDOW_MS);
  } catch (error) {
    activeButton.disabled = false;
    showError(readableError(error, "This article could not be deleted."));
  }
}

function expireUndo(item: SavedItem): void {
  undoTimer = undefined;

  if (pendingDeletion?.item.id !== item.id) {
    return;
  }

  const undoButton = findRow(item.id)?.querySelector<HTMLButtonElement>(".delete-action");

  if (document.activeElement === undoButton) {
    focusBesideRow(findRow(item.id));
  }

  pendingDeletion.isLeaving = true;
  const row = findRow(item.id);

  if (row) {
    row.style.height = `${row.getBoundingClientRect().height}px`;
    void row.offsetHeight;
    row.classList.add("is-leaving");
  }

  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : ROW_COLLAPSE_MS;

  collapseTimer = window.setTimeout(() => {
    collapseTimer = undefined;

    if (pendingDeletion?.item.id !== item.id) {
      return;
    }

    pendingDeletion = undefined;

    if (row?.isConnected) {
      row.remove();
      updateListSummary();
    } else {
      renderItems();
    }

    showStatus(`Deleted “${item.title}”.`);
  }, delay);
}

async function restoreArticle(item: SavedItem): Promise<void> {
  clearUndoTimer();
  const ghostRow = findRow(item.id);

  try {
    await store.restore(item);
    pendingDeletion = undefined;
    currentItems = createReadingListEntries([...currentItems, item]).map((entry) => entry.item);
    syncArticlesToGoogleDrive();
    const restoredIndex = currentItems.findIndex((candidate) => candidate.id === item.id);
    const restoredRow = createArticleRow(item, false, restoredIndex);

    if (ghostRow?.isConnected) {
      ghostRow.replaceWith(restoredRow);
      updateListSummary();
    } else {
      renderItems();
    }

    showStatus(`Restored “${item.title}”.`);
    window.requestAnimationFrame(() => focusArticle(item.id, true));
  } catch (error) {
    pendingDeletion = undefined;
    renderItems();
    showError(readableError(error, "This article could not be restored."));
    listHeading.focus();
  }
}

function focusUndo(itemId: string, preventScroll = false): void {
  findRow(itemId)
    ?.querySelector<HTMLButtonElement>(".delete-action")
    ?.focus({ preventScroll });
}

function focusArticle(itemId: string, preventScroll = false): void {
  findRow(itemId)
    ?.querySelector<HTMLAnchorElement>(".article-link")
    ?.focus({ preventScroll });
}

function focusBesideRow(row: HTMLElement | undefined): void {
  const adjacentLink =
    row?.nextElementSibling?.querySelector<HTMLAnchorElement>(".article-link") ??
    row?.previousElementSibling?.querySelector<HTMLAnchorElement>(".article-link");

  if (adjacentLink) {
    adjacentLink.focus({ preventScroll: true });
    return;
  }

  listHeading.focus({ preventScroll: true });
}

function findRow(itemId: string): HTMLElement | undefined {
  return [...list.querySelectorAll<HTMLElement>("[data-item-id]")].find(
    (candidate) => candidate.dataset.itemId === itemId,
  );
}

function finalisePendingDeletion(): void {
  if (!pendingDeletion) {
    return;
  }

  clearUndoTimer();
  clearCollapseTimer();
  const row = findRow(pendingDeletion.item.id);

  if (row?.contains(document.activeElement)) {
    focusBesideRow(row);
  }

  row?.remove();
  pendingDeletion = undefined;
  updateListSummary();
}

function showShareResult(): void {
  const url = new URL(window.location.href);
  const result = url.searchParams.get("share");

  if (!result) {
    return;
  }

  url.searchParams.delete("share");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

  if (result === "saved") {
    showStatus("Article saved to Laters.");
    return;
  }

  if (result === "invalid") {
    showError("That shared item did not contain a valid article link.");
    return;
  }

  if (result === "storage-error") {
    showError("Laters could not save that article. Please try again.");
  }
}

function setBusy(isBusy: boolean): void {
  list.setAttribute("aria-busy", String(isBusy));

  list
    .querySelectorAll<HTMLButtonElement | HTMLInputElement>("button, input")
    .forEach((control) => {
      control.disabled = isBusy;
    });
}

function clearFeedback(): void {
  statusMessage.replaceChildren();
  statusMessage.classList.remove("is-announcement-only");
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function announceHiddenStatus(message: string): void {
  errorMessage.hidden = true;
  statusMessage.textContent = message;
  statusMessage.classList.add("is-announcement-only");
}

function showStatus(message: string): void {
  errorMessage.hidden = true;
  statusMessage.classList.remove("is-announcement-only");
  statusMessage.textContent = message;
}

function showError(message: string): void {
  statusMessage.replaceChildren();
  statusMessage.classList.remove("is-announcement-only");
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearUndoTimer(): void {
  if (undoTimer !== undefined) {
    window.clearTimeout(undoTimer);
    undoTimer = undefined;
  }
}

function clearCollapseTimer(): void {
  if (collapseTimer !== undefined) {
    window.clearTimeout(collapseTimer);
    collapseTimer = undefined;
  }
}

function readableError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Required element #${id} was not found.`);
  }

  return element as T;
}
