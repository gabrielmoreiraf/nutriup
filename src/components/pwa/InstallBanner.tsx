"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BIPEvent = any;

function detectIOS() {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function detectStandalone() {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (navigator as any).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallBanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS] = useState(detectIOS);
  const [installed, setInstalled] = useState(detectStandalone);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    // setState aqui vive dentro dos handlers de evento (permitido).
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const onClick = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else if (isIOS) {
      setShowIOSHelp((v) => !v);
    }
  };

  return (
    <>
      <button
        type="button"
        className="install"
        onClick={onClick}
        style={{ width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
      >
        <div className="ic">
          <Download size={20} />
        </div>
        <div>
          <b>Adicionar à tela inicial</b>
          <span>Instale como app no iPhone ou Android — sem baixar da loja.</span>
        </div>
      </button>

      {showIOSHelp && isIOS && (
        <div
          className="install"
          style={{ borderStyle: "solid", borderColor: "var(--line)", background: "var(--mint)" }}
        >
          <div className="ic" style={{ background: "var(--green)" }}>
            <Share size={20} />
          </div>
          <div>
            <b>No iPhone</b>
            <span>Toque em Compartilhar e depois em &quot;Adicionar à Tela de Início&quot;.</span>
          </div>
        </div>
      )}
    </>
  );
}
