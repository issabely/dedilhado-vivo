// Dedilhado Vivo: guarda o app no aparelho para funcionar sem internet.
const CACHE = "dedilhado-vivo-v36";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./three.min.js", "./config.js", "./css/style.css", "./js/app.js", "./js/repertoire.js", "./musicas/maria-tinha-um-carneirinho-partitura.musicxml", "./musicas/naquela-mesa.musicxml", "./musicas/ninguem-explica-deus.musicxml", "./musicas/sitio-do-picapau-amarelo.musicxml", "./musicas/let-it-go.musicxml", "./musicas/asa-branca.musicxml", "./musicas/aquarela.musicxml", "./musicas/fogao-de-lenha.musicxml", "./musicas/tico-tico-no-fuba.musicxml",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const isFont = url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com";
  if (url.origin !== location.origin && !isFont) return;
  // config.js: sempre tenta a versão mais nova primeiro, para valer na hora quando você editar
  if (url.pathname.endsWith("/config.js")){
    e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => { if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
