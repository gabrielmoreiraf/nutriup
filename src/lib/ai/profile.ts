import type { InferSelectModel } from "drizzle-orm";
import type { profiles } from "@/db";
import { decryptField } from "@/lib/crypto";

type ProfileRow = InferSelectModel<typeof profiles>;

/** Objeto de perfil compartilhado pelos dois prompts (contrato do prompt-mestre). */
export type Perfil = {
  nome: string;
  sexo: string;
  idade: number;
  peso_kg: number;
  altura_cm: number;
  meta: "perder_peso" | "manter" | "ganho_massa";
  treino: { frequencia_semana: number; tipo: string; intensidade: string };
  medicacao_emagrecimento: { usa: boolean; nome?: string; dose?: string };
  outras_condicoes: string[];
  restricoes_alimentares: string[];
  preferencias: { gosta: string[]; evita: string[] };
};

const FREQ_TO_WEEK: Record<string, number> = {
  nao_treino: 0,
  "1-2x": 2,
  "3-4x": 4,
  "5x+": 5,
};

export function buildPerfil(profile: ProfileRow, nome: string): Perfil {
  return {
    nome,
    sexo: profile.sex ?? "Outro",
    idade: profile.age ?? 30,
    peso_kg: profile.weightKg ?? 70,
    altura_cm: profile.heightCm ?? 170,
    meta: (profile.goal ?? "manter") as Perfil["meta"],
    treino: {
      frequencia_semana: FREQ_TO_WEEK[profile.trainingFreq ?? "nao_treino"] ?? 0,
      tipo: profile.trainingType ?? "nenhum",
      intensidade: profile.trainingIntensity ?? "sedentario",
    },
    medicacao_emagrecimento: {
      usa: profile.medUses,
      nome: decryptField(profile.medName) ?? undefined,
      dose: decryptField(profile.medDose) ?? undefined,
    },
    outras_condicoes: (profile.otherConditions ?? []).map((c) => decryptField(c) ?? c),
    restricoes_alimentares: profile.restrictions ?? [],
    preferencias: {
      gosta: profile.prefs?.gosta ?? [],
      evita: profile.prefs?.evita ?? [],
    },
  };
}
