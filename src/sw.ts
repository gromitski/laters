/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { handleShareTargetRequest } from "./share/handleShareTargetRequest";
import { IndexedDbReadingListStore } from "./storage/indexedDbReadingListStore";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { revision: string | null; url: string }>;
};

const SHARE_TARGET_PATH = "/share-target";
const store = new IndexedDbReadingListStore();

clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (
    event.request.method === "POST" &&
    requestUrl.origin === self.location.origin &&
    requestUrl.pathname === SHARE_TARGET_PATH
  ) {
    event.respondWith(handleShareTargetRequest(event.request, store));
  }
});
