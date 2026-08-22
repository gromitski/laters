import { createSavedItem, SavedItemValidationError } from "../domain/savedItem";
import type { ReadingListStore } from "../storage/readingListStore";
import { parseShareTarget } from "./parseShareTarget";

type ShareCaptureStore = Pick<ReadingListStore, "save" | "listNewestFirst">;

export async function handleShareTargetRequest(
  request: Request,
  store: ShareCaptureStore,
): Promise<Response> {
  let formData: FormData;
  let item: ReturnType<typeof createSavedItem>;

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
    const existingItem = (await store.listNewestFirst()).find(
      (candidate) => candidate.url === item.url,
    );

    await store.save(existingItem ? { ...item, id: existingItem.id } : item);
    return shareResultRedirect(request.url, "saved");
  } catch {
    return shareResultRedirect(request.url, "storage-error");
  }
}

function readFormText(formData: FormData, fieldName: string): string | undefined {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : undefined;
}

function shareResultRedirect(requestUrl: string, result: string): Response {
  const redirectUrl = new URL("/", requestUrl);
  redirectUrl.searchParams.set("share", result);
  return Response.redirect(redirectUrl, 303);
}
