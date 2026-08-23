import { initialize } from "@ionic/core/components";
import { defineCustomElement as defineModal } from "@ionic/core/components/ion-modal.js";

initialize({ mode: "md" });
defineModal();

interface ApplicationMenuElements {
  modal: HTMLIonModalElement;
  openAction: HTMLButtonElement;
  closeAction: HTMLButtonElement;
  prefersReducedMotion?: () => boolean;
}

export function installApplicationMenu({
  modal,
  openAction,
  closeAction,
  prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
}: ApplicationMenuElements): void {
  modal.mode = "md";
  modal.breakpoints = [0, 1];
  modal.initialBreakpoint = 1;
  modal.backdropDismiss = true;
  modal.handle = true;
  modal.expandToScroll = false;
  modal.htmlAttributes = { "aria-label": "Menu" };

  let isOpening = false;
  let isPresented = false;

  openAction.addEventListener("click", () => {
    if (isOpening || isPresented) {
      return;
    }

    isOpening = true;
    modal.animated = !prefersReducedMotion();

    void modal
      .present()
      .then(() => {
        isPresented = true;
        closeAction.focus({ preventScroll: true });
      })
      .finally(() => {
        isOpening = false;
      });
  });

  closeAction.addEventListener("click", () => {
    void modal.dismiss(undefined, "close-action");
  });

  modal.addEventListener("ionModalDidDismiss", () => {
    isPresented = false;
    openAction.focus({ preventScroll: true });
  });
}

export function setApplicationMenuSyncState(
  action: HTMLButtonElement,
  state: "connected" | "checking" | "disconnected",
): void {
  action.dataset.syncState = state;
  action.setAttribute(
    "aria-label",
    state === "connected"
      ? "Open menu, Google Drive connected"
      : state === "checking"
        ? "Open menu, checking Google Drive"
        : "Open menu, Google Drive disconnected",
  );
}
