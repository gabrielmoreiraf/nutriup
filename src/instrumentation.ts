/**
 * Roda uma vez no boot do servidor.
 * Em dev local (sem DATABASE_URL) aplica as migrações no PGlite automaticamente,
 * então o app sobe com o banco pronto — sem nenhum passo manual.
 * Em produção (Neon) as migrações rodam via `npm run db:migrate` no deploy.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.DATABASE_URL) return;

  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder: "./drizzle" });
    console.log("[db] PGlite pronto — migrações aplicadas (dev local).");
  } catch (err) {
    console.error("[db] Falha ao migrar PGlite:", err);
  }
}
