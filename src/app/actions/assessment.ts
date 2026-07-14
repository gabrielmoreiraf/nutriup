"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, profiles } from "@/db";
import { requireOnboardedUser } from "@/lib/session";
import { uploadDocument } from "@/lib/storage";

export type AssessmentState = { error?: string } | null;

// Corta o texto extraído pra não inflar o prompt/custo de token à toa —
// laudos de avaliação física raramente passam disso em conteúdo relevante.
const MAX_TEXT_CHARS = 6000;

export async function uploadAssessment(_prev: AssessmentState, formData: FormData): Promise<AssessmentState> {
  const user = await requireOnboardedUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha um arquivo PDF." };
  }

  let url: string;
  try {
    url = await uploadDocument(file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha no upload do arquivo." };
  }

  let text = "";
  try {
    // Importa o worker interno direto, não o index.js do pacote: o index.js
    // tem uma checagem de "modo debug" que quebra sob bundler (Turbopack/webpack)
    // e tenta ler um PDF de teste que não existe neste projeto.
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const buf = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buf);
    text = data.text.trim().slice(0, MAX_TEXT_CHARS);
  } catch (err) {
    // PDF protegido, escaneado sem texto, corrompido etc. — guarda o arquivo mesmo assim,
    // só não tem texto pra IA usar ainda.
    console.error("[assessment] extração de texto falhou:", err);
    text = "";
  }

  await db
    .update(profiles)
    .set({ assessmentUrl: url, assessmentText: text || null, assessmentUpdatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  revalidatePath("/perfil");
  return null;
}

export async function removeAssessment() {
  const user = await requireOnboardedUser();
  await db
    .update(profiles)
    .set({ assessmentUrl: null, assessmentText: null, assessmentUpdatedAt: null })
    .where(eq(profiles.userId, user.id));
  revalidatePath("/perfil");
}
