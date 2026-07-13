import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  db,
  users,
  profiles,
  friendships,
  pointsLedger,
  posts,
} from "@/db";
import { todayISO, isoDaysAgo } from "@/lib/date";

export const runtime = "nodejs";

/**
 * Seed de DESENVOLVIMENTO — só roda fora de produção e com o flag explícito ligado.
 * Cria o usuário de teste, amigos, pontos da semana e posts do mural.
 * Login: leo@teste.com / senha123
 */
export async function GET() {
  const allowed = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_SEED === "1";
  if (!allowed) {
    return NextResponse.json({ error: "Seed indisponível." }, { status: 403 });
  }

  const hash = await bcrypt.hash("senha123", 10);

  const people = [
    { id: "seed-leo", name: "Léo", email: "leo@teste.com", goal: "ganho_massa", freq: "3-4x", streak: 7, week: 55 },
    { id: "seed-marina", name: "Marina S.", email: "marina@teste.com", goal: "manter", freq: "5x+", streak: 12, week: 1240 },
    { id: "seed-rafa", name: "Rafa T.", email: "rafa@teste.com", goal: "ganho_massa", freq: "3-4x", streak: 9, week: 1095 },
    { id: "seed-bia", name: "Bia M.", email: "bia@teste.com", goal: "perder_peso", freq: "1-2x", streak: 5, week: 980 },
    { id: "seed-diego", name: "Diego P.", email: "diego@teste.com", goal: "ganho_massa", freq: "5x+", streak: 4, week: 910 },
    { id: "seed-cau", name: "Cau S.", email: "cau@teste.com", goal: "manter", freq: "3-4x", streak: 6, week: 845 },
  ] as const;

  for (const p of people) {
    await db
      .insert(users)
      .values({
        id: p.id,
        name: p.name,
        email: p.email,
        passwordHash: hash,
        streakCount: p.streak,
        emailVerified: new Date(),
      })
      .onConflictDoNothing({ target: users.id });

    await db
      .insert(profiles)
      .values({
        userId: p.id,
        sex: "M",
        age: 27,
        weightKg: 78,
        heightCm: 176,
        goal: p.goal,
        trainingFreq: p.freq,
        trainingType: "Musculação",
        trainingIntensity: p.freq === "5x+" ? "alta" : "moderada",
        medUses: false,
      })
      .onConflictDoNothing({ target: profiles.userId });

    // pontos da semana (uma entrada base + hoje), para o ranking
    await db
      .insert(pointsLedger)
      .values([
        { userId: p.id, date: isoDaysAgo(2), points: Math.round(p.week * 0.6), reason: "seed_semana" },
        { userId: p.id, date: todayISO(), points: Math.round(p.week * 0.4), reason: "seed_hoje" },
      ])
      .onConflictDoNothing();
  }

  // amizades: leo <-> todos os outros (aceitas)
  for (const p of people.filter((x) => x.id !== "seed-leo")) {
    await db
      .insert(friendships)
      .values([
        { userId: "seed-leo", friendId: p.id, status: "accepted" },
        { userId: p.id, friendId: "seed-leo", status: "accepted" },
      ])
      .onConflictDoNothing();
  }

  // posts do mural
  const [existingPost] = await db.select({ id: posts.id }).from(posts).limit(1);
  if (!existingPost) {
    await db.insert(posts).values([
      {
        userId: "seed-marina",
        caption: "Bowl de frango, arroz integral e brócolis. Bateu a meta de proteína! 💪",
        aiAligned: true,
      },
      {
        userId: "seed-diego",
        caption: "Treino de perna concluído. Perna tremendo mas valeu 🔥",
        aiAligned: false,
      },
      {
        userId: "seed-bia",
        caption: "Café da manhã: ovos mexidos + aveia + banana.",
        aiAligned: true,
      },
    ]);
  }

  const [leo] = await db.select().from(users).where(eq(users.id, "seed-leo")).limit(1);
  return NextResponse.json({
    ok: true,
    login: { email: "leo@teste.com", senha: "senha123" },
    seeded: people.length,
    leoExists: !!leo,
  });
}
