import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Upload de imagens do mural.
 * - Produção: Cloudflare R2 (S3-compatível) quando as chaves R2_* existem.
 * - Dev local: grava em /public/uploads e serve em /uploads/<arquivo>.
 *
 * /public é somente-leitura na Vercel, por isso produção usa R2.
 */
export function r2Enabled(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_PUBLIC_URL
  );
}

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB — fotos de celular modernas passam fácil de 6 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let s3: any = null;
async function getS3() {
  if (s3) return s3;
  const { S3Client } = await import("@aws-sdk/client-s3");
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return s3;
}

export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Formato de imagem não suportado.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem muito grande (máx. 6 MB).");
  }

  const ext = (file.type.split("/").pop() || "jpg").replace("jpeg", "jpg");
  const name = `${randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  if (r2Enabled()) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3();
    const key = `uploads/${name}`;
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: buf,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
  }

  // Dev local.
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

const MAX_DOC_BYTES = 8 * 1024 * 1024; // 8 MB

/** Upload de documentos (hoje só a avaliação física, em PDF). Mesmo backend do uploadImage. */
export async function uploadDocument(file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Envie um arquivo PDF.");
  }
  if (file.size > MAX_DOC_BYTES) {
    throw new Error("Arquivo muito grande (máx. 8 MB).");
  }

  const name = `${randomUUID()}.pdf`;
  const buf = Buffer.from(await file.arrayBuffer());

  if (r2Enabled()) {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3();
    const key = `documentos/${name}`;
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: buf,
        ContentType: file.type,
        CacheControl: "private, max-age=0",
      }),
    );
    return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}
