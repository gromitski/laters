import { describe, expect, it, vi } from "vitest";
import {
  installApplicationMenu,
  setApplicationMenuSyncState,
} from "./applicationMenu";

describe("application menu", () => {
  it("configures and opens the bottom drawer, then returns focus after dismissal", async () => {
    const modal = createModal();
    const openAction = createAction();
    const closeAction = createAction();

    installApplicationMenu({
      modal: modal as unknown as HTMLIonModalElement,
      openAction: openAction as unknown as HTMLButtonElement,
      closeAction: closeAction as unknown as HTMLButtonElement,
      prefersReducedMotion: () => false,
    });

    openAction.dispatchEvent(new Event("click"));
    await Promise.resolve();

    expect(modal.breakpoints).toEqual([0, 1]);
    expect(modal.initialBreakpoint).toBe(1);
    expect(modal.handle).toBe(true);
    expect(modal.htmlAttributes).toEqual({ "aria-label": "Menu" });
    expect(modal.animated).toBe(true);
    expect(modal.present).toHaveBeenCalledOnce();
    expect(closeAction.focus).toHaveBeenCalledWith({ preventScroll: true });

    modal.dispatchEvent(new Event("ionModalDidDismiss"));
    await Promise.resolve();
    expect(openAction.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("closes from its visible control and removes animation for reduced motion", async () => {
    const modal = createModal();
    const openAction = createAction();
    const closeAction = createAction();

    installApplicationMenu({
      modal: modal as unknown as HTMLIonModalElement,
      openAction: openAction as unknown as HTMLButtonElement,
      closeAction: closeAction as unknown as HTMLButtonElement,
      prefersReducedMotion: () => true,
    });

    openAction.dispatchEvent(new Event("click"));
    await Promise.resolve();
    closeAction.dispatchEvent(new Event("click"));

    expect(modal.animated).toBe(false);
    expect(modal.dismiss).toHaveBeenCalledWith(undefined, "close-action");
  });

  it("hides restored focus rings after pointer use but retains keyboard focus treatment", async () => {
    const modal = createModal();
    const openAction = createAction();
    const closeAction = createAction();

    installApplicationMenu({
      modal: modal as unknown as HTMLIonModalElement,
      openAction: openAction as unknown as HTMLButtonElement,
      closeAction: closeAction as unknown as HTMLButtonElement,
      prefersReducedMotion: () => false,
    });

    openAction.dispatchEvent(new Event("pointerdown"));
    openAction.dispatchEvent(new Event("click"));
    await Promise.resolve();
    expect(closeAction.classList.contains("is-pointer-focus")).toBe(true);

    closeAction.dispatchEvent(new Event("keydown"));
    expect(closeAction.classList.contains("is-pointer-focus")).toBe(false);

    modal.dispatchEvent(new Event("pointerdown"));
    modal.dispatchEvent(new Event("ionModalDidDismiss"));
    await Promise.resolve();
    expect(openAction.classList.contains("is-pointer-focus")).toBe(true);

    openAction.dispatchEvent(new Event("keydown"));
    modal.dispatchEvent(new Event("keydown"));
    modal.dispatchEvent(new Event("ionModalDidDismiss"));
    await Promise.resolve();
    expect(openAction.classList.contains("is-pointer-focus")).toBe(false);
  });

  it("exposes the real Google Drive state through the menu trigger", () => {
    const action = createSyncAction();

    setApplicationMenuSyncState(
      action as unknown as HTMLButtonElement,
      "connected",
    );
    expect(action.dataset.syncState).toBe("connected");
    expect(action.getAttribute("aria-label")).toBe(
      "Open menu, Google Drive connected",
    );

    setApplicationMenuSyncState(
      action as unknown as HTMLButtonElement,
      "checking",
    );
    expect(action.dataset.syncState).toBe("checking");
    expect(action.getAttribute("aria-label")).toBe(
      "Open menu, checking Google Drive",
    );

    setApplicationMenuSyncState(
      action as unknown as HTMLButtonElement,
      "disconnected",
    );
    expect(action.dataset.syncState).toBe("disconnected");
    expect(action.getAttribute("aria-label")).toBe(
      "Open menu, Google Drive disconnected",
    );
  });
});

function createAction(): EventTarget & {
  classList: Pick<DOMTokenList, "contains" | "remove" | "toggle">;
  focus: ReturnType<typeof vi.fn>;
} {
  const classes = new Set<string>();

  return Object.assign(new EventTarget(), {
    classList: {
      contains: (token: string) => classes.has(token),
      remove: (token: string) => {
        classes.delete(token);
      },
      toggle: (token: string, force?: boolean) => {
        const shouldAdd = force ?? !classes.has(token);
        if (shouldAdd) {
          classes.add(token);
        } else {
          classes.delete(token);
        }
        return shouldAdd;
      },
    },
    focus: vi.fn(),
  });
}

function createSyncAction(): {
  dataset: Record<string, string>;
  getAttribute(name: string): string | undefined;
  setAttribute(name: string, value: string): void;
} {
  const attributes = new Map<string, string>();

  return {
    dataset: {},
    getAttribute: (name) => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
  };
}

function createModal(): EventTarget & {
  mode?: string;
  breakpoints?: number[];
  initialBreakpoint?: number;
  backdropDismiss?: boolean;
  handle?: boolean;
  expandToScroll?: boolean;
  htmlAttributes?: Record<string, string>;
  animated?: boolean;
  present: ReturnType<typeof vi.fn>;
  dismiss: ReturnType<typeof vi.fn>;
} {
  return Object.assign(new EventTarget(), {
    present: vi.fn(async () => undefined),
    dismiss: vi.fn(async () => true),
  });
}
