import { Sparkles } from "lucide-react";

/** Placeholder de fase — some quando a tela real for implementada. */
export default function PhasePlaceholder({ phase }: { phase: string }) {
  return (
    <div className="card card-grad" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Sparkles size={26} />
      <div>
        <b style={{ fontSize: 15, fontWeight: 800 }}>Em breve</b>
        <div style={{ fontSize: 13, opacity: 0.9 }}>Esta tela chega na {phase}.</div>
      </div>
    </div>
  );
}
