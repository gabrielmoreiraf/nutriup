"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import { calcularIMC, classificarIMC, textoIMC, IMC_COLORS } from "@/lib/imc";

/**
 * Mostra o IMC em tempo real assim que peso e altura forem válidos.
 * Nunca bloqueia o cadastro — é só informativo, uma entrada a mais no perfil.
 */
export default function ImcCard({ weight, height }: { weight: string; height: string }) {
  const w = Number(weight.replace(",", "."));
  const h = Number(height);
  if (!w || !h || w < 30 || w > 400 || h < 100 || h > 250) return null;

  const imc = calcularIMC(w, h);
  const { faixa, label, gravidade } = classificarIMC(imc);
  const colors = IMC_COLORS[gravidade];
  const texto = textoIMC(imc, faixa);

  return (
    <div
      className="install"
      style={{ borderStyle: "solid", borderColor: "var(--line)", background: colors.bg }}
    >
      <div className="ic" style={{ background: colors.icon }}>
        {gravidade === "ok" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
      </div>
      <div>
        <b style={{ color: colors.text }}>
          IMC {imc.toLocaleString("pt-BR")} · {label}
        </b>
        <span style={{ color: colors.text }}>{texto}</span>
      </div>
    </div>
  );
}
