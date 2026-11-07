/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { handleShareTargetRequest } from "./share/handleShareTargetRequest";
import { openActiveReadingList } from "./storage/googleDriveWorkspaces";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { revision: string | null; url: string }>;
};

const SHARE_TARGET_PATH = "/share-target";

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
    event.respondWith(openActiveReadingList()
      .then((store) => handleShareTargetRequest(event.request, store))
      .catch(() => Response.redirect(new URL("/?share=storage-error", self.location.origin), 303)));
  }
});
