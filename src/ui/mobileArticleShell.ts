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

initialize({ mode: "md" });
defineActionSheet();
defineItem();
defineItemOption();
defineItemOptions();
defineItemSliding();

type ArticleAction = "read" | "bookmark" | "delete";

interface ArticleShellActions {
  getTitle(): string;
  getHostname(): string;
  isBookmarked(): boolean;
  canOpenMenu(): boolean;
  read(): void;
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

  const options = document.createElement("ion-item-options");
  options.side = "end";

  const deleteOption = document.createElement("ion-item-option");
  deleteOption.className = "swipe-delete-action";
  deleteOption.expandable = true;
  deleteOption.setAttribute("aria-label", `Delete “${actions.getTitle()}”`);
  deleteOption.append(createSwipeDeleteIcon(), document.createTextNode("Delete"));

  let deletionStarted = false;
  const requestDelete = (): void => {
    if (deletionStarted) {
      return;
    }

    deletionStarted = true;
    slidingItem.disabled = true;
    deleteOption.disabled = true;
    void actions.delete();
  };

  deleteOption.addEventListener("click", requestDelete);
  options.addEventListener("ionSwipe", requestDelete);
  options.append(deleteOption);
  slidingItem.append(item, options);
  shell.append(slidingItem);

  installSwipeClickGuard(shell, slidingItem);
  installActionMenuTriggers(articleRow, actions);

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

  const openMenu = (): void => {
    clearLongPress();

    if (!actions.canOpenMenu() || activeActionSheet) {
      return;
    }

    suppressNextClick = true;
    window.clearTimeout(suppressClickTimer);
    suppressClickTimer = window.setTimeout(() => {
      suppressNextClick = false;
      suppressClickTimer = undefined;
    }, 1_200);
    void showArticleActionSheet(articleRow, actions);
  };

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
      timer: window.setTimeout(openMenu, LONG_PRESS_MS),
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
): Promise<void> {
  const titleLink = articleRow.querySelector<HTMLAnchorElement>(".article-link");

  if (!titleLink) {
    return;
  }

  titleLink.focus({ preventScroll: true });
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
      text: actions.isBookmarked() ? "Remove bookmark" : "Bookmark",
      data: { action: "bookmark" satisfies ArticleAction },
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

  try {
    await actionSheet.present();
    const result = await actionSheet.onDidDismiss<{ action?: ArticleAction }>();
    const action = result.data?.action;

    if (action === "bookmark") {
      await actions.toggleBookmark();
    } else if (action === "delete") {
      await actions.delete();
    }
  } finally {
    articleRow.classList.remove("is-menu-open");

    if (activeActionSheet === actionSheet) {
      activeActionSheet = undefined;
    }
  }
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
