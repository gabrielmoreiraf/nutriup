"use server";

import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { requireUser } from "@/lib/session";
import { signOut } from "@/auth";

/**
 * Exclusão de conta (LGPD). Remove o usuário; todas as tabelas dependentes
 * (perfil, planos, logs, pontos, posts, curtidas, comentários, amizades,
 * assinaturas, contas/sessões) caem em cascata por ON DELETE CASCADE.
 */
export async function deleteAccount() {
  const user = await requireUser();
  await db.delete(users).where(eq(users.id, user.id));
  await signOut({ redirectTo: "/" });
}
