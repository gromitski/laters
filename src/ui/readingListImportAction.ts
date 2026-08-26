import type { ReadingListImportPlan } from "../import/readingListImport";

export interface ReadingListImportReview extends ReadingListImportPlan {
  connectionWarning?: string;
}

export interface ReadingListImportResult {
  importedCount: number;
  firstImportedItemId?: string;
}

interface ReadingListImportActionOptions {
  action: HTMLButtonElement;
  fileInput: HTMLInputElement;
  review: HTMLElement;
  summary: HTMLParagraphElement;
  warning: HTMLParagraphElement;
  confirmAction: HTMLButtonElement;
  cancelAction: HTMLButtonElement;
  status: HTMLParagraphElement;
  prepareImport(file: File): Promise<ReadingListImportReview>;
  runImport(plan: ReadingListImportReview): Promise<ReadingListImportResult>;
  readError(error: unknown): string;
  beforeChoose?(): void;
  afterImport?(result: ReadingListImportResult): void;
}

export function installReadingListImportAction({
  action,
  fileInput,
  review,
  summary,
  warning,
  confirmAction,
  cancelAction,
  status,
  prepareImport,
  runImport,
  readError,
  beforeChoose = () => undefined,
  afterImport,
}: ReadingListImportActionOptions): void {
  let activePlan: ReadingListImportReview | undefined;
  let isBusy = false;

  action.addEventListener("click", () => {
    if (isBusy) {
      return;
    }

    beforeChoose();
    clearErrorState(status);
    fileInput.value = "";
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];

    if (!file || isBusy) {
      return;
    }

    activePlan = undefined;
    review.hidden = true;
    setBusy(true, "Checking…");
    setStatus(status, "Checking your CSV…");

    void prepareImport(file)
      .then((plan) => {
        activePlan = plan;
        summary.textContent = createReviewSummary(plan);
        warning.textContent = createReviewWarning(plan);
        warning.hidden = warning.textContent === "";

        if (plan.newArticleCount === 0) {
          review.hidden = true;
          setStatus(status, summary.textContent);
          return;
        }

        confirmAction.textContent = `Import ${articleLabel(plan.newArticleCount)}`;
        review.hidden = false;
        setStatus(status, "Review the import summary before continuing.");
        confirmAction.focus({ preventScroll: true });
      })
      .catch((error: unknown) => {
        activePlan = undefined;
        review.hidden = true;
        setError(status, readError(error));
      })
      .finally(() => {
        setBusy(false);
      });
  });

  cancelAction.addEventListener("click", () => {
    if (isBusy || !activePlan) {
      return;
    }

    activePlan = undefined;
    review.hidden = true;
    fileInput.value = "";
    setStatus(status, "Import cancelled. No articles were imported.");
    action.focus({ preventScroll: true });
  });

  confirmAction.addEventListener("click", () => {
    const plan = activePlan;
    let completedImport: ReadingListImportResult | undefined;

    if (!plan || isBusy) {
      return;
    }

    setBusy(true, "Importing…");
    confirmAction.disabled = true;
    cancelAction.disabled = true;
    setStatus(status, "Importing your articles…");

    void runImport(plan)
      .then((result) => {
        activePlan = undefined;
        review.hidden = true;
        fileInput.value = "";
        setStatus(status, `Imported ${articleLabel(result.importedCount)}.`);
        completedImport = result;
      })
      .catch((error: unknown) => {
        setError(status, readError(error));
      })
      .finally(() => {
        setBusy(false);
        confirmAction.disabled = false;
        cancelAction.disabled = false;

        if (completedImport && afterImport) {
          afterImport(completedImport);
        } else if (completedImport) {
          action.focus({ preventScroll: true });
        }
      });
  });

  function setBusy(busy: boolean, label = "Import CSV"): void {
    isBusy = busy;
    action.disabled = busy;
    action.textContent = label;
  }
}

function createReviewSummary(plan: ReadingListImportPlan): string {
  return [
    `${articleLabel(plan.newArticleCount)} ready to import.`,
    `${articleLabel(plan.existingArticleCount)} already in Laters.`,
    `${rowLabel(plan.duplicateRowCount)} in this file.`,
  ].join(" ");
}

function createReviewWarning(plan: ReadingListImportReview): string {
  return [
    plan.ignoredColumnCount > 0
      ? `${columnLabel(plan.ignoredColumnCount)} will be ignored.`
      : "",
    plan.ignoredTagCount > 0
      ? `${tagLabel(plan.ignoredTagCount)} will be ignored.`
      : "",
    plan.connectionWarning ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function articleLabel(count: number): string {
  return `${count} ${count === 1 ? "article" : "articles"}`;
}

function rowLabel(count: number): string {
  return `${count} duplicate ${count === 1 ? "row" : "rows"}`;
}

function columnLabel(count: number): string {
  return `${count} additional ${count === 1 ? "column" : "columns"}`;
}

function tagLabel(count: number): string {
  return `${count} unsupported ${count === 1 ? "tag" : "tags"}`;
}

function setStatus(status: HTMLParagraphElement, message: string): void {
  clearErrorState(status);
  status.textContent = message;
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
}

function setError(status: HTMLParagraphElement, message: string): void {
  status.classList.add("is-error");
  status.textContent = message;
  status.setAttribute("role", "alert");
  status.setAttribute("aria-live", "assertive");
}

function clearErrorState(status: HTMLParagraphElement): void {
  status.classList.remove("is-error");
}
