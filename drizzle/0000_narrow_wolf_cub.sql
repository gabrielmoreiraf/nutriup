CREATE TYPE "public"."goal" AS ENUM('perder_peso', 'manter', 'ganho_massa');--> statement-breakpoint
CREATE TYPE "public"."log_status" AS ENUM('no_caminho', 'atencao', 'fora_da_meta');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('mensal', 'anual');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('M', 'F', 'Outro');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"relato" text NOT NULL,
	"status" "log_status",
	"feedback" text,
	"est_kcal" integer,
	"est_protein" integer,
	"treino" boolean DEFAULT false NOT NULL,
	"ajuste_med" boolean DEFAULT false NOT NULL,
	"alerta_saude" boolean DEFAULT false NOT NULL,
	"pontos" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_logs_user_date" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "daily_plans" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"meta_kcal" integer NOT NULL,
	"meta_protein_g" integer NOT NULL,
	"observacao" text,
	"refeicoes" jsonb NOT NULL,
	"dica" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_plans_user_date" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"user_id" text NOT NULL,
	"friend_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_user_id_friend_id_pk" PRIMARY KEY("user_id","friend_id")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "likes_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "points_ledger" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"points" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"image_url" text,
	"caption" text,
	"ai_aligned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"sex" "sex",
	"age" integer,
	"weight_kg" real,
	"height_cm" integer,
	"goal" "goal",
	"training_freq" text,
	"training_type" text,
	"training_intensity" text,
	"med_uses" boolean DEFAULT false NOT NULL,
	"med_name" text,
	"med_dose" text,
	"other_conditions" jsonb,
	"restrictions" jsonb,
	"prefs" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"user_id" text PRIMARY KEY NOT NULL,
	"asaas_subscription_id" text,
	"status" text,
	"plan" "plan_type",
	"payment_method" text,
	"last_invoice_url" text,
	"last_payment_at" timestamp,
	"current_period_end" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"password_hash" text,
	"image" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"plan_type" "plan_type",
	"asaas_customer_id" text,
	"cpf_cnpj" text,
	"streak_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;