"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, profiles } from "@/db";
import { requireUser } from "@/lib/session";
import { confirmVerificationCode, issueVerificationCode } from "@/lib/email-verification";

export type VerifyState = { error?: string } | null;

export async function verifyEmailCode(_prev: VerifyState, formData: FormData): Promise<VerifyState> {
  const user = await requireUser();
  if (!user.email) return { error: "E-mail não encontrado na sessão." };

  const code = String(formData.get("code") ?? "").trim();
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { error: "Digite os 6 números do código." };
  }

  const ok = await confirmVerificationCode(user.email, code);
  if (!ok) return { error: "Código inválido ou expirado. Peça um novo abaixo." };

  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  redirect(profile ? "/inicio" : "/onboarding");
}

export async function resendVerificationCode(): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!user.email) return { ok: false, error: "E-mail não encontrado na sessão." };
  return issueVerificationCode(user.email, user.name ?? "você");
}
