"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles } from "lucide-react";

export default function GerarPlanoButton({
  label,
  variant = "ghost",
  icon = "refresh",
}: {
  label: string;
  variant?: "primary" | "ghost";
  icon?: "refresh" | "sparkles";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const gerar = () =>
    start(async () => {
      setError(null);
      const res = await fetch("/api/plano", { method: "POST" });
      if (res.status === 402) {
        router.push("/assinar");
        return;
      }
      if (!res.ok) {
        setError("Não consegui gerar agora. Tente de novo.");
        return;
      }
      router.refresh();
    });

  return (
    <>
      <button className={`btn btn-${variant}`} onClick={gerar} disabled={pending} style={{ marginTop: 16 }}>
        {icon === "sparkles" ? <Sparkles size={18} /> : <RefreshCw size={18} />}
        {pending ? "Gerando..." : label}
      </button>
      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 10, textAlign: "center" }}>
          {error}
        </p>
      )}
    </>
  );
}
