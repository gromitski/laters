export function loadPublisherFavicon(
  image: HTMLImageElement,
  faviconUrl: string,
  showFavicon: () => void,
): void {
  image.referrerPolicy = "no-referrer";
  image.decoding = "async";
  image.addEventListener(
    "load",
    () => {
      void image.decode().then(showFavicon).catch(ignoreDecodeFailure);
    },
    { once: true },
  );
  image.src = faviconUrl;
}

function ignoreDecodeFailure(): void {
  // The deterministic tile remains visible when publisher image data cannot be decoded.
}
