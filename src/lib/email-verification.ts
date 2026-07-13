import { eq, and } from "drizzle-orm";
import { db, users, verificationTokens } from "@/db";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const CODE_TTL_MS = 10 * 60 * 1000;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Gera um código novo, substitui qualquer código anterior e envia por e-mail. */
export async function issueVerificationCode(
  email: string,
  name: string,
): Promise<{ ok: boolean; error?: string }> {
  const rl = rateLimit(`verify-email:${email}`, 3, 10 * 60 * 1000);
  if (!rl.ok) {
    return { ok: false, error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };
  }

  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));
  const code = generateCode();
  await db.insert(verificationTokens).values({
    identifier: email,
    token: code,
    expires: new Date(Date.now() + CODE_TTL_MS),
  });

  try {
    await sendVerificationEmail(email, name, code);
  } catch (err) {
    console.error("[email] falha ao enviar código:", err);
    return { ok: false, error: "Não conseguimos enviar o e-mail agora. Tente de novo." };
  }
  return { ok: true };
}

/** Confirma o código, consome o token e marca o e-mail como verificado. */
export async function confirmVerificationCode(email: string, code: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, code.trim())))
    .limit(1);

  if (!row || row.expires < new Date()) return false;

  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));
  await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, email));
  return true;
}
