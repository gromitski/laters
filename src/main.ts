import "@ionic/core/css/core.css";
import "./styles.css";
import { version as applicationVersion } from "../package.json";
import { saveCapturedItem } from "./capture/saveCapturedItem";
import {
  ADD_LINK_STORAGE_KEY, importReadingListAddLink, readAddLinkCode, readAddLinkError,
} from "./import/readingListAddLink";
import { installAddLinkSetup } from "./ui/addLinkSetup";
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
import { GoogleDriveWorkspaces } from "./storage/googleDriveWorkspaces";
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
import { GoogleDriveConnectionDiagnostics } from "./sync/googleDriveConnectionDiagnostics";
import { GoogleDriveLiveSyncSession } from "./sync/googleDriveLiveSync";
import { parseShareTarget } from "./share/parseShareTarget";
import { shouldActivateArticleRow } from "./ui/articleRowActivation";
import { createArticleShareData } from "./ui/articleShare";
import { formatSavedTime } from "./ui/formatSavedTime";
import { installArticleViewMenu } from "./ui/articleViewMenu";
import { createReadingListTransition } from "./ui/readingListTransition";
import { getBookmarkControlState } from "./ui/bookmarkPresentation";
import {
  installApplicationMenu,
  setApplicationMenuSyncState,
} from "./ui/applicationMenu";
import {
  createReadingListEntries,
  groupReadingListEntries,
  type PublisherGroup,
  type ReadingListEntry,
  type ReadingListOrder,
} from "./ui/readingListPresentation";
import {
  countVisibleReadingListItems,
  filterReadingListEntries,
  getFocusIndexAfterRemoval,
  getReadingListViewPresentation,
  toggleReadingListView,
  type ReadingListView,
} from "./ui/readingListFilter";
import { installReadingListExportAction } from "./ui/readingListExportAction";
import {
  installReadingListImportAction,
  type ReadingListImportReview,
  type ReadingListImportResult,
} from "./ui/readingListImportAction";
import { loadPublisherFavicon } from "./ui/loadPublisherFavicon";
import { readClipboardText } from "./ui/readClipboardText";
import { installThemePreferenceController } from "./ui/themePreference";
import {
  ARTICLE_TITLE_CHANGED_EVENT,
  BOOKMARK_STATE_CHANGED_EVENT,
  createMobileArticleShell,
} from "./ui/mobileArticleShell";

async function startApplication(): Promise<void> {
const workspaces = new GoogleDriveWorkspaces();
let workspaceState = await workspaces.read();
let activeDatabase = workspaceState.active;
let store = new IndexedDbReadingListStore(activeDatabase);
let isChangingAccount = false;
let listEpoch = 0;
const importStores = new WeakMap<ReadingListImportPlan, IndexedDbReadingListStore>();
const workspaceChannel = typeof BroadcastChannel === "undefined" ? undefined : new BroadcastChannel("laters-active-list");
workspaceChannel?.addEventListener("message", () => {
  void workspaces.read().then((state) => {
    if (state.active !== activeDatabase) {
      clearGoogleDriveSession();
      window.location.reload();
    }
  }).catch(() => pauseGoogleDriveSync("Laters could not check the active list. Your articles remain saved locally."));
});
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
let readingListView: ReadingListView = "all";
let readingListOrder: ReadingListOrder = "newest";
let searchQuery = "";
let readingTool: "add" | "search" = "add";
let pendingDeletion: PendingDeletion | undefined;
let undoTimer: number | undefined;
let collapseTimer: number | undefined;
let hasRenderedInitialItems = false;
let googleDriveSyncSession: GoogleDriveLiveSyncSession | undefined;
let googleDriveAccessToken: string | undefined;
let googleDriveCredentialExpiresAt: number | undefined;
let googleDrivePollTimer: number | undefined;
let googleDriveStatusVersion = 0;
let googleDriveBackgroundedAt: number | undefined;

const list = requireElement<HTMLUListElement>("article-list");
const loadingState = requireElement<HTMLParagraphElement>("loading-state");
const emptyState = requireElement<HTMLParagraphElement>("empty-state");
const itemCount = requireElement<HTMLParagraphElement>("item-count");
const listHeading = requireElement<HTMLHeadingElement>("list-heading");
const articleView = requireElement<HTMLButtonElement>("article-view");
const articleViewMenu = requireElement<HTMLDivElement>("article-view-menu");
const listTransition = createReadingListTransition(list);
const articleFilterAction = requireElement<HTMLButtonElement>("article-filter-action");
const articleFilterLabel = requireElement<HTMLSpanElement>("article-filter-label");
const readingTools = requireElement<HTMLElement>("reading-tools");
const addLinkAction = requireElement<HTMLButtonElement>("add-link-action");
const addLinkPanel = requireElement<HTMLDivElement>("add-link-panel");
const searchAction = requireElement<HTMLButtonElement>("article-search-action");
const searchForm = requireElement<HTMLFormElement>("article-search-form");
const searchInput = requireElement<HTMLInputElement>("article-search");
const searchClearAction = requireElement<HTMLButtonElement>("article-search-clear");
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
const applicationVersionLabel = requireElement<HTMLSpanElement>("application-version");
const themeColorMeta = requireElement<HTMLMetaElement>("theme-color");
const themePreferenceControls = [
  requireElement<HTMLInputElement>("theme-system"),
  requireElement<HTMLInputElement>("theme-light"),
  requireElement<HTMLInputElement>("theme-dark"),
];
const googleDriveConnectAction = requireElement<HTMLButtonElement>(
  "google-drive-connect-action",
);
const googleDriveDisconnectAction = requireElement<HTMLButtonElement>(
  "google-drive-disconnect-action",
);
const googleDriveSwitchAction = requireElement<HTMLButtonElement>("google-drive-switch-action");
const googleDriveLocalAction = requireElement<HTMLButtonElement>("google-drive-local-list");
const googleDriveListChoice = requireElement<HTMLDivElement>("google-drive-list-choice");
const googleDriveConnectionStatus = requireElement<HTMLParagraphElement>(
  "google-drive-connection-status",
);
const googleDriveDiagnosticsText = requireElement<HTMLPreElement>("google-drive-diagnostics");
const googleDriveDiagnostics = new GoogleDriveConnectionDiagnostics({
  getStorage: () => window.sessionStorage,
  navigationType: (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type,
  wasDiscarded: (document as Document & { wasDiscarded?: boolean }).wasDiscarded,
  onChange: (report) => { googleDriveDiagnosticsText.textContent = report; },
});
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
let pastePanel = createPasteToAddPanel();
addLinkPanel.append(pastePanel);

let applicationInstallPrompt: ApplicationInstallPrompt | undefined;

installApplicationMenu({
  modal: applicationMenu,
  openAction: applicationMenuAction,
  closeAction: applicationMenuCloseAction,
});

installThemePreferenceController({
  controls: themePreferenceControls,
  documentElement: document.documentElement,
  themeColorMeta,
  systemPreference: window.matchMedia("(prefers-color-scheme: dark)"),
  storage: window.localStorage,
});

applicationVersionLabel.textContent = `Version ${applicationVersion}`;
const refreshAddLinkSetup = installAddLinkSetup({
  enableAction: requireElement<HTMLButtonElement>("add-links-enable"),
  disableAction: requireElement<HTMLButtonElement>("add-links-disable"),
  copyAction: requireElement<HTMLButtonElement>("add-links-copy"),
  copyCodeAction: requireElement<HTMLButtonElement>("add-links-copy-code"),
  codeFallback: requireElement<HTMLTextAreaElement>("add-links-code"),
  codeFallbackGroup: requireElement<HTMLElement>("add-links-code-group"),
  pairingForm: requireElement<HTMLFormElement>("add-links-pairing-form"),
  pairingCode: requireElement<HTMLInputElement>("add-links-pairing-code"),
  pairingDetails: requireElement<HTMLDetailsElement>("add-links-pairing"),
  instructions: requireElement<HTMLTextAreaElement>("add-links-instructions"),
  instructionsGroup: requireElement<HTMLElement>("add-links-instructions-group"),
  status: requireElement<HTMLParagraphElement>("add-links-status"),
  baseUrl: window.location.origin,
  getStorage: () => window.localStorage,
  copyText: (text) => navigator.clipboard.writeText(text),
});
window.addEventListener("storage", (event) => {
  if (event.key === ADD_LINK_STORAGE_KEY || event.key === null) refreshAddLinkSetup();
});
setGoogleDriveMenuState("disconnected");
removeStoredGoogleDriveCredential();

articleFilterAction.addEventListener("click", () => {
  clearFeedback();
  readingListView = toggleReadingListView(readingListView);
  renderItems();
});
const updateArticleView = installArticleViewMenu(
  articleView,
  requireElement<HTMLSpanElement>("article-view-label"),
  articleViewMenu,
  (order) => {
    if (order === readingListOrder) return;
    clearFeedback();
    readingListOrder = order;
    updateArticleView(order);
    listTransition.run(() => {
      renderItemsContent(false, true);
      announceHiddenStatus(readingListOrder === "publisher"
        ? "Grouped by publisher, A to Z. Newest articles first within each publisher."
        : readingListOrder === "oldest" ? "Showing oldest articles first."
        : "Showing newest articles first.");
    });
  },
);
articleView.addEventListener("click", listTransition.cancel);
articleView.addEventListener("keydown", listTransition.cancel);
searchForm.addEventListener("submit", (event) => event.preventDefault());
addLinkAction.addEventListener("click", () => {
  clearFeedback();
  selectReadingTool("add");
});
searchAction.addEventListener("click", () => {
  clearFeedback();
  selectReadingTool("search");
});
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  renderItems();
});
searchClearAction.addEventListener("click", clearArticleSearch);
searchForm.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    if (searchInput.value) clearArticleSearch();
    else selectReadingTool("add");
  }
});

function selectReadingTool(tool: "add" | "search", focus = true): void {
  if (tool !== readingTool) readingTools.classList.add("has-switched");
  readingTool = tool;
  readingTools.dataset.tool = tool;
  addLinkPanel.inert = tool !== "add";
  searchForm.inert = tool !== "search";
  addLinkPanel.setAttribute("aria-hidden", String(tool !== "add"));
  searchForm.setAttribute("aria-hidden", String(tool !== "search"));
  addLinkAction.setAttribute("aria-pressed", String(tool === "add"));
  searchAction.setAttribute("aria-pressed", String(tool === "search"));
  if (tool === "add") {
    const hadQuery = searchQuery.length > 0;
    resetArticleSearch();
    if (hadQuery) renderItems();
  }
  if (focus) {
    (tool === "search" ? searchInput : addLinkAction).focus({ preventScroll: true });
  }
}

function resetArticleSearch(): void {
  searchQuery = "";
  searchInput.value = "";
}

function clearArticleSearch(): void {
  resetArticleSearch();
  renderItems();
  searchInput.focus({ preventScroll: true });
}
for (const action of [articleFilterAction, addLinkAction, searchAction]) {
  action.addEventListener("pointerdown", () => {
    action.classList.add("is-pointer-focus");
  });
  action.addEventListener("keydown", () => {
    action.classList.remove("is-pointer-focus");
  });
  action.addEventListener("blur", () => {
    action.classList.remove("is-pointer-focus");
  });
}

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

googleDriveConnectAction.addEventListener("click", () => { void changeGoogleDriveAccount(false); });
googleDriveSwitchAction.addEventListener("click", () => { void changeGoogleDriveAccount(true); });
googleDriveLocalAction.addEventListener("click", () => {
  if (isChangingAccount) return;
  void openDeviceOnlyList();
});

async function changeGoogleDriveAccount(chooseAccount: boolean): Promise<void> {
  if (isChangingAccount) return;
  googleDriveDiagnostics.record("permission_requested");
  isChangingAccount = true;
  const previous = { session: googleDriveSyncSession, token: googleDriveAccessToken, expiry: googleDriveCredentialExpiresAt, database: activeDatabase };
  ++listEpoch;
  finalisePendingDeletion();
  clearGoogleDriveSession();
  setBusy(true);
  googleDriveConnectAction.disabled = true;
  googleDriveSwitchAction.disabled = true;
  googleDriveDisconnectAction.disabled = true;
  googleDriveLocalAction.disabled = true;
  setGoogleDriveMenuState("checking");
  googleDriveConnectAction.textContent = chooseAccount ? "Switching account…" : "Connecting…";
  googleDriveConnectionStatus.textContent = "Choose your Google account. Your lists will stay separate.";
  try {
    const boundList = workspaceState.accounts.some((account) => account.database === activeDatabase);
    const connection = await connectGoogleDrive(
      GOOGLE_DRIVE_CLIENT_ID, window, document,
      chooseAccount || !hasRememberedGoogleDriveConnection() || !boundList,
    );
    await establishGoogleDriveLiveSync(connection.accessToken, calculateGoogleDriveCredentialExpiry(connection.expiresInSeconds));
    googleDriveDiagnostics.accessGranted(connection.expiresInSeconds, googleDriveCredentialExpiresAt);
  } catch (error) {
    clearGoogleDriveSession();
    recordGoogleDriveFailure("connection_failed", error);
    googleDriveConnectionStatus.textContent = googleDriveConnectionError(error);
    if (!isGoogleDriveAuthorizationError(error) && previous.session && previous.database === activeDatabase &&
        (previous.expiry === undefined || previous.expiry > Date.now())) {
      googleDriveSyncSession = previous.session;
      googleDriveAccessToken = previous.token;
      googleDriveCredentialExpiresAt = previous.expiry;
      startGoogleDrivePolling();
      googleDriveConnectionStatus.textContent = "Account change did not complete. The previous list is still connected; no lists were combined.";
    }
  } finally {
    isChangingAccount = false;
    googleDriveConnectAction.disabled = false;
    googleDriveDisconnectAction.disabled = false;
    googleDriveSwitchAction.disabled = false;
    googleDriveLocalAction.disabled = false;
    setBusy(false);
    setGoogleDriveMenuState(googleDriveSyncSession ? "connected" : "disconnected");
  }
}

function chooseExistingList(): Promise<boolean> {
  googleDriveListChoice.hidden = false;
  const separate = requireElement<HTMLButtonElement>("google-drive-list-separate");
  const adopt = requireElement<HTMLButtonElement>("google-drive-list-adopt");
  const cancel = requireElement<HTMLButtonElement>("google-drive-list-cancel");
  separate.focus({ preventScroll: true });
  return new Promise((resolve, reject) => {
    const finish = (choice?: boolean) => {
      googleDriveListChoice.hidden = true;
      separate.removeEventListener("click", onSeparate);
      adopt.removeEventListener("click", onAdopt);
      cancel.removeEventListener("click", onCancel);
      applicationMenu.removeEventListener("ionModalDidDismiss", onCancel);
      if (choice === undefined) reject(new Error("google-popup-closed"));
      else resolve(choice);
    };
    const onSeparate = () => finish(false);
    const onAdopt = () => finish(true);
    const onCancel = () => finish();
    separate.addEventListener("click", onSeparate);
    adopt.addEventListener("click", onAdopt);
    cancel.addEventListener("click", onCancel);
    applicationMenu.addEventListener("ionModalDidDismiss", onCancel);
  });
}

async function openDeviceOnlyList(): Promise<void> {
  isChangingAccount = true;
  ++listEpoch;
  clearGoogleDriveSession();
  finalisePendingDeletion();
  setBusy(true);
  try {
    const state = await workspaces.read();
    const targetStore = new IndexedDbReadingListStore(state.local);
    const items = await targetStore.listNewestFirst();
    workspaceState = await workspaces.activate(state.local, state.revision);
    showWorkspace(targetStore, state.local, items);
    forgetGoogleDriveConnection();
    googleDriveConnectionStatus.textContent = "Device-only list. Other accounts’ articles and pending changes remain saved separately.";
  } catch (error) {
    googleDriveConnectionStatus.textContent = readableError(error, "The device-only list could not be opened. Your lists remain saved.");
  } finally {
    isChangingAccount = false;
    setBusy(false);
    setGoogleDriveMenuState("disconnected");
  }
}

googleDriveDisconnectAction.addEventListener("click", () => {
  if (isChangingAccount) return;
  googleDriveDiagnostics.record("disconnected");
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
      googleDriveDisconnectAction.hidden = !hasRememberedGoogleDriveConnection();
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
setGoogleDriveMenuState("disconnected");

showShareResult();
const initialListLoad = refreshList();
void initialListLoad.then(showWaitingGoogleDriveChanges);
let addLinkQueue = initialListLoad;
receiveAddLink();
window.addEventListener("hashchange", receiveAddLink);
void requestPersistentStorage();
void registerServiceWorker(showUpdateAvailable);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    googleDriveDiagnostics.record(googleDriveAccessToken ? "returned_connected" : "returned_disconnected", {
      seconds: googleDriveBackgroundedAt === undefined ? undefined : (Date.now() - googleDriveBackgroundedAt) / 1_000,
    });
    googleDriveBackgroundedAt = undefined;
    void workspaces.read().then((state) => {
      if (state.active !== activeDatabase) { clearGoogleDriveSession(); window.location.reload(); }
    }).catch(() => pauseGoogleDriveSync("Laters could not check the active list. Your articles remain saved locally."));
    if (googleDriveSyncSession) {
      syncArticlesToGoogleDrive("Checking Google Drive for changes…");
    } else {
      void refreshList();
    }
  } else {
    googleDriveBackgroundedAt = Date.now();
    googleDriveDiagnostics.record("backgrounded");
  }
});

window.addEventListener("online", () => {
  syncArticlesToGoogleDrive("Back online. Checking Google Drive…");
});

window.addEventListener("offline", () => {
  googleDriveDiagnostics.record("offline");
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
  const epoch = listEpoch;
  const csv = await readReadingListImportFile(file);
  if (epoch !== listEpoch) throw new ReadingListImportError("The account changed. Choose the import file again.");
  return prepareReadingListImportCsv(csv);
}

async function prepareReadingListImportCsv(csv: string): Promise<ReadingListImportReview> {
  if (isChangingAccount) throw new ReadingListImportError("Finish changing accounts before importing.");
  const targetStore = store;
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
  if (store !== targetStore || isChangingAccount) throw new ReadingListImportError("The account changed. Review the import again.");
  const plan = createReadingListImportPlan(csv, existingItems);
  const review = {
    ...plan,
    ...(!session && hasRememberedGoogleDriveConnection()
      ? {
          connectionWarning:
            "Google Drive is not connected, so duplicate checking covers this device only. Resume Drive first if you want its latest list included.",
        }
      : {}),
  };
  importStores.set(review, targetStore);
  return review;
}

function currentAddLinkCode(): string | undefined {
  try { return readAddLinkCode(window.localStorage); } catch { return undefined; }
}

function receiveAddLink(): void {
  const fragment = window.location.hash;
  if (!fragment.startsWith("#add=")) return;
  try {
    // Consume before parsing, rendering articles or making sync requests.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch {
    showError("Nothing was added. Laters could not clear this private add-link from the address.");
    return;
  }
  const receiptStore = store;
  addLinkQueue = addLinkQueue.then(async () => {
    if (receiptStore !== store || isChangingAccount) {
      showError("Nothing was added. Finish changing accounts, then open the add-link again.");
      return;
    }
    try {
      clearFeedback();
      showStatus("Adding your accepted articles…");
      const { plan, result } = await importReadingListAddLink(fragment, {
        readCode: currentAddLinkCode,
        prepareImport: prepareReadingListImportCsv,
        commitImport: commitReadingListImport,
      });
      const skipped = plan.totalArticleCount - result.importedCount;
      const localWarning = !googleDriveSyncSession && hasRememberedGoogleDriveConnection()
        ? " Saved on this device; resume Google Drive to sync and check its latest list." : "";
      const ignored = plan.ignoredColumnCount || plan.ignoredTagCount
        ? ` Ignored ${plan.ignoredColumnCount} additional columns and ${plan.ignoredTagCount} unsupported tags.` : "";
      const message = `Added ${result.importedCount} ${result.importedCount === 1 ? "article" : "articles"}.${skipped ? ` ${skipped} already saved or repeated.` : ""}${ignored}${localWarning}`;
      await applicationMenu.dismiss(undefined, "add-link-complete").catch(() => undefined);
      showStatus(message);
      if (result.firstImportedItemId) {
        const id = result.firstImportedItemId;
        window.requestAnimationFrame(() => {
          highlightSavedArticle(id, "center");
          focusArticle(id, true);
        });
      }
    } catch (error) {
      showError(readAddLinkError(error));
    }
  });
}

async function commitReadingListImport(
  plan: ReadingListImportPlan,
): Promise<ReadingListImportResult> {
  if (isChangingAccount || importStores.get(plan) !== store) throw new ReadingListImportError("The account changed. Review the import again.");
  const epoch = listEpoch;
  clearFeedback();
  finalisePendingDeletion();
  setBusy(true);

  try {
    const result = await store.importNew(plan.items);
    if (epoch !== listEpoch) throw new ReadingListImportError("The account changed. The import remains in its original list.");
    currentItems = result.items;
    readingListView = "all";
    resetArticleSearch();
    selectReadingTool("add", false);
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

  window.requestAnimationFrame(() => {
    void applicationMenu
      .dismiss(undefined, "import-complete")
      .then(() => {
        showStatus(
          `Imported ${result.importedCount} ${result.importedCount === 1 ? "article" : "articles"}. Showing the first imported article.`,
        );
        highlightSavedArticle(firstImportedItemId, "center");
        focusArticle(firstImportedItemId, true);
      })
      .catch(() => {
        importDataStatus.textContent = `Imported ${result.importedCount} ${result.importedCount === 1 ? "article" : "articles"}. Close the menu to view the imported list.`;
        importDataAction.focus({ preventScroll: true });
      });
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
  const account = workspaceState.accounts.find((account) => account.database === activeDatabase);
  if (account) {
    googleDriveConnectionStatus.textContent = account.remembered
      ? "Previously connected. Resume Google Drive to sync this account’s list."
      : "Disconnected. This account’s local list and pending changes remain saved.";
    return;
  }
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
  const account = workspaceState.accounts.find((account) => account.database === activeDatabase);
  if (account) return account.remembered;
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
  const epoch = listEpoch;
  try {
    const pendingOperations = await store.listPendingSyncOperations();
    if (epoch !== listEpoch) return;

    if (pendingOperations.length > 0 && hasRememberedGoogleDriveConnection() &&
        !googleDriveConnectAction.disabled) {
      googleDriveConnectAction.textContent = "Resume Google Drive";
      googleDriveConnectionStatus.textContent = `${pendingOperations.length} ${pendingOperations.length === 1 ? "change is" : "changes are"} waiting to sync.`;
    }
  } catch {
    // The main list already reports local storage errors; this status is optional.
  }
}

async function establishGoogleDriveLiveSync(accessToken: string, expiresAt?: number): Promise<void> {
  const probe = await runGoogleDriveConnectionProbe(fetch, accessToken);
  let state = await workspaces.read();
  if (state.active !== activeDatabase) throw new Error("The active list changed in another window. Reopen Laters and try again.");
  const knownAccount = state.accounts.find((account) => account.key === probe.fileId);
  let adopt = false;
  if (!knownAccount && state.active === state.local) {
    const [items, pending] = await Promise.all([store.listNewestFirst(), store.listPendingSyncOperations()]);
    if (items.length || pending.length) adopt = await chooseExistingList();
  }
  state = await workspaces.account(probe.fileId, adopt, state.revision);
  workspaceState = state;
  const database = state.accounts.find((account) => account.key === probe.fileId)!.database;
  const targetStore = new IndexedDbReadingListStore(database);
  const localItems = await targetStore.listNewestFirst();
  const articles = await initialiseGoogleDriveArticles(fetch, accessToken, localItems);
  const session = new GoogleDriveLiveSyncSession(fetch, accessToken, articles.fileId, articles);
  const result = await session.sync(targetStore);
  workspaceState = await workspaces.activate(database, state.revision, true);
  showWorkspace(targetStore, database, result.items);
  googleDriveSyncSession = session;
  googleDriveAccessToken = accessToken;
  googleDriveCredentialExpiresAt = expiresAt;
  rememberGoogleDriveConnection(probe.lastConnectedAt);
  googleDriveDiagnostics.record("connected");
  startGoogleDrivePolling();
  setGoogleDriveMenuState("connected");
  googleDriveConnectionStatus.textContent = `Up to date in Google Drive. Checking every ${GOOGLE_DRIVE_POLL_MS / 1_000} seconds while open.`;
  announceHiddenStatus(`Google Drive sync is active with ${result.items.length} ${result.items.length === 1 ? "article" : "articles"}.`);
}

function showWorkspace(targetStore: IndexedDbReadingListStore, database: string, items: SavedItem[]): void {
  ++listEpoch;
  finalisePendingDeletion();
  store = targetStore;
  activeDatabase = database;
  currentItems = items;
  readingListView = "all";
  readingListOrder = "newest";
  updateArticleView("newest");
  resetArticleSearch();
  selectReadingTool("add", false);
  const nextPastePanel = createPasteToAddPanel();
  pastePanel.replaceWith(nextPastePanel);
  pastePanel = nextPastePanel;
  clearFeedback();
  importDataCancelAction.click();
  importDataReview.hidden = true;
  importDataStatus.textContent = "";
  exportDataStatus.textContent = "";
  renderItems();
  workspaceChannel?.postMessage("changed");
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
    if (googleDriveConnectAction.disabled) {
      return;
    }
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
    googleDriveDiagnostics.record("expired");
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
  recordGoogleDriveFailure("sync_failed", error);
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

function recordGoogleDriveFailure(kind: "connection_failed" | "sync_failed", error: unknown): void {
  if (error instanceof Error) {
    if (error.message === "google-popup-closed" || error.message === "access_denied") {
      googleDriveDiagnostics.record("permission_cancelled");
      return;
    }
    if (error.message === "google-popup-failed") {
      googleDriveDiagnostics.record("popup_failed");
      return;
    }
    if (error.message === "Google’s permission service did not become available." ||
        error.message === "Google’s permission service could not be loaded.") {
      googleDriveDiagnostics.record("identity_failed");
      return;
    }
  }
  const requestError = error instanceof GoogleDriveRequestError || error instanceof GoogleDriveConnectionRequestError
    ? error : undefined;
  googleDriveDiagnostics.record(isGoogleDriveAuthorizationError(error) ? "rejected" : kind, {
    status: requestError?.status,
    reason: requestError?.reason,
  });
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
  googleDriveDisconnectAction.hidden = !hasRememberedGoogleDriveConnection();
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
  const disconnectedDatabase = activeDatabase;
  const account = workspaceState.accounts.find((account) => account.database === disconnectedDatabase);
  if (account) account.remembered = false;
  void workspaces.disconnect(disconnectedDatabase).then((state) => {
    if (activeDatabase === disconnectedDatabase) workspaceState = state;
  }).catch(() => {
    googleDriveConnectionStatus.textContent = "Sync stopped here. Laters could not save the disconnect preference; revoke access in Google Account permissions if needed.";
  });
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
  const knownList = workspaceState.accounts.some((account) => account.database === activeDatabase);
  googleDriveDisconnectAction.hidden = !(googleDriveSyncSession || hasRememberedGoogleDriveConnection());
  googleDriveSwitchAction.hidden = !(knownList || hasRememberedGoogleDriveConnection());
  googleDriveLocalAction.hidden = workspaceState.local === activeDatabase;
  if (state === "checking" && !googleDriveDisconnectAction.disabled) {
    googleDriveConnectAction.textContent = googleDriveSyncSession || hasRememberedGoogleDriveConnection()
      ? "Reconnecting…"
      : "Connecting…";
  } else if (state === "connected") {
    googleDriveConnectAction.textContent = "Reconnect Google Drive";
  } else if (state === "disconnected" && !googleDriveConnectAction.disabled) {
    googleDriveConnectAction.textContent = googleDriveSyncSession
      ? "Reconnect Google Drive"
      : hasRememberedGoogleDriveConnection() ? "Resume Google Drive" : "Connect Google Drive";
  }
}

function savedItemListsEqual(left: SavedItem[], right: SavedItem[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function refreshList(): Promise<void> {
  const epoch = listEpoch;
  setBusy(true);

  try {
    const items = await store.listNewestFirst();
    if (epoch !== listEpoch) return;
    currentItems = items;
    renderItems(!hasRenderedInitialItems);
    hasRenderedInitialItems = true;
  } catch (error) {
    if (epoch !== listEpoch) return;
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
  listTransition.cancel();
  renderItemsContent(animateEntries);
}

function renderItemsContent(animateEntries = false, reuseRows = false): void {
  const active = document.activeElement;
  const focusedRow = active instanceof HTMLElement
    ? active.closest<HTMLElement>("[data-item-id]")
    : null;
  const focusedId = focusedRow?.dataset.itemId;
  const focusedIndex = focusedId ? getVisibleArticleIndex(focusedId) : -1;
  const focusedAction = active instanceof HTMLElement
    ? ["article-link", "bookmark-action", "delete-action", "more-actions"]
        .find((className) => active.classList.contains(className))
    : undefined;
  const allEntries = createReadingListEntries(
    currentItems, pendingDeletion?.item, readingListOrder === "oldest" ? "oldest" : "newest",
  );
  const entries = filterReadingListEntries(allEntries, readingListView, searchQuery);
  // A view-only change moves existing controls, so a key already pressed on Undo keeps its target.
  const existingRows = reuseRows
    ? new Map([...list.querySelectorAll<HTMLLIElement>("[data-item-id]")]
        .map((row) => [row.dataset.itemId!, row]))
    : undefined;
  const createRow = (entry: ReadingListEntry, index: number): HTMLLIElement =>
    existingRows?.get(entry.item.id) ?? (entry.isGhost
      ? createGhostRow(entry.item, pendingDeletion?.isLeaving ?? false)
      : createArticleRow(entry.item, animateEntries, index));
  let rowIndex = 0;
  const rows = readingListOrder === "publisher"
    ? groupReadingListEntries(entries).map((group, index) =>
        createPublisherGroup(group, index, (entry) => createRow(entry, rowIndex++)))
    : entries.map(createRow);

  list.replaceChildren(...rows);
  list.classList.toggle("is-publisher-grouped", readingListOrder === "publisher");
  updateListSummary(entries);
  if (focusedId && focusedAction) {
    const replacement = findRow(focusedId)?.querySelector<HTMLElement>(`.${focusedAction}`);
    if (replacement) replacement.focus({ preventScroll: true });
    else focusAfterFilteredRemoval(focusedIndex);
  }
}

function createPublisherGroup(
  group: PublisherGroup,
  index: number,
  createRow: (entry: ReadingListEntry) => HTMLLIElement,
): HTMLLIElement {
  const container = document.createElement("li");
  container.className = "publisher-group";
  const section = document.createElement("section");
  const header = document.createElement("header");
  header.className = "publisher-group-heading";
  const heading = document.createElement("h3");
  heading.id = `publisher-heading-${index}`;
  heading.textContent = group.hostname;
  section.setAttribute("aria-labelledby", heading.id);
  const count = document.createElement("span");
  count.className = "publisher-group-count";
  header.append(heading, count);
  const articles = document.createElement("ul");
  articles.className = "publisher-articles";
  articles.setAttribute("aria-label", `Articles from ${group.hostname}`);
  articles.append(...group.entries.map(createRow));
  section.append(header, articles);
  container.append(section);
  return container;
}

function updatePublisherGroups(): void {
  for (const group of list.querySelectorAll<HTMLElement>(".publisher-group")) {
    // Retain a ghost-only group until its Undo route expires, without counting it as saved.
    if (!group.querySelector("[data-item-id]")) {
      group.remove();
      continue;
    }
    const count = group.querySelectorAll(".article-link").length;
    group.querySelector(".publisher-group-count")!.textContent =
      `${count} ${count === 1 ? "article" : "articles"}`;
  }
}

function updateListSummary(
  visibleEntries = filterReadingListEntries(
    createReadingListEntries(currentItems, pendingDeletion?.item),
    readingListView,
    searchQuery,
  ),
): void {
  const visibleCount = countVisibleReadingListItems(
    visibleEntries,
    readingListView,
    searchQuery,
  );
  const presentation = getReadingListViewPresentation(
    readingListView,
    currentItems.length,
    visibleCount,
    searchQuery,
  );

  listHeading.textContent = presentation.heading;
  updateArticleView(readingListOrder);
  updatePublisherGroups();
  list.setAttribute("aria-label", readingListOrder === "publisher"
    ? `${presentation.listLabel}, grouped by publisher` : presentation.listLabel);
  articleFilterLabel.textContent = presentation.actionLabel;
  articleFilterAction.setAttribute("aria-pressed", String(readingListView === "bookmarked"));
  articleFilterAction.hidden = readingListView === "all" && currentItems.length === 0;
  itemCount.textContent = presentation.countLabel;
  emptyState.textContent = presentation.emptyMessage;
  emptyState.hidden = visibleCount > 0;
  searchClearAction.hidden = searchInput.value.length === 0;
}

function createPasteToAddPanel(): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "paste-panel";

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
        if (readingTool === "add" && !row.contains(document.activeElement) && !input.value.trim()) {
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
    window.requestAnimationFrame(() => {
      if (readingTool === "add") input.focus({ preventScroll: true });
    });
  };

  pasteButton.addEventListener("click", () => {
    clearFeedback();
    pasteButton.disabled = true;

    const clipboard = "clipboard" in navigator ? navigator.clipboard : undefined;

    const epoch = listEpoch;
    void readClipboardText(clipboard).then(async (clipboardText) => {
      if (epoch !== listEpoch || isChangingAccount) return;
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
    if (isChangingAccount) return "storage-error";
    const epoch = listEpoch;
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
      if (epoch !== listEpoch) return "saved";
      currentItems = result.items;
      resetArticleSearch();
      selectReadingTool("add", false);
      if (result.item.bookmarked !== true) {
        readingListView = "all";
      }
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
  savedTime.textContent = formatSavedTime(item.savedAt);

  metaText.append(hostname, separator, savedTime);

  if (item.readTimeMinutes !== undefined) {
    const readTimeSeparator = document.createElement("span");
    readTimeSeparator.className = "article-meta-separator";
    readTimeSeparator.setAttribute("aria-hidden", "true");
    readTimeSeparator.textContent = "·";

    const readTime = document.createElement("span");
    readTime.textContent = `≈ ${item.readTimeMinutes} min read`;
    metaText.append(readTimeSeparator, readTime);
  }

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
  if (isChangingAccount || !currentItems.includes(item)) return undefined;
  const epoch = listEpoch;
  listTransition.cancel();
  clearFeedback();
  setRowActionsDisabled(row, true);
  const filteredIndex = getVisibleArticleIndex(item.id);

  try {
    const updatedItem = await store.setTitle(item.id, title);
    if (epoch !== listEpoch) return undefined;
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
    if (searchQuery.trim()) {
      // Let the existing title dialog close before replacing its source row.
      window.requestAnimationFrame(() => {
        const restoreFocus = row.contains(document.activeElement);
        renderItems();
        if (restoreFocus && !findRow(item.id)) focusAfterFilteredRemoval(filteredIndex);
      });
    }
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
  if (isChangingAccount || !currentItems.includes(item)) return undefined;
  const epoch = listEpoch;
  listTransition.cancel();
  clearFeedback();
  const filteredIndex = getVisibleArticleIndex(item.id);
  setRowActionsDisabled(row, true);
  setBookmarkPresentation(button, item, bookmarked);
  row.classList.toggle("is-bookmarked", bookmarked);
  row.dispatchEvent(
    new CustomEvent(BOOKMARK_STATE_CHANGED_EVENT, { detail: { bookmarked } }),
  );

  try {
    const updatedItem = await store.setBookmarked(item.id, bookmarked);
    if (epoch !== listEpoch) return undefined;
    currentItems = currentItems.map((candidate) =>
      candidate.id === updatedItem.id ? updatedItem : candidate,
    );
    syncArticlesToGoogleDrive();

    if (readingListView === "bookmarked" && !bookmarked) {
      renderItems();
      announceHiddenStatus(
        `Removed bookmark from “${item.title}”. The article remains saved and is no longer shown.`,
      );
      window.requestAnimationFrame(() => focusAfterFilteredRemoval(filteredIndex));
    }

    return updatedItem;
  } catch {
    if (epoch !== listEpoch) return undefined;
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
  if (isChangingAccount || !currentItems.includes(item)) return;
  const epoch = listEpoch;
  listTransition.cancel();
  clearFeedback();
  finalisePendingDeletion();
  const articleRow = findRow(item.id);
  const activeButton = articleRow?.querySelector<HTMLButtonElement>(".delete-action") ?? button;
  activeButton.disabled = true;

  try {
    await store.delete(item.id);
    if (epoch !== listEpoch) return;
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
    if (epoch !== listEpoch) return;
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
  if (isChangingAccount || pendingDeletion?.item !== item) return;
  const epoch = listEpoch;
  listTransition.cancel();
  clearUndoTimer();
  const ghostRow = findRow(item.id);

  try {
    await store.restore(item);
    if (epoch !== listEpoch) return;
    pendingDeletion = undefined;
    currentItems = createReadingListEntries([...currentItems, item]).map((entry) => entry.item);
    syncArticlesToGoogleDrive();
    const restoredIndex = currentItems.findIndex((candidate) => candidate.id === item.id);
    const restoredRow = createArticleRow(item, false, restoredIndex);

    const remainsVisible = filterReadingListEntries(
      [{ item, isGhost: false }], readingListView, searchQuery,
    ).length > 0;
    if (ghostRow?.isConnected && remainsVisible) {
      ghostRow.replaceWith(restoredRow);
      updateListSummary();
    } else {
      renderItems();
    }

    showStatus(`Restored “${item.title}”.`);
    window.requestAnimationFrame(() => {
      if (remainsVisible) focusArticle(item.id, true);
      else (readingTool === "search" ? searchInput : searchAction).focus({ preventScroll: true });
    });
  } catch (error) {
    if (epoch !== listEpoch) return;
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

function getVisibleArticleIndex(itemId: string): number {
  return getVisibleArticleRows().findIndex((row) => row.dataset.itemId === itemId);
}

function focusAfterFilteredRemoval(removedIndex: number): void {
  const rows = getVisibleArticleRows();
  const focusIndex = getFocusIndexAfterRemoval(removedIndex, rows.length);

  if (focusIndex === undefined) {
    const fallback = readingTool === "add"
      ? (articleFilterAction.hidden ? searchAction : articleFilterAction)
      : searchInput;
    fallback.focus({ preventScroll: true });
    return;
  }

  rows[focusIndex]
    ?.querySelector<HTMLAnchorElement>(".article-link")
    ?.focus({ preventScroll: true });
}

function getVisibleArticleRows(): HTMLElement[] {
  return [...list.querySelectorAll<HTMLElement>(".article-row-shell[data-item-id]")].filter(
    (row) => row.querySelector(".article-link") !== null,
  );
}

function focusBesideRow(row: HTMLElement | undefined): void {
  const rows = [...list.querySelectorAll<HTMLElement>("[data-item-id]")];
  const index = row ? rows.indexOf(row) : -1;
  const adjacentLink =
    rows.slice(index + 1).find((candidate) => candidate.querySelector(".article-link"))
      ?.querySelector<HTMLAnchorElement>(".article-link") ??
    rows.slice(0, index).reverse().find((candidate) => candidate.querySelector(".article-link"))
      ?.querySelector<HTMLAnchorElement>(".article-link");

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
  isBusy ||= isChangingAccount;
  importDataAction.disabled = isBusy;
  exportDataAction.disabled = isBusy;
  if (isBusy) {
    listTransition.cancel();
    if (articleViewMenu.matches(":popover-open")) articleViewMenu.hidePopover();
  }
  list.setAttribute("aria-busy", String(isBusy));
  articleFilterAction.disabled = isBusy;
  articleView.disabled = isBusy;
  addLinkAction.disabled = isBusy;
  searchAction.disabled = isBusy;
  searchInput.disabled = isBusy;
  searchClearAction.disabled = isBusy;

  for (const container of [list, pastePanel]) {
    container.querySelectorAll<HTMLButtonElement | HTMLInputElement>("button, input")
      .forEach((control) => {
        control.disabled = isBusy;
      });
  }
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

}

void startApplication().catch(() => {
  const error = document.getElementById("error-message");
  if (error) { error.hidden = false; error.textContent = "Laters could not open its saved lists. Your data has not been replaced. Close other Laters windows and try again."; }
});
