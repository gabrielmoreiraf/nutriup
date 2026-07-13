/* Service worker do NutriUp — cache básico do shell + fallback offline. */
const CACHE = "nutriup-v2";
const SHELL = ["/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Não interceptamos API, auth nem os chunks do Next (evita servir código velho).
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next")) return;

  // Navegações: sempre rede primeiro. Só cai no cache da MESMA rota quando offline
  // (nunca substitui por outra página — evita "clicar e continuar na tela errada").
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Estáticos do shell: cache primeiro.
  if (SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((r) => r || fetch(request)));
  }
});
