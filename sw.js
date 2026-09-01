/* Market Maker terminal — service worker.
   Keeps the app installable + fast/offline for the static shell, WITHOUT ever caching
   live chain data (/rpc, /holders, /ethusd, Blockscout, LI.FI) — those are always network. */
const VERSION = "market-v2";
const SHELL = [
  "./",
  "./index.html",
  "./ethers.umd.min.js",
  "./artifacts.js",
  "./mm.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// never-cache dynamic endpoints (same-origin proxies + any live API)
function isDynamic(url) {
  return /\/(rpc|holders|ethusd)(\b|\/|$)/.test(url.pathname);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // POSTs (RPC) straight to network
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && isDynamic(url)) return; // live data — do not intercept

  // navigations: network-first so a fresh deploy always wins online; cache shell offline
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put("./index.html", cp)); return r; })
        .catch(() => caches.match("./index.html").then((m) => m || caches.match("./")))
    );
    return;
  }

  // same-origin static assets → stale-while-revalidate
  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const net = fetch(req).then((r) => {
          if (r && r.status === 200 && r.type === "basic") { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); }
          return r;
        }).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }

  // cross-origin: cache Google Fonts opportunistically, everything else network-only
  if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); return r; }).catch(() => cached))
    );
  }
});
