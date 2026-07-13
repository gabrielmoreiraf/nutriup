import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  date,
  jsonb,
  primaryKey,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ============================================================
   NutriUp — Modelo de dados (brief §5)
   IMPORTANT: dados de saúde (medicação) são sensíveis e nunca
   podem aparecer em ranking, mural ou logs de aplicação.
   ============================================================ */

export const goalEnum = pgEnum("goal", ["perder_peso", "manter", "ganho_massa"]);
export const sexEnum = pgEnum("sex", ["M", "F", "Outro"]);
export const logStatusEnum = pgEnum("log_status", ["no_caminho", "atencao", "fora_da_meta"]);
export const planTypeEnum = pgEnum("plan_type", ["mensal", "anual"]);

/* -------------------------------------------------- users */
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").unique(),
  // Auth.js (adicionado na Fase 1); email/senha usa passwordHash
  emailVerified: timestamp("email_verified", { mode: "date" }),
  passwordHash: text("password_hash"),
  image: text("image"),
  isPremium: boolean("is_premium").notNull().default(false),
  planType: planTypeEnum("plan_type"),
  asaasCustomerId: text("asaas_customer_id"),
  // CPF/CNPJ — exigido pela Asaas para criar o cliente/cobrança lá.
  cpfCnpj: text("cpf_cnpj"),
  // streak mantido aqui e recalculado a cada registro (brief §5)
  streakCount: integer("streak_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

/* -------------------------------------------------- Auth.js (NextAuth v5) */
// Tabelas do @auth/drizzle-adapter — usadas para login com Google (account linking).
// O login por e-mail/senha usa users.passwordHash e sessão JWT.
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* -------------------------------------------------- profiles */
type Restrictions = string[];
type Prefs = { gosta?: string[]; evita?: string[] };

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  sex: sexEnum("sex"),
  age: integer("age"),
  weightKg: real("weight_kg"),
  heightCm: integer("height_cm"),
  goal: goalEnum("goal"),
  trainingFreq: text("training_freq"), // "nao_treino" | "1-2x" | "3-4x" | "5x+"
  trainingType: text("training_type"),
  trainingIntensity: text("training_intensity"),
  // saúde sensível — nunca exposta publicamente
  medUses: boolean("med_uses").notNull().default(false),
  medName: text("med_name"),
  medDose: text("med_dose"),
  otherConditions: jsonb("other_conditions").$type<string[]>(),
  restrictions: jsonb("restrictions").$type<Restrictions>(),
  prefs: jsonb("prefs").$type<Prefs>(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

/* -------------------------------------------------- daily_plans */
export type Refeicao = {
  nome: string;
  horario: string; // "HH:MM"
  kcal: number;
  itens: string[];
};

export const dailyPlans = pgTable("daily_plans", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  metaKcal: integer("meta_kcal").notNull(),
  metaProteinG: integer("meta_protein_g").notNull(),
  observacao: text("observacao"),
  refeicoes: jsonb("refeicoes").$type<Refeicao[]>().notNull(),
  dica: text("dica"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => [unique("daily_plans_user_date").on(t.userId, t.date)]);

/* -------------------------------------------------- daily_logs */
export const dailyLogs = pgTable("daily_logs", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  relato: text("relato").notNull(),
  status: logStatusEnum("status"),
  feedback: text("feedback"),
  estKcal: integer("est_kcal"),
  estProtein: integer("est_protein"),
  treino: boolean("treino").notNull().default(false),
  ajusteMed: boolean("ajuste_med").notNull().default(false),
  alertaSaude: boolean("alerta_saude").notNull().default(false),
  pontos: integer("pontos").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => [unique("daily_logs_user_date").on(t.userId, t.date)]);

/* -------------------------------------------------- points_ledger (auditável) */
export const pointsLedger = pgTable("points_ledger", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

/* -------------------------------------------------- friendships */
export const friendships = pgTable(
  "friendships",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    friendId: text("friend_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // pending | accepted | blocked
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.friendId] })],
);

/* -------------------------------------------------- posts */
export const posts = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  caption: text("caption"),
  aiAligned: boolean("ai_aligned").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

/* -------------------------------------------------- likes */
export const likes = pgTable(
  "likes",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

/* -------------------------------------------------- comments */
export const comments = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

/* -------------------------------------------------- subscriptions */
export const subscriptions = pgTable("subscriptions", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  asaasSubscriptionId: text("asaas_subscription_id"),
  status: text("status"), // pending | active | overdue | canceled
  plan: planTypeEnum("plan"),
  paymentMethod: text("payment_method"), // PIX | CREDIT_CARD
  lastInvoiceUrl: text("last_invoice_url"),
  lastPaymentAt: timestamp("last_payment_at", { mode: "date" }),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
});
