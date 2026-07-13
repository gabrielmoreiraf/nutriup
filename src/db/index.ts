import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Cliente Drizzle — local-first, pronto para Neon.
 *
 * - Se DATABASE_URL estiver definida → Neon (Postgres serverless), o alvo de produção.
 * - Senão → PGlite (Postgres embutido em arquivo), zero-config para dev local.
 *
 * O schema é 100% Postgres nos dois casos: migrar para o Neon depois é só
 * definir DATABASE_URL e rodar `npm run db:migrate`.
 *
 * Usado apenas no servidor (rotas de API, Server Components/Actions).
 */
// Neon e PGlite compartilham a mesma API de query do Postgres (pg-core),
// então tipamos como NeonHttpDatabase para preservar a tipagem do Drizzle.
type DrizzleDb = NeonHttpDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __nutriupDb?: DrizzleDb;
  __nutriupPglite?: unknown;
};

export const usingNeon = !!process.env.DATABASE_URL;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

function buildDb() {
  // Durante `next build` sem Neon, usamos o driver Neon com uma URL fictícia:
  // isso dá ao Auth.js/Drizzle um instance de dialeto pg válido para inspeção,
  // sem carregar o WASM do PGlite nem abrir conexão (nenhuma query roda no build).
  if (usingNeon || isBuildPhase) {
    // Alvo de produção: Neon.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/neon-http");
    const url = process.env.DATABASE_URL ?? "postgresql://build:build@localhost/build";
    return drizzle(neon(url), { schema }) as DrizzleDb;
  }
  // Dev local: PGlite (persistido em ./.pglite).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require("@electric-sql/pglite");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/pglite");
  const client = new PGlite(process.env.PGLITE_PATH ?? "./.pglite");
  globalForDb.__nutriupPglite = client;
  return drizzle(client, { schema }) as unknown as DrizzleDb;
}

export const db: DrizzleDb = globalForDb.__nutriupDb ?? buildDb();
if (process.env.NODE_ENV !== "production" && !isBuildPhase) globalForDb.__nutriupDb = db;

/** Instância PGlite crua (só existe em dev local) — usada para migração no boot. */
export function getPgliteClient(): unknown | undefined {
  return globalForDb.__nutriupPglite;
}

export * from "./schema";
