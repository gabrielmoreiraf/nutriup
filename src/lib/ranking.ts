import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db, pointsLedger, users, friendships } from "@/db";
import { weekStartISO } from "@/lib/date";

export type RankRow = {
  userId: string;
  name: string;
  streak: number;
  points: number;
  position: number;
  isMe: boolean;
};

export type RankScope = "amigos" | "global";

async function friendIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ friendId: friendships.friendId })
    .from(friendships)
    .where(and(eq(friendships.userId, userId), eq(friendships.status, "accepted")));
  return rows.map((r) => r.friendId);
}

/** Ranking semanal (soma de points_ledger desde segunda-feira). */
export async function getWeeklyRanking(userId: string, scope: RankScope): Promise<RankRow[]> {
  const weekStart = weekStartISO();

  const filters = [gte(pointsLedger.date, weekStart)];
  if (scope === "amigos") {
    const ids = [userId, ...(await friendIds(userId))];
    filters.push(inArray(pointsLedger.userId, ids));
  }

  const rows = await db
    .select({
      userId: pointsLedger.userId,
      name: users.name,
      streak: users.streakCount,
      points: sql<number>`sum(${pointsLedger.points})`.mapWith(Number),
    })
    .from(pointsLedger)
    .innerJoin(users, eq(users.id, pointsLedger.userId))
    .where(and(...filters))
    .groupBy(pointsLedger.userId, users.name, users.streakCount)
    .orderBy(desc(sql`sum(${pointsLedger.points})`));

  return rows.map((r, i) => ({
    userId: r.userId,
    name: r.name ?? "Anônimo",
    streak: r.streak,
    points: r.points,
    position: i + 1,
    isMe: r.userId === userId,
  }));
}

/** Posição do usuário e pontos que faltam para subir uma posição (para a Home). */
export async function getMyRankSummary(userId: string) {
  const rows = await getWeeklyRanking(userId, "amigos");
  const meIndex = rows.findIndex((r) => r.isMe);
  if (meIndex === -1) return { position: rows.length + 1, toNext: 0, total: rows.length + 1 };
  const me = rows[meIndex];
  const above = rows[meIndex - 1];
  return {
    position: me.position,
    toNext: above ? above.points - me.points : 0,
    total: rows.length,
  };
}
