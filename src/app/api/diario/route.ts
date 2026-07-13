import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { requirePremium } from "@/lib/premium";
import { registerDay } from "@/lib/logs";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Avalia o relato do dia e devolve avaliação + pontos (calculados no backend). */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Avaliação chama a IA — no máx. 30 por hora por usuário.
  const rl = rateLimit(`diario:${userId}`, 30, 60 * 60 * 1000);
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

  let relato = "";
  try {
    const body = await req.json();
    relato = String(body?.relato ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  if (relato.length < 3) {
    return NextResponse.json({ error: "Conte um pouco do seu dia primeiro." }, { status: 400 });
  }

  try {
    const result = await registerDay(userId, relato);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/diario] erro:", err);
    return NextResponse.json({ error: "Falha ao avaliar o dia." }, { status: 500 });
  }
}
