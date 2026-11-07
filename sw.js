// Offline-first service worker.
// Bump VERSION whenever you change any app file so phones pick up the update.
// Map files (maps/*.pmtiles) live in their own cache and are only downloaded when the user asks.
const VERSION = "sverige-v3";
const MAP_CACHE = "sverige-maps";
const FILES = [
  "./", "./index.html", "./app.js", "./data.js", "./manifest.webmanifest",
  "./vendor/maplibre-gl.js", "./vendor/maplibre-gl.css", "./vendor/pmtiles.js",
  "./maps/layers-light.json", "./maps/layers-dark.json",
  "./maps/sprites/light.json", "./maps/sprites/light.png", "./maps/sprites/light@2x.json", "./maps/sprites/light@2x.png",
  "./maps/sprites/dark.json", "./maps/sprites/dark.png", "./maps/sprites/dark@2x.json", "./maps/sprites/dark@2x.png",
  "./fonts/Noto%20Sans%20Italic/0-255.pbf",
  "./fonts/Noto%20Sans%20Italic/256-511.pbf",
  "./fonts/Noto%20Sans%20Italic/8192-8447.pbf",
  "./fonts/Noto%20Sans%20Medium/0-255.pbf",
  "./fonts/Noto%20Sans%20Medium/256-511.pbf",
  "./fonts/Noto%20Sans%20Medium/8192-8447.pbf",
  "./fonts/Noto%20Sans%20Regular/0-255.pbf",
  "./fonts/Noto%20Sans%20Regular/256-511.pbf",
  "./fonts/Noto%20Sans%20Regular/8192-8447.pbf",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== MAP_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve byte ranges of a downloaded map file from the cache.
async function serveMap(req) {
  const url = req.url.split("#")[0].split("?")[0];
  const hit = await caches.open(MAP_CACHE).then((c) => c.match(url));
  if (!hit) return fetch(req);
  const range = req.headers.get("range");
  if (!range) return hit;
  const blob = await hit.blob();
  const m = /bytes=(\d+)-(\d*)/.exec(range);
  if (!m) return new Response(blob, { status: 200 });
  const start = +m[1], end = m[2] ? Math.min(+m[2], blob.size - 1) : blob.size - 1;
  if (start >= blob.size) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + blob.size } });
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: { "Content-Type": "application/octet-stream", "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${blob.size}`, "Accept-Ranges": "bytes" }
  });
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // outside links go straight to the network
  if (url.pathname.endsWith(".pmtiles")) { e.respondWith(serveMap(e.request)); return; }
  if (url.pathname.endsWith("/maps/index.json")) { // network first, cached fallback
    e.respondWith(fetch(e.request).then((res) => { if (res.ok) { const c = res.clone(); caches.open(VERSION).then((ca) => ca.put(e.request, c)); } return res; })
      .catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
        return res;
      }).catch(() => hit || (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error()));
      return hit || net; // cache first, refresh quietly in the background
    })
  );
});
