import { Sparkles, Coffee, Apple, Utensils, ChefHat, Salad, Moon } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { getTodayPlan, getProfileWithName } from "@/lib/plans";
import { GOAL_LABEL } from "@/lib/labels";
import GerarPlanoButton from "@/components/plano/GerarPlanoButton";
import type { Refeicao } from "@/db/schema";

export const dynamic = "force-dynamic";

function mealIcon(nome: string) {
  const n = nome.toLowerCase();
  if (n.includes("café") || n.includes("cafe")) return <Coffee size={20} />;
  if (n.includes("manhã") || n.includes("manha")) return <Apple size={20} />;
  if (n.includes("almoço") || n.includes("almoco")) return <Utensils size={20} />;
  if (n.includes("tarde")) return <ChefHat size={20} />;
  if (n.includes("jantar")) return <Salad size={20} />;
  if (n.includes("ceia") || n.includes("noite")) return <Moon size={20} />;
  return <Utensils size={20} />;
}

export default async function PlanoPage() {
  const user = await requireOnboardedUser();
  const [plan, row] = await Promise.all([getTodayPlan(user.id), getProfileWithName(user.id)]);
  const goalLabel = GOAL_LABEL[row?.profile.goal ?? "manter"] ?? "Sua meta";

  return (
    <div className="pad" style={{ paddingTop: 12 }}>
      <h2 className="h-title">Seu plano de hoje</h2>
      <p className="sub">Gerado pela IA a partir do seu perfil e da sua meta.</p>

      {!plan ? (
        <>
          <div className="card" style={{ textAlign: "center", padding: "26px 18px" }}>
            <div
              className="ic"
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: "var(--grad)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Sparkles size={26} />
            </div>
            <b style={{ fontSize: 16, fontWeight: 800 }}>Você ainda não tem plano hoje</b>
            <p className="sub" style={{ marginTop: 6 }}>
              A IA monta um cardápio do dia sob medida pro seu perfil e sua meta.
            </p>
            <GerarPlanoButton label="Gerar meu plano de hoje" variant="primary" icon="sparkles" />
          </div>
          <p className="disclaimer">
            Sugestão automática de bem-estar. Não substitui a orientação de um nutricionista ou médico.
          </p>
        </>
      ) : (
        <>
          <div className="card card-grad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 600 }}>Meta do dia · {goalLabel}</div>
                <div style={{ fontSize: 27, fontWeight: 800, marginTop: 2 }}>
                  {plan.metaKcal.toLocaleString("pt-BR")} kcal
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 23, fontWeight: 800 }}>{plan.metaProteinG}g</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>proteína</div>
              </div>
            </div>
          </div>

          {plan.observacao && (
            <div
              className="install"
              style={{ borderStyle: "solid", borderColor: "var(--line)", background: "var(--mint)", marginTop: 14 }}
            >
              <div className="ic" style={{ background: "var(--green)" }}>
                <Sparkles size={20} />
              </div>
              <div>
                <b>Adaptado pra você</b>
                <span>{plan.observacao}</span>
              </div>
            </div>
          )}

          {(plan.refeicoes as Refeicao[]).map((meal, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "13px 15px",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div
                  className="ic"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "var(--mint)",
                    color: "var(--green-d)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  {mealIcon(meal.nome)}
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 14.5 }}>{meal.nome}</b>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {meal.horario} · ~{meal.kcal} kcal
                  </div>
                </div>
              </div>
              <div style={{ padding: "12px 15px", fontSize: 13.5, lineHeight: 1.75, color: "#2c4d46" }}>
                {meal.itens.map((it, j) => (
                  <div key={j}>• {it}</div>
                ))}
              </div>
            </div>
          ))}

          <GerarPlanoButton label="Gerar novo plano" variant="ghost" icon="refresh" />

          {plan.dica && (
            <div className="tag" style={{ display: "block", marginTop: 14, padding: "12px 14px", borderRadius: 14 }}>
              💡 {plan.dica}
            </div>
          )}

          <p className="disclaimer">
            Sugestão automática de bem-estar. Não substitui a orientação de um nutricionista ou médico.
          </p>
        </>
      )}
    </div>
  );
}
