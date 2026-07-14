import { and, eq, desc, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { db, dailyLogs, pointsLedger, users } from "@/db";
import { buildPerfil } from "@/lib/ai/profile";
import { evaluateDay, type Avaliacao } from "@/lib/ai/diario";
import { computePoints, type PointsBreakdown } from "@/lib/points";
import { getProfileWithName, getTodayPlan, createTodayPlan } from "@/lib/plans";
import { todayISO, prevISO } from "@/lib/date";

export type DailyLog = InferSelectModel<typeof dailyLogs>;

export async function getTodayLog(userId: string): Promise<DailyLog | null> {
  const [log] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, todayISO())))
    .limit(1);
  return log ?? null;
}

/** Conta dias consecutivos com registro terminando hoje. */
async function computeStreak(userId: string): Promise<number> {
  const rows = await db
    .select({ date: dailyLogs.date })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.date));
  const dates = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = todayISO();
  while (dates.has(cursor)) {
    streak++;
    cursor = prevISO(cursor);
  }
  return streak;
}

export type RegisterResult = {
  avaliacao: Avaliacao;
  pontos: number;
  breakdown: PointsBreakdown[];
  streak: number;
  source: "ai" | "mock";
};

/**
 * Avalia o relato do dia, grava o log, calcula os pontos no backend e
 * atualiza streak + points_ledger. Idempotente por dia (re-avaliar substitui).
 */
export async function registerDay(userId: string, relato: string): Promise<RegisterResult> {
  const row = await getProfileWithName(userId);
  if (!row) throw new Error("Perfil não encontrado.");

  // Precisamos de um plano do dia como contexto da avaliação.
  const plan = (await getTodayPlan(userId)) ?? (await createTodayPlan(userId));

  const perfil = buildPerfil(row.profile, row.name ?? "você");
  const planoDoDia = {
    meta_kcal: plan.metaKcal,
    meta_proteina_g: plan.metaProteinG,
    refeicoes: plan.refeicoes,
  };

  const avaliacao = await evaluateDay(perfil, planoDoDia, relato);
  const date = todayISO();

  // Grava/atualiza o log primeiro, para o streak considerar hoje.
  const baseLog = {
    userId,
    date,
    relato,
    status: avaliacao.status,
    feedback: avaliacao.feedback,
    estKcal: Math.round(avaliacao.estimativa.kcal),
    estProtein: Math.round(avaliacao.estimativa.proteina_g),
    treino: avaliacao.treino_detectado,
    ajusteMed: avaliacao.ajuste_medicacao_aplicado,
    alertaSaude: avaliacao.alerta_saude,
    pontos: 0,
  };
  await db
    .insert(dailyLogs)
    .values(baseLog)
    .onConflictDoUpdate({ target: [dailyLogs.userId, dailyLogs.date], set: baseLog });

  const streak = await computeStreak(userId);

  // Limpa lançamentos anteriores do diário deste dia (re-avaliação).
  await db
    .delete(pointsLedger)
    .where(
      and(
        eq(pointsLedger.userId, userId),
        eq(pointsLedger.date, date),
        sql`${pointsLedger.reason} like 'diario:%'`,
      ),
    );

  let pontos = 0;
  let breakdown: PointsBreakdown[] = [];

  if (!avaliacao.alerta_saude) {
    const result = computePoints({
      qualidade: avaliacao.qualidade,
      treino: avaliacao.treino_detectado,
      alertaSaude: false,
      streak,
    });
    pontos = result.total;
    breakdown = result.breakdown;

    if (breakdown.length > 0) {
      await db.insert(pointsLedger).values(
        breakdown.map((b) => ({
          userId,
          date,
          points: b.points,
          reason: `diario:${b.reason}`,
        })),
      );
    }
  }

  // Atualiza pontos no log e streak no usuário.
  await db.update(dailyLogs).set({ pontos }).where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)));
  await db.update(users).set({ streakCount: streak }).where(eq(users.id, userId));

  return { avaliacao, pontos, breakdown, streak, source: avaliacao.source };
}
