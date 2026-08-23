import "@ionic/core/css/core.css";
import "./styles.css";
import type { SavedItem } from "./domain/savedItem";
import { createSourceIdentity, type SourceIdentity } from "./domain/sourceIdentity";
import {
  requestApplicationInstall,
  type ApplicationInstallPrompt,
} from "./pwa/installApplication";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import { IndexedDbReadingListStore } from "./storage/indexedDbReadingListStore";
import { requestPersistentStorage } from "./storage/requestPersistentStorage";
import { shouldActivateArticleRow } from "./ui/articleRowActivation";
import { createArticleShareData } from "./ui/articleShare";
import { formatSavedTime } from "./ui/formatSavedTime";
import { getBookmarkControlState } from "./ui/bookmarkPresentation";
import { createReadingListEntries } from "./ui/readingListPresentation";
import { loadPublisherFavicon } from "./ui/loadPublisherFavicon";
import {
  BOOKMARK_STATE_CHANGED_EVENT,
  createMobileArticleShell,
} from "./ui/mobileArticleShell";

const store = new IndexedDbReadingListStore();
const UNDO_WINDOW_MS = 7_000;
const ROW_COLLAPSE_MS = 460;
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

let applicationInstallPrompt: ApplicationInstallPrompt | undefined;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  applicationInstallPrompt = event as ApplicationInstallPrompt;
  installAction.hidden = false;
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

showShareResult();
void refreshList();
void requestPersistentStorage();
void registerServiceWorker(showUpdateAvailable);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    void refreshList();
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

function hideInstallAction(): void {
  applicationInstallPrompt = undefined;
  installAction.hidden = true;
  installAction.disabled = false;
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

  list.replaceChildren(...rows);
  updateListSummary();
}

function updateListSummary(): void {
  emptyState.hidden = list.children.length > 0;
  itemCount.textContent = `${currentItems.length} ${currentItems.length === 1 ? "item" : "items"}`;
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
    await store.save(item);
    pendingDeletion = undefined;
    currentItems = createReadingListEntries([...currentItems, item]).map((entry) => entry.item);
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

  list.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
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
