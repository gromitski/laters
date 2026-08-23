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
  let lastInteractionWasPointer = false;

  const markPointerInteraction = () => {
    lastInteractionWasPointer = true;
  };
  const markKeyboardInteraction = () => {
    lastInteractionWasPointer = false;
  };
  const focusAction = (action: HTMLButtonElement) => {
    action.classList.toggle("is-pointer-focus", lastInteractionWasPointer);
    action.focus({ preventScroll: true });
  };

  for (const action of [openAction, closeAction]) {
    action.addEventListener("pointerdown", markPointerInteraction);
    action.addEventListener("keydown", () => {
      markKeyboardInteraction();
      action.classList.remove("is-pointer-focus");
    });
    action.addEventListener("blur", () => {
      action.classList.remove("is-pointer-focus");
    });
  }

  modal.addEventListener("pointerdown", markPointerInteraction);
  modal.addEventListener("keydown", markKeyboardInteraction);

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
        focusAction(closeAction);
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
    queueMicrotask(() => {
      focusAction(openAction);
    });
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
