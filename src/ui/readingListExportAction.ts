import type { ReadingListExportResult } from "../export/readingListExport";

interface ReadingListExportActionOptions {
  action: HTMLButtonElement;
  status: HTMLParagraphElement;
  runExport(): Promise<ReadingListExportResult>;
  beforeExport?(): void;
}

export function installReadingListExportAction({
  action,
  status,
  runExport,
  beforeExport = () => undefined,
}: ReadingListExportActionOptions): void {
  action.addEventListener("click", () => {
    if (action.disabled) {
      return;
    }

    beforeExport();
    status.textContent = "Preparing your export…";
    status.classList.remove("is-error");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    action.disabled = true;
    action.textContent = "Exporting…";

    void runExport()
      .then(({ articleCount, outcome }) => {
        if (outcome === "cancelled") {
          status.textContent = "Export cancelled. Your articles have not changed.";
          return;
        }

        const articleLabel = `${articleCount} ${articleCount === 1 ? "article" : "articles"}`;
        status.textContent =
          outcome === "shared"
            ? `Exported ${articleLabel}.`
            : `Started a CSV download containing ${articleLabel}.`;
      })
      .catch(() => {
        status.classList.add("is-error");
        status.setAttribute("role", "alert");
        status.setAttribute("aria-live", "assertive");
        status.textContent =
          "Laters could not export your data. Your articles have not changed.";
      })
      .finally(() => {
        action.disabled = false;
        action.textContent = "Export data";
      });
  });
}
