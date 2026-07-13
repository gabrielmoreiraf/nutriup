import { requireOnboardedUser } from "@/lib/session";
import { getTodayLog } from "@/lib/logs";
import { STATUS_LABEL } from "@/lib/labels";
import DiarioForm, { type DiarioResult } from "@/components/diario/DiarioForm";

export const dynamic = "force-dynamic";

export default async function DiarioPage() {
  const user = await requireOnboardedUser();
  const log = await getTodayLog(user.id);

  const initial: DiarioResult | null = log
    ? {
        status: (log.status ?? "atencao") as DiarioResult["status"],
        titulo: log.alertaSaude ? "Estamos com você" : STATUS_LABEL[log.status ?? "atencao"],
        feedback: log.feedback ?? "",
        kcal: log.estKcal ?? 0,
        proteina: log.estProtein ?? 0,
        treino: log.treino,
        ajusteMed: log.ajusteMed,
        alertaSaude: log.alertaSaude,
        pontos: log.pontos,
      }
    : null;

  return (
    <div className="pad" style={{ paddingTop: 12 }}>
      <h2 className="h-title">Diário do dia</h2>
      <p className="sub">Escreva como quiser. A IA entende linguagem natural.</p>
      <DiarioForm initial={initial} />
      <p className="disclaimer">
        Avaliação automática de bem-estar. Não substitui a orientação de um nutricionista ou médico.
      </p>
    </div>
  );
}
