const CACHE_NAME = "circuit-grind-v1.0.0";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./sw.js", "./payload/01.txt", "./payload/02.txt", "./payload/03.txt", "./payload/04.txt", "./payload/05.txt", "./payload/06.txt"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response && response.status === 200 && response.type === "basic") caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))));
});
