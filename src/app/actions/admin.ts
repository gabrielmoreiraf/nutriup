"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, users } from "@/db";
import { requireAdmin } from "@/lib/admin";

const MAX_DIAS = 3650;

export type AdminActionState = { error?: string } | null;

export async function setBlocked(userId: string, blocked: boolean): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (userId === admin.id && blocked) {
    return { error: "Você não pode bloquear a própria conta." };
  }
  await db.update(users).set({ isBlocked: blocked }).where(eq(users.id, userId));
  revalidatePath("/admin");
  return null;
}

export async function grantDays(userId: string, days: number): Promise<AdminActionState> {
  await requireAdmin();
  if (!Number.isFinite(days) || days < 1 || days > MAX_DIAS) {
    return { error: `Informe de 1 a ${MAX_DIAS} dias.` };
  }
  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await db
    .update(users)
    .set({ isPremium: true, adminAccessUntil: until })
    .where(eq(users.id, userId));
  revalidatePath("/admin");
  return null;
}

export async function grantLifetime(userId: string): Promise<AdminActionState> {
  await requireAdmin();
  await db
    .update(users)
    .set({ isPremium: true, adminAccessUntil: null })
    .where(eq(users.id, userId));
  revalidatePath("/admin");
  return null;
}

export async function revokeAccess(userId: string): Promise<AdminActionState> {
  await requireAdmin();
  await db
    .update(users)
    .set({ isPremium: false, adminAccessUntil: null })
    .where(eq(users.id, userId));
  revalidatePath("/admin");
  return null;
}
