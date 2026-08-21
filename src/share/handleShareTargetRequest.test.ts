import { describe, expect, it, vi } from "vitest";
import type { SavedItem } from "../domain/savedItem";
import { handleShareTargetRequest } from "./handleShareTargetRequest";

describe("handleShareTargetRequest", () => {
  it("saves a valid Android-style POST share and redirects with success", async () => {
    const savedItems: SavedItem[] = [];
    const response = await handleShareTargetRequest(
      createShareRequest({
        title: "A shared article",
        text: "Read this https://example.com/shared",
      }),
      {
        save: async (item) => {
          savedItems.push(item);
        },
      },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://laters.test/?share=saved");
    expect(savedItems).toHaveLength(1);
    expect(savedItems[0]).toMatchObject({
      title: "A shared article",
      url: "https://example.com/shared",
    });
  });

  it("does not write invalid shared data", async () => {
    const save = vi.fn();
    const response = await handleShareTargetRequest(
      createShareRequest({ title: "No link", text: "Nothing useful here" }),
      { save },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://laters.test/?share=invalid");
    expect(save).not.toHaveBeenCalled();
  });

  it("reports a malformed share request as invalid without writing it", async () => {
    const save = vi.fn();
    const response = await handleShareTargetRequest(
      new Request("https://laters.test/share-target", {
        method: "POST",
        body: "not form data",
        headers: { "content-type": "application/json" },
      }),
      { save },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://laters.test/?share=invalid");
    expect(save).not.toHaveBeenCalled();
  });

  it("reports a storage failure without exposing shared data in the redirect", async () => {
    const response = await handleShareTargetRequest(
      createShareRequest({ url: "https://example.com/private-path" }),
      {
        save: async () => {
          throw new Error("Database unavailable");
        },
      },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://laters.test/?share=storage-error");
  });
});

function createShareRequest(fields: Record<string, string>): Request {
  return new Request("https://laters.test/share-target", {
    method: "POST",
    body: new URLSearchParams(fields),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });
}
