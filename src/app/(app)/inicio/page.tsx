import Link from "next/link";
import { Flame, Utensils, Sparkles, Trophy, ChevronRight } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { getProfileWithName, getTodayPlan } from "@/lib/plans";
import { getTodayLog } from "@/lib/logs";
import { getMyRankSummary } from "@/lib/ranking";
import { GOAL_LABEL } from "@/lib/labels";
import type { Refeicao } from "@/db/schema";
import Ring from "@/components/Ring";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const user = await requireOnboardedUser();
  const [row, plan, log, rank] = await Promise.all([
    getProfileWithName(user.id),
    getTodayPlan(user.id),
    getTodayLog(user.id),
    getMyRankSummary(user.id),
  ]);

  const name = row?.name ?? "você";
  const streakCount = row?.streak ?? 0;
  const goalLabel = GOAL_LABEL[row?.profile.goal ?? "manter"] ?? "Sua meta";

  const metaKcal = plan?.metaKcal ?? 0;
  const metaProt = plan?.metaProteinG ?? 0;
  const consumedKcal = log?.estKcal ?? 0;
  const consumedProt = log?.estProtein ?? 0;
  const pct = metaKcal > 0 ? Math.round((consumedKcal / metaKcal) * 100) : 0;
  const faltamKcal = Math.max(0, metaKcal - consumedKcal);
  const faltamProt = Math.max(0, metaProt - consumedProt);
  const mealsCount = plan ? (plan.refeicoes as Refeicao[]).length : 0;

  return (
    <>
      <div className="app-top">
        <div className="hi">
          Bom dia,<b>{name} 👋</b>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="streak">
            <Flame size={15} fill="currentColor" /> {streakCount} {streakCount === 1 ? "dia" : "dias"}
          </div>
          <Link href="/conta" className="ava" style={{ width: 40, height: 40, fontSize: 15, textDecoration: "none" }}>
            {name[0]?.toUpperCase()}
          </Link>
        </div>
      </div>
      <div className="pad" style={{ paddingTop: 4 }}>
        <div className="card card-grad">
          <div className="metric">
            <Ring pct={pct} label={`${pct}%`} sub="da meta" light />
            <div>
              <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 600 }}>Meta de hoje</div>
              <div style={{ fontSize: 19, fontWeight: 800, margin: "2px 0 6px" }}>{goalLabel}</div>
              <div style={{ fontSize: 13, opacity: 0.92 }}>
                {plan
                  ? `Faltam ~${faltamKcal} kcal e ${faltamProt}g de proteína.`
                  : "Gere seu plano de hoje pra ver sua meta."}
              </div>
            </div>
          </div>
        </div>

        <div className="mini">
          <div>
            <b>{consumedKcal.toLocaleString("pt-BR")}</b>
            <span>kcal hoje</span>
          </div>
          <div>
            <b>{consumedProt}g</b>
            <span>proteína</span>
          </div>
          <div>
            <b>2,5L</b>
            <span>meta água</span>
          </div>
        </div>

        <Link
          href="/plano"
          className="card"
          style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}
        >
          <div className="ic" style={iconStyle("var(--mint)", "var(--green-d)")}>
            <Utensils size={22} />
          </div>
          <div>
            <b style={{ fontSize: 15 }}>Ver meu plano de hoje</b>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              {plan ? `${mealsCount} refeições · ${metaKcal.toLocaleString("pt-BR")} kcal` : "Gerar seu plano"}
            </div>
          </div>
          <ChevronRight size={20} style={{ marginLeft: "auto", color: "var(--muted)" }} />
        </Link>

        <Link
          href="/diario"
          className="card"
          style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}
        >
          <div className="ic" style={iconStyle("var(--grad)", "#fff")}>
            <Sparkles size={22} />
          </div>
          <div>
            <b style={{ fontSize: 15 }}>{log ? "Atualizar meu dia" : "Registrar meu dia"}</b>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              {log ? "Já avaliado hoje — ajuste se quiser" : "Escreva e deixe a IA avaliar"}
            </div>
          </div>
          <ChevronRight size={20} style={{ marginLeft: "auto", color: "var(--muted)" }} />
        </Link>

        <Link
          href="/ranking"
          className="card"
          style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}
        >
          <div className="rava" style={{ background: "#FFF3E6", color: "#E67514", width: 46, height: 46, borderRadius: 14 }}>
            <Trophy size={22} />
          </div>
          <div>
            <b style={{ fontSize: 15 }}>Você está em {rank.position}º</b>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              {rank.toNext > 0
                ? `${rank.toNext} pts pro ${rank.position - 1}º lugar da semana`
                : "Você lidera entre os amigos! 🔥"}
            </div>
          </div>
          <ChevronRight size={20} style={{ marginLeft: "auto", color: "var(--muted)" }} />
        </Link>
      </div>
    </>
  );
}

function iconStyle(bg: string, color: string) {
  return {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: bg,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "none" as const,
  };
}
