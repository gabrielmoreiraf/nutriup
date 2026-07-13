import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

/**
 * Cifra de campo (AES-256-GCM) para dados sensíveis de saúde (medicação).
 * A chave vem de ENCRYPTION_KEY. Sem chave (dev), guarda em texto puro —
 * assim o fluxo local funciona e produção fica criptografada em repouso.
 */
const PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest(); // 32 bytes
}

export function encryptField(plain: string | null | undefined): string | null {
  if (plain == null || plain === "") return plain ?? null;
  const key = getKey();
  if (!key) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptField(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (!value.startsWith(PREFIX)) return value; // texto puro (dev/legado)
  const key = getKey();
  if (!key) return value;
  try {
    const raw = Buffer.from(value.slice(PREFIX.length), "base64");
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
