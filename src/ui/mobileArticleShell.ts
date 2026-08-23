import type { ActionSheetButton } from "@ionic/core";
import { initialize } from "@ionic/core/components";
import { defineCustomElement as defineActionSheet } from "@ionic/core/components/ion-action-sheet.js";
import { defineCustomElement as defineItem } from "@ionic/core/components/ion-item.js";
import { defineCustomElement as defineItemOption } from "@ionic/core/components/ion-item-option.js";
import { defineCustomElement as defineItemOptions } from "@ionic/core/components/ion-item-options.js";
import { defineCustomElement as defineItemSliding } from "@ionic/core/components/ion-item-sliding.js";
import {
  hasMovedBeyondLongPressTolerance,
  shouldStartLongPress,
  type GesturePoint,
} from "./mobileArticleGesturePolicy";

const LONG_PRESS_MS = 500;
const SWIPE_CLICK_SUPPRESSION_PX = 6;
const ROW_CONTROL_SELECTOR = "button, ion-item-option";
const SWIPE_STARTED_EVENT = "laters-swipe-started";
export const BOOKMARK_STATE_CHANGED_EVENT = "laters-bookmark-state-changed";
export const ARTICLE_TITLE_CHANGED_EVENT = "laters-article-title-changed";

initialize({ mode: "md" });
defineActionSheet();
defineItem();
defineItemOption();
defineItemOptions();
defineItemSliding();

type ArticleAction = "read" | "edit-title" | "bookmark" | "share" | "delete";

interface ArticleShellActions {
  getTitle(): string;
  getHostname(): string;
  isBookmarked(): boolean;
  canOpenMenu(): boolean;
  read(): void;
  share(): void;
  updateTitle(title: string): Promise<boolean>;
  toggleBookmark(): Promise<void>;
  delete(): Promise<void>;
}

interface LongPressState {
  pointerId: number;
  start: GesturePoint;
  timer: number;
}

let activeActionSheet: HTMLIonActionSheetElement | undefined;

export function createMobileArticleShell(
  articleRow: HTMLDivElement,
  itemId: string,
  actions: ArticleShellActions,
): HTMLLIElement {
  const shell = document.createElement("li");
  shell.className = "article-row-shell";
  shell.dataset.itemId = itemId;
  shell.setAttribute("role", "listitem");

  const slidingItem = document.createElement("ion-item-sliding");
  slidingItem.className = "article-sliding-item";

  const item = document.createElement("ion-item");
  item.className = "article-ion-item";
  item.lines = "none";
  item.append(articleRow);

  const deleteOptions = document.createElement("ion-item-options");
  deleteOptions.className = "swipe-options swipe-options-delete";
  deleteOptions.side = "end";

  const deleteOption = document.createElement("ion-item-option");
  deleteOption.className = "swipe-action swipe-delete-action";
  deleteOption.expandable = true;
  deleteOption.setAttribute("aria-label", `Delete “${actions.getTitle()}”`);
  deleteOption.append(createSwipeDeleteIcon(), document.createTextNode("Delete"));

  const bookmarkOptions = document.createElement("ion-item-options");
  bookmarkOptions.className = "swipe-options swipe-options-bookmark";
  bookmarkOptions.side = "start";

  const bookmarkOption = document.createElement("ion-item-option");
  bookmarkOption.className = "swipe-action swipe-bookmark-action";
  bookmarkOption.expandable = true;
  const bookmarkLabel = document.createElement("span");
  bookmarkOption.append(createSwipeBookmarkIcon(), bookmarkLabel);

  const updateBookmarkOption = (bookmarked = actions.isBookmarked()): void => {
    const isBookmarked = bookmarked;
    bookmarkLabel.textContent = isBookmarked ? "Remove" : "Bookmark";
    bookmarkOption.setAttribute(
      "aria-label",
      isBookmarked
        ? `Remove bookmark from “${actions.getTitle()}”`
        : `Bookmark “${actions.getTitle()}”`,
    );
  };
  updateBookmarkOption();
  articleRow.addEventListener(BOOKMARK_STATE_CHANGED_EVENT, (event) => {
    const detail = (event as CustomEvent<{ bookmarked: boolean }>).detail;
    updateBookmarkOption(detail.bookmarked);
  });
  articleRow.addEventListener(ARTICLE_TITLE_CHANGED_EVENT, () => {
    deleteOption.setAttribute("aria-label", `Delete “${actions.getTitle()}”`);
    updateBookmarkOption();
  });

  const moreActionsButton = createMoreActionsButton(actions.getTitle());
  const visibleDeleteButton = articleRow.querySelector(".delete-action");
  articleRow.insertBefore(moreActionsButton, visibleDeleteButton);
  articleRow.addEventListener(ARTICLE_TITLE_CHANGED_EVENT, () => {
    moreActionsButton.setAttribute(
      "aria-label",
      `More actions for “${actions.getTitle()}”`,
    );
  });

  let bookmarkChangeStarted = false;
  const requestBookmarkChange = async (): Promise<void> => {
    if (bookmarkChangeStarted) {
      return;
    }

    bookmarkChangeStarted = true;
    slidingItem.disabled = true;
    bookmarkOption.disabled = true;
    deleteOption.disabled = true;

    try {
      await actions.toggleBookmark();
      updateBookmarkOption();
      await slidingItem.close();
    } finally {
      bookmarkChangeStarted = false;
      slidingItem.disabled = false;
      bookmarkOption.disabled = false;
      deleteOption.disabled = false;
    }
  };

  bookmarkOption.addEventListener("click", () => {
    void requestBookmarkChange();
  });
  bookmarkOptions.addEventListener("ionSwipe", () => {
    void requestBookmarkChange();
  });
  bookmarkOptions.append(bookmarkOption);

  let deletionStarted = false;
  const requestDelete = (): void => {
    if (deletionStarted) {
      return;
    }

    deletionStarted = true;
    slidingItem.disabled = true;
    bookmarkOption.disabled = true;
    deleteOption.disabled = true;
    void actions.delete();
  };

  deleteOption.addEventListener("click", requestDelete);
  deleteOptions.addEventListener("ionSwipe", requestDelete);
  deleteOptions.append(deleteOption);
  slidingItem.append(bookmarkOptions, item, deleteOptions);
  shell.append(slidingItem);

  installSwipeClickGuard(shell, slidingItem);
  installActionMenuTriggers(articleRow, actions, moreActionsButton);

  return shell;
}

function installSwipeClickGuard(
  shell: HTMLLIElement,
  slidingItem: HTMLIonItemSlidingElement,
): void {
  let suppressRowClick = false;
  let resetTimer: number | undefined;

  slidingItem.addEventListener("ionDrag", (event) => {
    const detail = (event as CustomEvent<{ amount: number }>).detail;

    if (Math.abs(detail.amount) <= SWIPE_CLICK_SUPPRESSION_PX) {
      return;
    }

    suppressRowClick = true;
    shell.querySelector(".article-row")?.dispatchEvent(new Event(SWIPE_STARTED_EVENT));
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      suppressRowClick = false;
      resetTimer = undefined;
    }, 700);
  });

  shell.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      const isSwipeAction =
        target instanceof Element && target.closest("ion-item-option") !== null;

      if (!suppressRowClick || isSwipeAction) {
        return;
      }

      suppressRowClick = false;
      window.clearTimeout(resetTimer);
      resetTimer = undefined;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
}

function installActionMenuTriggers(
  articleRow: HTMLDivElement,
  actions: ArticleShellActions,
  moreActionsButton: HTMLButtonElement,
): void {
  let longPress: LongPressState | undefined;
  let suppressNextClick = false;
  let suppressClickTimer: number | undefined;

  const clearLongPress = (): void => {
    if (!longPress) {
      return;
    }

    window.clearTimeout(longPress.timer);
    longPress = undefined;
  };

  const openMenu = (
    returnFocus?: HTMLElement,
    suppressFollowingClick = false,
  ): void => {
    clearLongPress();

    if (!actions.canOpenMenu() || activeActionSheet) {
      return;
    }

    if (suppressFollowingClick) {
      suppressNextClick = true;
      window.clearTimeout(suppressClickTimer);
      suppressClickTimer = window.setTimeout(() => {
        suppressNextClick = false;
        suppressClickTimer = undefined;
      }, 1_200);
    }

    void showArticleActionSheet(articleRow, actions, returnFocus);
  };

  moreActionsButton.addEventListener("click", () => openMenu(moreActionsButton));

  articleRow.addEventListener("pointerdown", (event) => {
    const target = event.target;
    const startedOnControl =
      target instanceof Element && target.closest(ROW_CONTROL_SELECTOR) !== null;

    if (!shouldStartLongPress(event.pointerType, event.button, startedOnControl)) {
      return;
    }

    clearLongPress();
    longPress = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      timer: window.setTimeout(() => openMenu(undefined, true), LONG_PRESS_MS),
    };
  });

  articleRow.addEventListener("pointermove", (event) => {
    if (
      !longPress ||
      longPress.pointerId !== event.pointerId ||
      !hasMovedBeyondLongPressTolerance(longPress.start, {
        x: event.clientX,
        y: event.clientY,
      })
    ) {
      return;
    }

    clearLongPress();
  });

  articleRow.addEventListener("pointerup", clearLongPress);
  articleRow.addEventListener("pointercancel", clearLongPress);
  articleRow.addEventListener("lostpointercapture", clearLongPress);
  articleRow.addEventListener(SWIPE_STARTED_EVENT, clearLongPress);

  articleRow.addEventListener("contextmenu", (event) => {
    const target = event.target;
    const startedOnControl =
      target instanceof Element && target.closest(ROW_CONTROL_SELECTOR) !== null;

    if (startedOnControl || !actions.canOpenMenu()) {
      return;
    }

    event.preventDefault();
    openMenu();
  });

  articleRow.addEventListener("keydown", (event) => {
    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) {
      return;
    }

    event.preventDefault();
    openMenu();
  });

  articleRow.addEventListener(
    "click",
    (event) => {
      if (!suppressNextClick) {
        return;
      }

      suppressNextClick = false;
      window.clearTimeout(suppressClickTimer);
      suppressClickTimer = undefined;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
}

async function showArticleActionSheet(
  articleRow: HTMLDivElement,
  actions: ArticleShellActions,
  returnFocus?: HTMLElement,
): Promise<void> {
  const titleLink = articleRow.querySelector<HTMLAnchorElement>(".article-link");

  if (!titleLink) {
    return;
  }

  const focusTarget = returnFocus ?? titleLink;
  focusTarget.focus({ preventScroll: true });
  articleRow.classList.add("is-menu-open");

  const actionSheet = document.createElement("ion-action-sheet");
  activeActionSheet = actionSheet;
  actionSheet.mode = "md";
  actionSheet.cssClass = "article-action-sheet";
  actionSheet.header = actions.getTitle();
  actionSheet.subHeader = actions.getHostname();
  actionSheet.backdropDismiss = true;
  actionSheet.animated = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const buttons: ActionSheetButton[] = [
    {
      text: "Read now",
      data: { action: "read" satisfies ArticleAction },
      handler: () => {
        actions.read();
      },
    },
    {
      text: "Edit title",
      data: { action: "edit-title" satisfies ArticleAction },
    },
    {
      text: actions.isBookmarked() ? "Remove bookmark" : "Bookmark",
      data: { action: "bookmark" satisfies ArticleAction },
    },
    {
      text: "Share this article",
      data: { action: "share" satisfies ArticleAction },
      handler: () => {
        actions.share();
      },
    },
    {
      text: "Delete",
      role: "destructive",
      data: { action: "delete" satisfies ArticleAction },
    },
    {
      text: "Cancel",
      role: "cancel",
    },
  ];

  actionSheet.buttons = buttons;
  document.body.append(actionSheet);

  let action: ArticleAction | undefined;

  try {
    await actionSheet.present();
    const result = await actionSheet.onDidDismiss<{ action?: ArticleAction }>();
    action = result.data?.action;
  } finally {
    actionSheet.remove();
    articleRow.classList.remove("is-menu-open");

    if (activeActionSheet === actionSheet) {
      activeActionSheet = undefined;
    }
  }

  if (action === "edit-title") {
    await showArticleTitleDialog(articleRow, actions, focusTarget);
  } else if (action === "bookmark") {
    await actions.toggleBookmark();
  } else if (action === "delete") {
    await actions.delete();
  }

  if (focusTarget.isConnected) {
    focusTarget.focus({ preventScroll: true });
  }
}

async function showArticleTitleDialog(
  articleRow: HTMLDivElement,
  actions: ArticleShellActions,
  returnFocus?: HTMLElement,
): Promise<void> {
  const titleLink = articleRow.querySelector<HTMLAnchorElement>(".article-link");

  if (!titleLink) {
    return;
  }

  const dialog = document.createElement("dialog");
  dialog.className = "article-title-dialog";

  const form = document.createElement("form");
  form.method = "dialog";
  form.noValidate = true;

  const heading = document.createElement("h2");
  heading.textContent = "Edit title";
  const headingId = `edit-title-${crypto.randomUUID()}`;
  heading.id = headingId;
  dialog.setAttribute("aria-labelledby", headingId);

  const note = document.createElement("p");
  note.className = "article-title-note";
  note.textContent = "The article URL will stay unchanged.";

  const label = document.createElement("label");
  label.htmlFor = `${headingId}-input`;
  label.textContent = "Title";

  const input = document.createElement("input");
  input.id = label.htmlFor;
  input.name = "title";
  input.type = "text";
  input.value = actions.getTitle();
  input.maxLength = 240;
  input.autocomplete = "off";
  input.spellcheck = true;
  input.setAttribute("aria-describedby", `${headingId}-error`);

  const error = document.createElement("p");
  error.id = `${headingId}-error`;
  error.className = "article-title-error";
  error.textContent = "Enter a title.";
  error.hidden = true;

  const controls = document.createElement("div");
  controls.className = "article-title-controls";

  const cancelButton = document.createElement("button");
  cancelButton.className = "article-title-cancel";
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";

  const saveButton = document.createElement("button");
  saveButton.className = "article-title-save";
  saveButton.type = "submit";
  saveButton.textContent = "Save";

  let saveStarted = false;
  const setSaving = (saving: boolean): void => {
    saveStarted = saving;
    input.disabled = saving;
    cancelButton.disabled = saving;
    saveButton.disabled = saving;
    saveButton.textContent = saving ? "Saving…" : "Save";
  };

  const showError = (message: string): void => {
    input.setAttribute("aria-invalid", "true");
    error.textContent = message;
    error.hidden = false;
    input.focus();
  };

  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    error.hidden = true;
  });
  cancelButton.addEventListener("click", () => dialog.close("cancel"));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && !saveStarted) {
      dialog.close("cancel");
    }
  });
  dialog.addEventListener("cancel", (event) => {
    if (saveStarted) {
      event.preventDefault();
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = input.value.trim();

    if (!title) {
      showError("Enter a title.");
      return;
    }

    setSaving(true);
    void actions.updateTitle(title).then((saved) => {
      if (saved) {
        dialog.close("saved");
        return;
      }

      setSaving(false);
      showError("Laters could not save that title. Please try again.");
    });
  });

  controls.append(cancelButton, saveButton);
  form.append(heading, note, label, input, error, controls);
  dialog.append(form);
  document.body.append(dialog);
  dialog.showModal();
  input.select();

  await new Promise<void>((resolve) => {
    dialog.addEventListener("close", () => resolve(), { once: true });
  });

  dialog.remove();
  const focusTarget = returnFocus ?? titleLink;
  if (focusTarget.isConnected) {
    focusTarget.focus({ preventScroll: true });
  }
}

function createMoreActionsButton(title: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "more-actions";
  button.type = "button";
  button.setAttribute("aria-label", `More actions for “${title}”`);
  button.setAttribute("aria-haspopup", "dialog");

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.classList.add("more-actions-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");

  for (const x of [5, 12, 19]) {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", String(x));
    dot.setAttribute("cy", "12");
    dot.setAttribute("r", "1.75");
    dot.setAttribute("fill", "currentColor");
    icon.append(dot);
  }

  button.append(icon);
  return button;
}

function createSwipeDeleteIcon(): SVGSVGElement {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.classList.add("swipe-delete-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2.4");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M6 6l12 12M18 6L6 18");
  icon.append(path);
  return icon;
}

function createSwipeBookmarkIcon(): HTMLSpanElement {
  const icon = document.createElement("span");
  icon.className = "swipe-bookmark-icon";
  icon.setAttribute("aria-hidden", "true");
  return icon;
}
