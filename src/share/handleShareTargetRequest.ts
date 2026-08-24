import { saveCapturedItem } from "../capture/saveCapturedItem";
import { createSavedItem, SavedItemValidationError } from "../domain/savedItem";
import type { ReadingListStore } from "../storage/readingListStore";
import { parseShareTarget } from "./parseShareTarget";

type ShareCaptureStore = Pick<ReadingListStore, "save" | "listNewestFirst">;

const SHARE_TARGET_CONTENT_TYPE = "application/x-www-form-urlencoded";
const MAX_SHARE_REQUEST_BYTES = 128 * 1024;
const MAX_SHARE_FIELD_LENGTH = 64 * 1024;

export async function handleShareTargetRequest(
  request: Request,
  store: ShareCaptureStore,
): Promise<Response> {
  let formData: FormData;
  let item: ReturnType<typeof createSavedItem>;

  if (!isAllowedShareTargetRequest(request)) {
    return shareResultRedirect(request.url, "invalid");
  }

  try {
    formData = await request.formData();
  } catch {
    return shareResultRedirect(request.url, "invalid");
  }

  try {
    const input = parseShareTarget({
      title: readFormText(formData, "title"),
      text: readFormText(formData, "text"),
      url: readFormText(formData, "url"),
    });
    item = createSavedItem(input);
  } catch (error) {
    return shareResultRedirect(
      request.url,
      error instanceof SavedItemValidationError ? "invalid" : "storage-error",
    );
  }

  try {
    await saveCapturedItem(item, store);
    return shareResultRedirect(request.url, "saved");
  } catch {
    return shareResultRedirect(request.url, "storage-error");
  }
}

function readFormText(formData: FormData, fieldName: string): string | undefined {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return undefined;
  }

  if (value.length > MAX_SHARE_FIELD_LENGTH) {
    throw new SavedItemValidationError("The shared item is too large to save safely.");
  }

  return value;
}

function isAllowedShareTargetRequest(request: Request): boolean {
  const contentType = request.headers.get("Content-Type")?.split(";", 1)[0]?.trim().toLowerCase();

  if (contentType !== SHARE_TARGET_CONTENT_TYPE) {
    return false;
  }

  const contentLength = request.headers.get("Content-Length");

  if (contentLength !== null) {
    const bytes = Number(contentLength);

    if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > MAX_SHARE_REQUEST_BYTES) {
      return false;
    }
  }

  const fetchSite = request.headers.get("Sec-Fetch-Site")?.toLowerCase();

  if (fetchSite && fetchSite !== "none" && fetchSite !== "same-origin") {
    return false;
  }

  const fetchMode = request.headers.get("Sec-Fetch-Mode")?.toLowerCase();

  if (fetchMode && fetchMode !== "navigate") {
    return false;
  }

  const fetchDestination = request.headers.get("Sec-Fetch-Dest")?.toLowerCase();

  if (fetchDestination && fetchDestination !== "document") {
    return false;
  }

  const origin = request.headers.get("Origin");

  if (origin && origin !== "null" && origin !== new URL(request.url).origin) {
    return false;
  }

  return true;
}

function shareResultRedirect(requestUrl: string, result: string): Response {
  const redirectUrl = new URL("/", requestUrl);
  redirectUrl.searchParams.set("share", result);
  return Response.redirect(redirectUrl, 303);
}
