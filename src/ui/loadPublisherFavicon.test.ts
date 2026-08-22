import { describe, expect, it, vi } from "vitest";
import { loadPublisherFavicon } from "./loadPublisherFavicon";

describe("loadPublisherFavicon", () => {
  it("uses a no-referrer request and reveals an image only after successful decode", async () => {
    const image = new FakeImage();
    const showFavicon = vi.fn();

    loadPublisherFavicon(
      image as unknown as HTMLImageElement,
      "https://publisher.example/favicon.ico",
      showFavicon,
    );

    expect(image.referrerPolicy).toBe("no-referrer");
    expect(image.decoding).toBe("async");
    expect(image.src).toBe("https://publisher.example/favicon.ico");
    expect(showFavicon).not.toHaveBeenCalled();

    image.dispatchEvent(new Event("load"));
    await image.decodeResult;

    expect(image.decode).toHaveBeenCalledOnce();
    expect(showFavicon).toHaveBeenCalledOnce();
  });

  it("keeps the fallback when publisher image data cannot be decoded", async () => {
    const image = new FakeImage(Promise.reject(new Error("invalid image")));
    const showFavicon = vi.fn();

    loadPublisherFavicon(
      image as unknown as HTMLImageElement,
      "https://publisher.example/favicon.ico",
      showFavicon,
    );
    image.dispatchEvent(new Event("load"));
    await image.decodeResult.catch(() => undefined);
    await Promise.resolve();

    expect(showFavicon).not.toHaveBeenCalled();
  });

  it("keeps the fallback when the image fails to load", () => {
    const image = new FakeImage();
    const showFavicon = vi.fn();

    loadPublisherFavicon(
      image as unknown as HTMLImageElement,
      "https://publisher.example/favicon.ico",
      showFavicon,
    );
    image.dispatchEvent(new Event("error"));

    expect(image.decode).not.toHaveBeenCalled();
    expect(showFavicon).not.toHaveBeenCalled();
  });
});

class FakeImage extends EventTarget {
  src = "";
  referrerPolicy = "";
  decoding: "async" | "auto" | "sync" = "auto";
  readonly decode: ReturnType<typeof vi.fn>;

  constructor(readonly decodeResult: Promise<void> = Promise.resolve()) {
    super();
    this.decode = vi.fn(() => decodeResult);
  }
}
