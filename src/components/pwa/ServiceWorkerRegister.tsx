"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    // Em desenvolvimento o SW só atrapalha (cache + HMR = navegação instável).
    // Desregistramos qualquer SW antigo e limpamos os caches.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silencioso — SW é progressivo */
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
