import { describe, expect, it, vi } from "vitest";
import type { ReadingListImportReview } from "./readingListImportAction";
import { installReadingListImportAction } from "./readingListImportAction";

describe("reading-list import action", () => {
  it("opens the local file picker and presents an accessible review", async () => {
    const elements = createElements();
    const prepareImport = vi.fn(async () => plan());
    install(elements, { prepareImport });

    elements.action.dispatchEvent(new Event("click"));
    expect(elements.fileInput.click).toHaveBeenCalledOnce();

    elements.fileInput.files = [new File(["url"], "articles.csv")];
    elements.fileInput.dispatchEvent(new Event("change"));
    expect(elements.action.disabled).toBe(true);
    expect(elements.action.textContent).toBe("Checking…");
    expect(elements.status.textContent).toBe("Checking your CSV…");
    await settlePromises();

    expect(prepareImport).toHaveBeenCalledOnce();
    expect(elements.action.disabled).toBe(false);
    expect(elements.action.textContent).toBe("Import CSV");
    expect(elements.review.hidden).toBe(false);
    expect(elements.summary.textContent).toBe(
      "2 articles ready to import. 1 article already in Laters. 1 duplicate row in this file.",
    );
    expect(elements.warning.textContent).toContain("1 additional column will be ignored.");
    expect(elements.warning.textContent).toContain("2 unsupported tags will be ignored.");
    expect(elements.warning.textContent).toContain("Duplicate checking covers this device only.");
    expect(elements.confirmAction.textContent).toBe("Import 2 articles");
    expect(elements.confirmAction.focus).toHaveBeenCalledOnce();
    expect(elements.status.textContent).toBe(
      "Review the import summary before continuing.",
    );
  });

  it("cancels a reviewed import without running it", async () => {
    const elements = createElements();
    const runImport = vi.fn(async () => ({ importedCount: 2 }));
    install(elements, { runImport });
    await chooseFile(elements);

    elements.cancelAction.dispatchEvent(new Event("click"));

    expect(runImport).not.toHaveBeenCalled();
    expect(elements.review.hidden).toBe(true);
    expect(elements.status.textContent).toBe(
      "Import cancelled. No articles were imported.",
    );
    expect(elements.action.focus).toHaveBeenCalledOnce();
  });

  it("imports only after confirmation and reports the committed count", async () => {
    const elements = createElements();
    const afterImport = vi.fn(() => {
      expect(elements.action.disabled).toBe(false);
      expect(elements.confirmAction.disabled).toBe(false);
      expect(elements.cancelAction.disabled).toBe(false);
    });
    const result = { importedCount: 2, firstImportedItemId: "one" };
    const runImport = vi.fn(async () => result);
    install(elements, { runImport, afterImport });
    await chooseFile(elements);

    elements.confirmAction.dispatchEvent(new Event("click"));
    expect(elements.action.disabled).toBe(true);
    expect(elements.confirmAction.disabled).toBe(true);
    expect(elements.cancelAction.disabled).toBe(true);
    expect(elements.status.textContent).toBe("Importing your articles…");
    await settlePromises();

    expect(runImport).toHaveBeenCalledWith(expect.objectContaining({ newArticleCount: 2 }));
    expect(afterImport).toHaveBeenCalledWith(result);
    expect(elements.action.focus).not.toHaveBeenCalled();
    expect(elements.review.hidden).toBe(true);
    expect(elements.status.textContent).toBe("Imported 2 articles.");
    expect(elements.status.getAttribute("role")).toBe("status");
    expect(elements.action.disabled).toBe(false);
    expect(elements.confirmAction.disabled).toBe(false);
  });

  it("returns focus to the import action when no completion handler is installed", async () => {
    const elements = createElements();
    install(elements);
    await chooseFile(elements);

    elements.confirmAction.dispatchEvent(new Event("click"));
    await settlePromises();

    expect(elements.action.focus).toHaveBeenCalledOnce();
  });

  it("reports validation failure as an alert without offering confirmation", async () => {
    const elements = createElements();
    install(elements, {
      prepareImport: async () => {
        throw new Error("Nothing was imported because row 2 has an invalid URL.");
      },
    });

    await chooseFile(elements);

    expect(elements.review.hidden).toBe(true);
    expect(elements.status.textContent).toBe(
      "Nothing was imported because row 2 has an invalid URL.",
    );
    expect(elements.status.getAttribute("role")).toBe("alert");
    expect(elements.status.getAttribute("aria-live")).toBe("assertive");
    expect(elements.status.classList.contains("is-error")).toBe(true);
  });

  it("reports a file containing no new articles without showing a review", async () => {
    const elements = createElements();
    install(elements, {
      prepareImport: async () => ({
        ...plan(),
        items: [],
        newArticleCount: 0,
        existingArticleCount: 3,
        duplicateRowCount: 0,
      }),
    });

    await chooseFile(elements);

    expect(elements.review.hidden).toBe(true);
    expect(elements.status.textContent).toContain("0 articles ready to import.");
    expect(elements.status.textContent).toContain("3 articles already in Laters.");
  });

  it("does nothing when the file picker is cancelled", () => {
    const elements = createElements();
    const prepareImport = vi.fn(async () => plan());
    install(elements, { prepareImport });

    elements.fileInput.files = [];
    elements.fileInput.dispatchEvent(new Event("change"));

    expect(prepareImport).not.toHaveBeenCalled();
    expect(elements.status.textContent).toBe("");
  });
});

interface FakeButton extends EventTarget {
  disabled: boolean;
  focus: ReturnType<typeof vi.fn>;
  textContent: string;
}

interface FakeFileInput extends EventTarget {
  click: ReturnType<typeof vi.fn>;
  files: File[];
  value: string;
}

interface FakeTextElement {
  classList: Pick<DOMTokenList, "add" | "contains" | "remove">;
  getAttribute(name: string): string | undefined;
  hidden: boolean;
  setAttribute(name: string, value: string): void;
  textContent: string;
}

interface FakeElements {
  action: FakeButton;
  fileInput: FakeFileInput;
  review: FakeTextElement;
  summary: FakeTextElement;
  warning: FakeTextElement;
  confirmAction: FakeButton;
  cancelAction: FakeButton;
  status: FakeTextElement;
}

function install(
  elements: FakeElements,
  overrides: {
    prepareImport?: (file: File) => Promise<ReadingListImportReview>;
    runImport?: (plan: ReadingListImportReview) => Promise<{
      importedCount: number;
      firstImportedItemId?: string;
    }>;
    afterImport?: (result: {
      importedCount: number;
      firstImportedItemId?: string;
    }) => void;
  } = {},
): void {
  installReadingListImportAction({
    action: elements.action as unknown as HTMLButtonElement,
    fileInput: elements.fileInput as unknown as HTMLInputElement,
    review: elements.review as unknown as HTMLElement,
    summary: elements.summary as unknown as HTMLParagraphElement,
    warning: elements.warning as unknown as HTMLParagraphElement,
    confirmAction: elements.confirmAction as unknown as HTMLButtonElement,
    cancelAction: elements.cancelAction as unknown as HTMLButtonElement,
    status: elements.status as unknown as HTMLParagraphElement,
    prepareImport: overrides.prepareImport ?? (async () => plan()),
    runImport: overrides.runImport ?? (async () => ({ importedCount: 2 })),
    readError: (error) =>
      error instanceof Error ? error.message : "Laters could not import that CSV.",
    afterImport: overrides.afterImport,
  });
}

async function chooseFile(elements: FakeElements): Promise<void> {
  elements.fileInput.files = [new File(["url"], "articles.csv")];
  elements.fileInput.dispatchEvent(new Event("change"));
  await settlePromises();
}

function plan(): ReadingListImportReview {
  return {
    items: [
      { id: "one", url: "https://example.com/one", title: "One", savedAt: 2 },
      { id: "two", url: "https://example.com/two", title: "Two", savedAt: 1 },
    ],
    newArticleCount: 2,
    existingArticleCount: 1,
    duplicateRowCount: 1,
    ignoredColumnCount: 1,
    ignoredTagCount: 2,
    totalArticleCount: 4,
    connectionWarning: "Duplicate checking covers this device only.",
  };
}

function createElements(): FakeElements {
  return {
    action: createButton("Import CSV"),
    fileInput: Object.assign(new EventTarget(), {
      click: vi.fn(),
      files: [] as File[],
      value: "",
    }),
    review: createTextElement(true),
    summary: createTextElement(),
    warning: createTextElement(true),
    confirmAction: createButton("Import articles"),
    cancelAction: createButton("Cancel"),
    status: createTextElement(),
  };
}

function createButton(textContent: string): FakeButton {
  return Object.assign(new EventTarget(), {
    disabled: false,
    focus: vi.fn(),
    textContent,
  });
}

function createTextElement(hidden = false): FakeTextElement {
  const attributes = new Map<string, string>();
  const classes = new Set<string>();

  return {
    classList: {
      add: (token) => classes.add(token),
      contains: (token) => classes.has(token),
      remove: (token) => classes.delete(token),
    },
    getAttribute: (name) => attributes.get(name),
    hidden,
    setAttribute: (name, value) => attributes.set(name, value),
    textContent: "",
  };
}

async function settlePromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
