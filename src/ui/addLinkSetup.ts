import {
  ADD_LINK_STORAGE_KEY, createAddLinkInstructions, enableAddLinks, readAddLinkCode,
} from "../import/readingListAddLink";

interface AddLinkSetupOptions {
  enableAction: HTMLButtonElement;
  disableAction: HTMLButtonElement;
  copyAction: HTMLButtonElement;
  instructions: HTMLTextAreaElement;
  instructionsGroup: HTMLElement;
  status: HTMLParagraphElement;
  baseUrl: string;
  getStorage(): Storage;
  copyText(text: string): Promise<void>;
}

export function installAddLinkSetup(options: AddLinkSetupOptions): () => void {
  const { enableAction, disableAction, copyAction, instructions, instructionsGroup, status } = options;
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
      report("Turned off here. Old add-links no longer work. Your articles are unchanged.");
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
  refresh();
  return refresh;
}
