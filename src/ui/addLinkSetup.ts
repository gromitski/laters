import {
  ADD_LINK_STORAGE_KEY, createAddLinkInstructions, enableAddLinks, readAddLinkCode, useAddLinkCode,
} from "../import/readingListAddLink";

interface AddLinkSetupOptions {
  enableAction: HTMLButtonElement;
  disableAction: HTMLButtonElement;
  copyAction: HTMLButtonElement;
  copyCodeAction: HTMLButtonElement;
  codeFallback: HTMLTextAreaElement;
  codeFallbackGroup: HTMLElement;
  pairingForm: HTMLFormElement;
  pairingCode: HTMLInputElement;
  pairingDetails: HTMLDetailsElement;
  instructions: HTMLTextAreaElement;
  instructionsGroup: HTMLElement;
  status: HTMLParagraphElement;
  baseUrl: string;
  getStorage(): Storage;
  copyText(text: string): Promise<void>;
}

export function installAddLinkSetup(options: AddLinkSetupOptions): () => void {
  const {
    enableAction, disableAction, copyAction, copyCodeAction, codeFallback, codeFallbackGroup,
    pairingForm, pairingCode, pairingDetails, instructions, instructionsGroup, status,
  } = options;
  const report = (message: string, error = false): void => {
    status.textContent = message;
    status.classList.toggle("is-error", error);
    status.setAttribute("role", error ? "alert" : "status");
  };
  const refresh = (): void => {
    let code: string | undefined;
    try { code = readAddLinkCode(options.getStorage()); } catch { /* Disabled if storage is unavailable. */ }
    enableAction.hidden = !!code;
    disableAction.hidden = !code;
    copyAction.hidden = !code;
    copyCodeAction.hidden = !code;
    codeFallbackGroup.hidden = true;
    codeFallback.value = code ?? "";
    instructionsGroup.hidden = !code;
    instructions.value = code ? createAddLinkInstructions(options.baseUrl, code) : "";
  };
  enableAction.addEventListener("click", () => {
    try {
      enableAddLinks(options.getStorage());
      refresh();
      report("Enabled here. Copy the instructions into your private triage chat once.");
      copyAction.focus();
    } catch {
      report("Add-links could not be enabled. Check that this browser allows site storage, then try again.", true);
    }
  });
  disableAction.addEventListener("click", () => {
    try {
      options.getStorage().removeItem(ADD_LINK_STORAGE_KEY);
      if (readAddLinkCode(options.getStorage())) throw new Error("Removal failed");
      refresh();
      pairingCode.value = "";
      report("Turned off here. Old add-links no longer work in this browser. Paired devices stay enabled. Your articles are unchanged.");
      enableAction.focus();
    } catch {
      report("Add-links could not be turned off. Try again or clear this site's storage after backing up your articles.", true);
    }
  });
  copyAction.addEventListener("click", () => {
    refresh();
    if (!instructions.value) return;
    void Promise.resolve().then(() => options.copyText(instructions.value))
      .then(() => report("Copied. Paste into your private triage chat or its instructions."))
      .catch(() => {
        report("Select and copy the instructions below, then paste into your private triage chat.");
        instructions.focus();
        instructions.select();
      });
  });
  copyCodeAction.addEventListener("click", () => {
    refresh();
    const code = codeFallback.value;
    if (!code) return;
    void Promise.resolve().then(() => options.copyText(code))
      .then(() => report("Code copied. On your other device, open Add from a chat → Use code from another device and paste it."))
      .catch(() => {
        refresh();
        if (codeFallback.value !== code) {
          report("The code changed. Copy it again.");
          return;
        }
        codeFallbackGroup.hidden = false;
        report("Select and copy the private code below, then paste it into Laters on your other device.");
        codeFallback.focus();
        codeFallback.select();
      });
  });
  pairingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      useAddLinkCode(options.getStorage(), pairingCode.value);
      pairingCode.value = "";
      pairingDetails.open = false;
      refresh();
      report("Paired here. Links from the same triage chat now work in both browsers. Article sync still uses Google Drive.");
      copyAction.focus();
    } catch {
      report("Pairing failed. Paste the full 64-character code copied from Laters on your other device and check that this browser allows site storage.", true);
      pairingCode.focus();
    }
  });
  refresh();
  return refresh;
}
