import { describe, expect, it, vi } from "vitest";
import { installApplicationMenu } from "./applicationMenu";

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
});

function createAction(): EventTarget & { focus: ReturnType<typeof vi.fn> } {
  return Object.assign(new EventTarget(), { focus: vi.fn() });
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
