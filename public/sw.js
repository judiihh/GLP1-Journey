/* Minimal service worker — enables Chrome/Samsung "Install app" and mobile notifications. */

const CACHE_NAME = "glp1-journey-shell-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(["/manifest.webmanifest"]))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .catch(() => {})
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Leave cross-origin traffic (Supabase, fonts) entirely alone.
  if (new URL(request.url).origin !== self.location.origin) return;

  // Network-first. Must always resolve to a Response — returning undefined here
  // makes the request fail outright, which breaks script loads on flaky mobile data.
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached ?? Response.error();
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        return self.clients.openWindow("/");
      })
  );
});
