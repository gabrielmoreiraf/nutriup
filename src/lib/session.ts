import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db, profiles, users } from "@/db";

/**
 * Retorna o usuário da sessão ou redireciona para /entrar. Também derruba na
 * hora sessões já ativas de contas bloqueadas pelo admin (o token JWT em si
 * continua válido até expirar, então o corte precisa acontecer aqui). O
 * signOut de verdade (limpar cookie) só pode rodar numa Server Action, não
 * aqui dentro de um Server Component — por isso manda pra /bloqueado, que
 * dispara o signOut a partir do client.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/entrar");

  const [row] = await db
    .select({ isBlocked: users.isBlocked })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (row?.isBlocked) {
    redirect("/bloqueado");
  }

  return session.user;
}

/**
 * Exige e-mail verificado. Consulta o banco (não o JWT) porque o token não
 * é atualizado no momento da verificação — assim o gate reage na hora.
 */
export async function requireVerifiedUser() {
  const user = await requireUser();
  const [row] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row?.emailVerified) redirect("/verificar-email");
  return user;
}

/** Usuário logado, com e-mail verificado, precisa ter completado o onboarding (perfil salvo). */
export async function requireOnboardedUser() {
  const user = await requireVerifiedUser();
  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (!profile) redirect("/onboarding");
  return user;
}

/** Só o id, sem redirecionar (null se deslogado). */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
