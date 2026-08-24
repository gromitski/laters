import { describe, expect, it, vi } from "vitest";
import type { ReadingListExportResult } from "../export/readingListExport";
import { installReadingListExportAction } from "./readingListExportAction";

describe("reading-list export action", () => {
  it.each([
    ["shared", 1, "Exported 1 article."],
    ["downloaded", 2, "Started a CSV download containing 2 articles."],
    ["cancelled", 3, "Export cancelled. Your articles have not changed."],
  ] as const)("reports a %s outcome accessibly", async (outcome, articleCount, message) => {
    const action = createAction();
    const status = createStatus();
    const beforeExport = vi.fn();

    installReadingListExportAction({
      action: action as unknown as HTMLButtonElement,
      status: status as unknown as HTMLParagraphElement,
      beforeExport,
      runExport: async () => result(outcome, articleCount),
    });

    action.dispatchEvent(new Event("click"));
    expect(action.disabled).toBe(true);
    expect(action.textContent).toBe("Exporting…");
    expect(status.textContent).toBe("Preparing your export…");
    await settlePromises();

    expect(beforeExport).toHaveBeenCalledOnce();
    expect(action.disabled).toBe(false);
    expect(action.textContent).toBe("Export data");
    expect(status.textContent).toBe(message);
    expect(status.getAttribute("role")).toBe("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.classList.contains("is-error")).toBe(false);
  });

  it("reports a failure as an alert and restores the action", async () => {
    const action = createAction();
    const status = createStatus();

    installReadingListExportAction({
      action: action as unknown as HTMLButtonElement,
      status: status as unknown as HTMLParagraphElement,
      runExport: async () => {
        throw new Error("storage failed");
      },
    });

    action.dispatchEvent(new Event("click"));
    await settlePromises();

    expect(action.disabled).toBe(false);
    expect(action.textContent).toBe("Export data");
    expect(status.textContent).toBe(
      "Laters could not export your data. Your articles have not changed.",
    );
    expect(status.getAttribute("role")).toBe("alert");
    expect(status.getAttribute("aria-live")).toBe("assertive");
    expect(status.classList.contains("is-error")).toBe(true);
  });

  it("ignores repeat activation while an export is running", () => {
    const action = createAction();
    const status = createStatus();
    const runExport = vi.fn(() => new Promise<ReadingListExportResult>(() => undefined));

    installReadingListExportAction({
      action: action as unknown as HTMLButtonElement,
      status: status as unknown as HTMLParagraphElement,
      runExport,
    });

    action.dispatchEvent(new Event("click"));
    action.dispatchEvent(new Event("click"));

    expect(runExport).toHaveBeenCalledOnce();
  });
});

function result(
  outcome: ReadingListExportResult["outcome"],
  articleCount: number,
): ReadingListExportResult {
  return { articleCount, outcome, fileName: "laters-export-v1-example.csv" };
}

function createAction(): EventTarget & {
  disabled: boolean;
  textContent: string;
} {
  return Object.assign(new EventTarget(), {
    disabled: false,
    textContent: "Export data",
  });
}

function createStatus(): {
  classList: Pick<DOMTokenList, "add" | "contains" | "remove">;
  getAttribute(name: string): string | undefined;
  setAttribute(name: string, value: string): void;
  textContent: string;
} {
  const attributes = new Map<string, string>();
  const classes = new Set<string>();

  return {
    classList: {
      add: (token) => {
        classes.add(token);
      },
      contains: (token) => classes.has(token),
      remove: (token) => {
        classes.delete(token);
      },
    },
    getAttribute: (name) => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
    textContent: "",
  };
}

async function settlePromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
