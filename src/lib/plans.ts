import { and, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { db, profiles, users, dailyPlans } from "@/db";
import { buildPerfil } from "@/lib/ai/profile";
import { generatePlan } from "@/lib/ai/plano";
import { todayISO } from "@/lib/date";

export type DailyPlan = InferSelectModel<typeof dailyPlans>;

export async function getProfileWithName(userId: string) {
  const [row] = await db
    .select({
      profile: profiles,
      name: users.name,
      streak: users.streakCount,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(eq(profiles.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function getTodayPlan(userId: string): Promise<DailyPlan | null> {
  const [plan] = await db
    .select()
    .from(dailyPlans)
    .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, todayISO())))
    .limit(1);
  return plan ?? null;
}

/** Gera (via IA ou mock) e salva o plano de hoje, substituindo se já existir. */
export async function createTodayPlan(userId: string): Promise<DailyPlan> {
  const row = await getProfileWithName(userId);
  if (!row) throw new Error("Perfil não encontrado.");

  const perfil = buildPerfil(row.profile, row.name ?? "você");
  const plan = await generatePlan(perfil);

  const values = {
    userId,
    date: todayISO(),
    metaKcal: plan.meta_kcal,
    metaProteinG: plan.meta_proteina_g,
    observacao: plan.observacao_ajuste,
    refeicoes: plan.refeicoes,
    dica: plan.dica_do_dia,
  };

  const [saved] = await db
    .insert(dailyPlans)
    .values(values)
    .onConflictDoUpdate({
      target: [dailyPlans.userId, dailyPlans.date],
      set: { ...values, createdAt: new Date() },
    })
    .returning();

  return saved;
}
