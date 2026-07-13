import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { requirePremium } from "@/lib/premium";
import { createTodayPlan } from "@/lib/plans";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Gera e salva o plano do dia. Requer login e assinatura ativa (gating na Fase 6). */
export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Geração de plano é cara — no máx. 20 por hora por usuário.
  const rl = rateLimit(`plano:${userId}`, 20, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const gate = await requirePremium(userId);
  if (!gate.ok) {
    return NextResponse.json({ error: "premium_required" }, { status: 402 });
  }

  try {
    const plan = await createTodayPlan(userId);
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[api/plano] erro:", err);
    return NextResponse.json({ error: "Falha ao gerar o plano." }, { status: 500 });
  }
}
