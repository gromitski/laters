import "./styles.css";
import type { SavedItem } from "./domain/savedItem";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import { IndexedDbReadingListStore } from "./storage/indexedDbReadingListStore";
import { requestPersistentStorage } from "./storage/requestPersistentStorage";
import { formatSavedTime } from "./ui/formatSavedTime";

const store = new IndexedDbReadingListStore();
const UNDO_WINDOW_MS = 7_000;
let undoTimer: number | undefined;

const list = requireElement<HTMLUListElement>("article-list");
const loadingState = requireElement<HTMLParagraphElement>("loading-state");
const emptyState = requireElement<HTMLParagraphElement>("empty-state");
const itemCount = requireElement<HTMLParagraphElement>("item-count");
const listHeading = requireElement<HTMLHeadingElement>("list-heading");
const statusMessage = requireElement<HTMLDivElement>("status-message");
const errorMessage = requireElement<HTMLParagraphElement>("error-message");
const updateMessage = requireElement<HTMLDivElement>("update-message");
const updateAction = requireElement<HTMLButtonElement>("update-action");

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

async function refreshList(): Promise<void> {
  setBusy(true);

  try {
    const items = await store.listNewestFirst();
    renderItems(items);
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

function renderItems(items: SavedItem[]): void {
  list.replaceChildren(...items.map(createArticleRow));
  emptyState.hidden = items.length > 0;
  itemCount.textContent = `${items.length} ${items.length === 1 ? "item" : "items"}`;
}

function createArticleRow(item: SavedItem): HTMLLIElement {
  const row = document.createElement("li");
  row.className = "article-row";
  row.dataset.itemId = item.id;

  const content = document.createElement("div");
  content.className = "article-content";

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

  const meta = document.createElement("p");
  meta.className = "article-meta";
  meta.textContent = `Saved ${formatSavedTime(item.savedAt)}`;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-action";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete “${item.title}”`);
  deleteButton.addEventListener("click", () => {
    void deleteArticle(item, deleteButton);
  });

  content.append(link, meta);
  row.append(content, deleteButton);
  return row;
}

async function deleteArticle(item: SavedItem, button: HTMLButtonElement): Promise<void> {
  clearMessages();
  button.disabled = true;

  try {
    await store.delete(item.id);
    await refreshList();
    showUndoStatus(item);
  } catch (error) {
    button.disabled = false;
    showError(readableError(error, "This article could not be deleted."));
  }
}

function showUndoStatus(item: SavedItem): void {
  clearMessages();

  const undoButton = document.createElement("button");
  undoButton.className = "undo-action";
  undoButton.type = "button";
  undoButton.textContent = "Undo";
  undoButton.addEventListener("click", () => {
    clearUndoTimer();
    undoButton.disabled = true;
    void restoreArticle(item);
  });

  statusMessage.append(document.createTextNode(`Deleted “${item.title}”. `), undoButton);
  undoButton.focus();
  undoTimer = window.setTimeout(() => {
    const undoHadFocus = document.activeElement === undoButton;
    showStatus(`Deleted “${item.title}”.`);

    if (undoHadFocus) {
      listHeading.focus();
    }
  }, UNDO_WINDOW_MS);
}

async function restoreArticle(item: SavedItem): Promise<void> {
  try {
    await store.save(item);
    await refreshList();
    showStatus(`Restored “${item.title}”.`);
    focusArticle(item.id);
  } catch (error) {
    showError(readableError(error, "This article could not be restored."));
  }
}

function focusArticle(itemId: string): void {
  const row = [...list.querySelectorAll<HTMLLIElement>(".article-row")].find(
    (candidate) => candidate.dataset.itemId === itemId,
  );
  row?.querySelector<HTMLAnchorElement>(".article-link")?.focus();
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

function clearMessages(): void {
  clearUndoTimer();
  statusMessage.replaceChildren();
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function showStatus(message: string): void {
  clearUndoTimer();
  errorMessage.hidden = true;
  statusMessage.textContent = message;
}

function showError(message: string): void {
  clearUndoTimer();
  statusMessage.replaceChildren();
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearUndoTimer(): void {
  if (undoTimer !== undefined) {
    window.clearTimeout(undoTimer);
    undoTimer = undefined;
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
