import { describe, expect, it, vi } from "vitest";
import { ADD_LINK_STORAGE_KEY } from "../import/readingListAddLink";
import { installAddLinkSetup } from "./addLinkSetup";

function fixture(copyText = vi.fn(async (_text: string) => undefined)) {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  } as Storage;
  const button = () => Object.assign(new EventTarget(), { hidden: false, focus: vi.fn() });
  const enableAction = button();
  const disableAction = button();
  const copyAction = button();
  const instructions = { value: "", focus: vi.fn(), select: vi.fn() };
  const instructionsGroup = { hidden: false };
  const status = { textContent: "", classList: { toggle: vi.fn() }, setAttribute: vi.fn() };
  const refresh = installAddLinkSetup({
    enableAction: enableAction as unknown as HTMLButtonElement,
    disableAction: disableAction as unknown as HTMLButtonElement,
    copyAction: copyAction as unknown as HTMLButtonElement,
    instructions: instructions as unknown as HTMLTextAreaElement,
    instructionsGroup: instructionsGroup as HTMLElement,
    status: status as unknown as HTMLParagraphElement,
    baseUrl: "https://example.org",
    getStorage: () => storage,
    copyText,
  });
  return { enableAction, disableAction, copyAction, instructions, instructionsGroup, status, storage, copyText, refresh };
}

describe("add-link setup controls", () => {
  it("starts disabled and only creates private instructions after deliberate enabling", () => {
    const ui = fixture();
    expect(ui.storage.getItem(ADD_LINK_STORAGE_KEY)).toBeNull();
    expect(ui.instructions.value).toBe("");
    expect(ui.instructionsGroup.hidden).toBe(true);
    ui.enableAction.dispatchEvent(new Event("click"));
    expect(ui.enableAction.hidden).toBe(true);
    expect(ui.instructionsGroup.hidden).toBe(false);
    expect(ui.instructions.value).toContain(ui.storage.getItem(ADD_LINK_STORAGE_KEY));
    expect(ui.copyAction.focus).toHaveBeenCalledOnce();
  });

  it("clears private instructions and invalidates the code on disable", () => {
    const ui = fixture();
    ui.enableAction.dispatchEvent(new Event("click"));
    ui.disableAction.dispatchEvent(new Event("click"));
    expect(ui.storage.getItem(ADD_LINK_STORAGE_KEY)).toBeNull();
    expect(ui.instructions.value).toBe("");
    expect(ui.copyAction.hidden).toBe(true);
    expect(ui.status.textContent).toContain("Old add-links no longer work");
  });

  it("copies only the current authorised instructions", async () => {
    const ui = fixture();
    ui.enableAction.dispatchEvent(new Event("click"));
    ui.copyAction.dispatchEvent(new Event("click"));
    await vi.waitFor(() => expect(ui.copyText).toHaveBeenCalledWith(ui.instructions.value));
    ui.storage.removeItem(ADD_LINK_STORAGE_KEY);
    ui.refresh();
    ui.copyText.mockClear();
    ui.copyAction.dispatchEvent(new Event("click"));
    await Promise.resolve();
    expect(ui.copyText).not.toHaveBeenCalled();
    expect(ui.instructions.value).toBe("");
  });

  it("offers selectable instructions when clipboard access throws synchronously", async () => {
    const ui = fixture(vi.fn(() => { throw new Error("Clipboard unavailable"); }));
    ui.enableAction.dispatchEvent(new Event("click"));
    ui.copyAction.dispatchEvent(new Event("click"));
    await vi.waitFor(() => expect(ui.instructions.select).toHaveBeenCalledOnce());
    expect(ui.instructions.focus).toHaveBeenCalledOnce();
    expect(ui.status.textContent).toContain("Select and copy");
  });
});
