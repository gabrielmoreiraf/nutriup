import { eq } from "drizzle-orm";
import { db, users } from "@/db";

/** Cobrança só liga quando o Asaas estiver configurado. */
export function billingEnabled(): boolean {
  return !!process.env.ASAAS_API_KEY;
}

/**
 * Em dev (sem Asaas) todo usuário é tratado como premium, então o fluxo
 * completo é testável localmente. Com Asaas ligado, checa users.is_premium
 * (atualizado pelo webhook — Fase 6, ou concedido manualmente pelo admin
 * master via /admin). Se o admin concedeu acesso por X dias
 * (admin_access_until), expira sozinho aqui assim que a data passa.
 */
export async function isPremium(userId: string): Promise<boolean> {
  if (!billingEnabled()) return true;
  const [u] = await db
    .select({ isPremium: users.isPremium, adminAccessUntil: users.adminAccessUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!u) return false;

  if (u.adminAccessUntil && u.adminAccessUntil.getTime() <= Date.now()) {
    await db
      .update(users)
      .set({ isPremium: false, adminAccessUntil: null })
      .where(eq(users.id, userId));
    return false;
  }

  return u.isPremium;
}

export async function requirePremium(userId: string): Promise<{ ok: boolean }> {
  return { ok: await isPremium(userId) };
}
