import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

/**
 * Admin master único do NutriUp. Só quem loga com este e-mail (protegido pela
 * verificação de e-mail no cadastro/login) enxerga o painel /admin.
 */
const MASTER_ADMIN_EMAIL = "gabrielfmoreira4@gmail.com";

export function isMasterAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === MASTER_ADMIN_EMAIL;
}

/** Exige o admin master; qualquer outro usuário logado volta pro app normal. */
export async function requireAdmin() {
  const user = await requireUser();
  if (!isMasterAdminEmail(user.email)) redirect("/inicio");
  return user;
}
