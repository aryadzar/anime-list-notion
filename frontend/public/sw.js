// Service Worker for PWA Installation Support
const CACHE_NAME = "vault-tracker-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-first or bypass for live Notion data
  return;
});
