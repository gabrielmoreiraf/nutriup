"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, TrendingUp, Info, Zap, Heart, LifeBuoy } from "lucide-react";

export type DiarioResult = {
  status: "no_caminho" | "atencao" | "fora_da_meta";
  titulo: string;
  feedback: string;
  kcal: number;
  proteina: number;
  treino: boolean;
  ajusteMed: boolean;
  alertaSaude: boolean;
  pontos: number;
  sugestao?: string;
};

const STATUS_META = {
  no_caminho: { color: "#16B26B", sub: "alinhado à sua meta", Icon: Check },
  atencao: { color: "#E67514", sub: "quase lá", Icon: TrendingUp },
  fora_da_meta: { color: "#5E7A73", sub: "dia fora da meta", Icon: Info },
} as const;

export default function DiarioForm({ initial }: { initial?: DiarioResult | null }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [result, setResult] = useState<DiarioResult | null>(initial ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avaliar = async () => {
    if (text.trim().length < 3) {
      setError("Conte um pouco do seu dia primeiro.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/diario", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ relato: text }),
      });
      if (res.status === 402) {
        router.push("/assinar");
        return;
      }
      if (!res.ok) {
        setError("Não consegui avaliar agora. Tente de novo.");
        setPending(false);
        return;
      }
      const data = await res.json();
      setResult({
        status: data.avaliacao.status,
        titulo: data.avaliacao.titulo,
        feedback: data.avaliacao.feedback,
        kcal: Math.round(data.avaliacao.estimativa.kcal),
        proteina: Math.round(data.avaliacao.estimativa.proteina_g),
        treino: data.avaliacao.treino_detectado,
        ajusteMed: data.avaliacao.ajuste_medicacao_aplicado,
        alertaSaude: data.avaliacao.alerta_saude,
        pontos: data.pontos,
        sugestao: data.avaliacao.sugestao,
      });
      router.refresh(); // atualiza streak/ranking nas outras telas
    } catch {
      setError("Não consegui avaliar agora. Tente de novo.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <textarea
        className="ta"
        style={{ marginTop: 14 }}
        placeholder="Ex: comi uma lasanha fit no almoço e treinei perna pesado 💪"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={avaliar} disabled={pending}>
        <Sparkles size={18} /> {pending ? "Avaliando..." : "Avaliar com IA"}
      </button>

      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 12 }}>{error}</p>
      )}

      {result && result.alertaSaude && <AcolhimentoCard result={result} />}
      {result && !result.alertaSaude && <ResultCard result={result} />}
    </>
  );
}

function ResultCard({ result }: { result: DiarioResult }) {
  const meta = STATUS_META[result.status];
  const { Icon } = meta;
  return (
    <div className="ai-result">
      <div className="ai-head">
        <span className="ai-badge" style={{ background: meta.color }}>
          <Icon size={14} /> {result.titulo}
        </span>
        <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{meta.sub}</span>
      </div>
      <div className="ai-body">
        {result.feedback}
        {result.sugestao && (
          <div style={{ marginTop: 8, color: "var(--green-d)", fontWeight: 600 }}>💡 {result.sugestao}</div>
        )}
        <div className="tags">
          <span className="tag">≈ {result.kcal} kcal</span>
          <span className="tag">{result.proteina}g proteína</span>
          {result.treino && <span className="tag blue">treino ✓</span>}
          {result.ajusteMed && <span className="tag">ajuste medicação ✓</span>}
        </div>
        <div className="earn">
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <Zap size={18} fill="#fff" /> Pontos ganhos
          </span>
          <b>+{result.pontos} pts</b>
        </div>
      </div>
    </div>
  );
}

/** Fluxo de acolhimento (alerta_saude): sem metas numéricas, sem pontos, sem competição. */
function AcolhimentoCard({ result }: { result: DiarioResult }) {
  return (
    <div className="ai-result" style={{ marginTop: 16 }}>
      <div className="ai-head" style={{ background: "var(--sky)" }}>
        <span className="ai-badge" style={{ background: "var(--blue)" }}>
          <Heart size={14} /> {result.titulo || "Estamos com você"}
        </span>
      </div>
      <div className="ai-body">
        {result.feedback}
        {result.sugestao && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              background: "var(--mint)",
              borderRadius: 14,
              padding: "12px 14px",
            }}
          >
            <LifeBuoy size={18} style={{ color: "var(--green-d)", flex: "none", marginTop: 1 }} />
            <span style={{ fontWeight: 600 }}>{result.sugestao}</span>
          </div>
        )}
        <p className="disclaimer" style={{ textAlign: "left", marginTop: 14 }}>
          O NutriUp é orientativo e não substitui o acompanhamento de um profissional de saúde.
        </p>
      </div>
    </div>
  );
}
