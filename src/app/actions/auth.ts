"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { signIn, signOut } from "@/auth";
import { isPasswordValid } from "@/lib/password";
import { issueVerificationCode } from "@/lib/email-verification";

export type AuthState = { error?: string } | null;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Diga como quer ser chamado."),
  email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido.")),
  password: z
    .string()
    .refine(isPasswordValid, "A senha não atende aos requisitos de segurança."),
});

export async function registerUser(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (formData.get("terms") !== "on") {
    return { error: "Você precisa aceitar os termos." };
  }
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail. Faça login." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, passwordHash });
  await issueVerificationCode(email, name);

  // signIn lança um redirect — deixe propagar. Onboarding só depois de verificar o e-mail.
  await signIn("credentials", { email, password, redirectTo: "/verificar-email" });
  return null;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido.")),
  password: z.string().min(1, "Informe sua senha."),
});

export async function loginUser(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const [existing] = await db
    .select({ isBlocked: users.isBlocked })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing?.isBlocked) {
    return { error: "Esta conta foi bloqueada. Fale com o suporte." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/inicio",
    });
    return null;
  } catch (err) {
    // Erros de credencial não devem vazar como exceção; redirects sim.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    if (isRedirectError(err)) throw err;
    return { error: "E-mail ou senha incorretos." };
  }
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/inicio" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

/** Chamado pela tela /bloqueado pra limpar a sessão de uma conta bloqueada. */
export async function logoutBlocked() {
  await signOut({ redirectTo: "/entrar?bloqueado=1" });
}

// next/navigation lança um erro especial para redirects; precisamos deixá-lo passar.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRedirectError(err: any): boolean {
  return typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT");
}
