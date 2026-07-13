"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db, profiles } from "@/db";
import { requireUser } from "@/lib/session";
import { encryptField } from "@/lib/crypto";

const onboardingSchema = z.object({
  weightKg: z.number().min(30).max(400),
  heightCm: z.number().int().min(100).max(250),
  age: z.number().int().min(12).max(110),
  sex: z.enum(["M", "F", "Outro"]),
  goal: z.enum(["perder_peso", "manter", "ganho_massa"]),
  medUses: z.boolean(),
  medName: z.string().trim().max(60).optional(),
  medDose: z.string().trim().max(120).optional(),
  otherConditions: z.array(z.string().trim().max(80)).optional(),
  trainingFreq: z.enum(["nao_treino", "1-2x", "3-4x", "5x+"]),
  trainingType: z.string().trim().max(40).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/** Deriva a intensidade a partir da frequência (usada pela IA depois). */
function intensityFromFreq(freq: OnboardingInput["trainingFreq"]): string {
  switch (freq) {
    case "5x+":
      return "alta";
    case "3-4x":
      return "moderada";
    case "1-2x":
      return "leve";
    default:
      return "sedentario";
  }
}

export async function completeOnboarding(input: OnboardingInput): Promise<{ error?: string }> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados do perfil inválidos." };
  }
  const d = parsed.data;

  const values = {
    userId: user.id,
    sex: d.sex,
    age: d.age,
    weightKg: d.weightKg,
    heightCm: d.heightCm,
    goal: d.goal,
    trainingFreq: d.trainingFreq,
    trainingType: d.trainingType ?? null,
    trainingIntensity: intensityFromFreq(d.trainingFreq),
    // dados sensíveis de saúde — cifrados em repouso, nunca expostos publicamente
    medUses: d.medUses,
    medName: d.medUses ? encryptField(d.medName ?? null) : null,
    medDose: d.medUses ? encryptField(d.medDose ?? null) : null,
    otherConditions: (d.otherConditions ?? []).map((c) => encryptField(c) ?? c),
    updatedAt: new Date(),
  };

  await db
    .insert(profiles)
    .values(values)
    .onConflictDoUpdate({ target: profiles.userId, set: values });

  redirect("/inicio");
}
