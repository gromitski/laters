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
        listNewestFirst: async () => [],
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
      { listNewestFirst: async () => [], save },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://laters.test/?share=invalid");
    expect(save).not.toHaveBeenCalled();
  });

  it.each(["cross-site", "same-site"])(
    "rejects a %s website submission without writing it",
    async (fetchSite) => {
      const save = vi.fn();
      const response = await handleShareTargetRequest(
        createShareRequest(
          { url: "https://example.com/unwanted" },
          { "Sec-Fetch-Site": fetchSite, Origin: "https://attacker.example" },
        ),
        { listNewestFirst: async () => [], save },
      );

      expect(response.headers.get("location")).toBe("https://laters.test/?share=invalid");
      expect(save).not.toHaveBeenCalled();
    },
  );

  it("accepts a browser-generated share navigation", async () => {
    const save = vi.fn();
    const response = await handleShareTargetRequest(
      createShareRequest(
        { url: "https://example.com/shared" },
        {
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Dest": "document",
          Origin: "null",
        },
      ),
      { listNewestFirst: async () => [], save },
    );

    expect(response.headers.get("location")).toBe("https://laters.test/?share=saved");
    expect(save).toHaveBeenCalledOnce();
  });

  it("rejects an oversized share before reading or writing it", async () => {
    const save = vi.fn();
    const response = await handleShareTargetRequest(
      createShareRequest(
        { url: "https://example.com/shared" },
        { "Content-Length": String(128 * 1024 + 1) },
      ),
      { listNewestFirst: async () => [], save },
    );

    expect(response.headers.get("location")).toBe("https://laters.test/?share=invalid");
    expect(save).not.toHaveBeenCalled();
  });

  it("rejects an oversized share field without writing it", async () => {
    const save = vi.fn();
    const response = await handleShareTargetRequest(
      createShareRequest({
        text: `${"a".repeat(64 * 1024 + 1)} https://example.com/shared`,
      }),
      { listNewestFirst: async () => [], save },
    );

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
      { listNewestFirst: async () => [], save },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://laters.test/?share=invalid");
    expect(save).not.toHaveBeenCalled();
  });

  it("refreshes an existing URL instead of creating a duplicate", async () => {
    const save = vi.fn();
    const response = await handleShareTargetRequest(
      createShareRequest({
        title: "Updated title",
        url: "https://example.com/existing",
      }),
      {
        listNewestFirst: async () => [
          {
            id: "existing-id",
            title: "Original title",
            url: "https://example.com/existing",
            savedAt: 100,
          },
        ],
        save,
      },
    );

    expect(response.headers.get("location")).toBe("https://laters.test/?share=saved");
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "existing-id",
        title: "Updated title",
        url: "https://example.com/existing",
      }),
      "update",
    );
    expect(save.mock.calls[0]![0].savedAt).toBeGreaterThan(100);
  });

  it.each([false, true])(
    "preserves bookmark state %s when refreshing an existing URL",
    async (bookmarked) => {
      const save = vi.fn();
      await handleShareTargetRequest(
        createShareRequest({
          title: "Updated title",
          url: "https://example.com/existing",
        }),
        {
          listNewestFirst: async () => [
            {
              id: "existing-id",
              title: "Original title",
              url: "https://example.com/existing",
              savedAt: 100,
              bookmarked,
            },
          ],
          save,
        },
      );

      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "existing-id",
          title: "Updated title",
          bookmarked,
        }),
        "update",
      );
    },
  );

  it("keeps a legacy duplicate without inventing bookmark data", async () => {
    const save = vi.fn();
    await handleShareTargetRequest(
      createShareRequest({ url: "https://example.com/existing" }),
      {
        listNewestFirst: async () => [
          {
            id: "existing-id",
            title: "Original title",
            url: "https://example.com/existing",
            savedAt: 100,
          },
        ],
        save,
      },
    );

    expect(save.mock.calls[0]![0]).not.toHaveProperty("bookmarked");
  });

  it("reports a storage failure without exposing shared data in the redirect", async () => {
    const response = await handleShareTargetRequest(
      createShareRequest({ url: "https://example.com/private-path" }),
      {
        listNewestFirst: async () => [],
        save: async () => {
          throw new Error("Database unavailable");
        },
      },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://laters.test/?share=storage-error");
  });
});

function createShareRequest(
  fields: Record<string, string>,
  headers: Record<string, string> = {},
): Request {
  return new Request("https://laters.test/share-target", {
    method: "POST",
    body: new URLSearchParams(fields),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...headers,
    },
  });
}
