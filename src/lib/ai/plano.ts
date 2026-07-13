import { z } from "zod";
import type { Perfil } from "./profile";
import { PROMPT_GERAR_PLANO } from "./prompts";
import { anthropicEnabled, callAnthropicText, parseJsonLoose } from "./anthropic";

export const planoSchema = z.object({
  meta_kcal: z.number().int().positive(),
  meta_proteina_g: z.number().int().positive(),
  observacao_ajuste: z.string(),
  refeicoes: z
    .array(
      z.object({
        nome: z.string(),
        horario: z.string(),
        kcal: z.number().int().nonnegative(),
        itens: z.array(z.string()),
      }),
    )
    .min(1),
  dica_do_dia: z.string(),
});

export type PlanoResult = z.infer<typeof planoSchema>;

/** Gera o plano do dia. Usa a IA quando há chave; senão, mock determinístico. */
export async function generatePlan(perfil: Perfil): Promise<PlanoResult & { source: "ai" | "mock" }> {
  if (anthropicEnabled()) {
    try {
      const text = await callAnthropicText({
        system: PROMPT_GERAR_PLANO,
        user: JSON.stringify(perfil),
        maxTokens: 1200,
        temperature: 0.6,
      });
      const parsed = planoSchema.parse(parseJsonLoose(text));
      return { ...parsed, source: "ai" };
    } catch (err) {
      console.error("[ai] generatePlan falhou, usando mock:", err);
    }
  }
  return { ...mockPlan(perfil), source: "mock" };
}

/* ------------------------------------------------------------------ mock */

function round10(n: number) {
  return Math.round(n / 10) * 10;
}

/** Piso calórico de segurança por sexo (prompt-mestre §2). */
function floorFor(sexo: string) {
  return sexo === "F" ? 1200 : 1500;
}

function bmrMifflin(perfil: Perfil): number {
  const { peso_kg, altura_cm, idade, sexo } = perfil;
  const base = 10 * peso_kg + 6.25 * altura_cm - 5 * idade;
  if (sexo === "M") return base + 5;
  if (sexo === "F") return base - 161;
  return base - 78; // "Outro": média das constantes
}

function activityFactor(perfil: Perfil): number {
  switch (perfil.treino.frequencia_semana) {
    case 5:
      return 1.725;
    case 4:
      return 1.55;
    case 2:
      return 1.375;
    default:
      return 1.3;
  }
}

function goalFactor(meta: Perfil["meta"]): number {
  if (meta === "perder_peso") return 0.825; // ~17,5% déficit
  if (meta === "ganho_massa") return 1.125; // ~12,5% superávit
  return 1;
}

export function mockPlan(perfil: Perfil): PlanoResult {
  const tdee = bmrMifflin(perfil) * activityFactor(perfil);
  const raw = tdee * goalFactor(perfil.meta);
  const floor = floorFor(perfil.sexo);
  const belowFloor = raw < floor;
  const metaKcal = round10(Math.max(raw, floor));

  const treina = perfil.treino.frequencia_semana > 0;
  const proteinPerKg = !treina ? 1.6 : perfil.meta === "ganho_massa" ? 2.0 : 1.8;
  const metaProteina = Math.round(perfil.peso_kg * proteinPerKg);

  const usaMed = perfil.medicacao_emagrecimento.usa;

  // Distribuição de kcal por refeição (6 refeições menores se usa medicação).
  const dist: [string, string, number][] = [
    ["Café da manhã", "07:00", 0.2],
    ["Lanche da manhã", "10:00", 0.1],
    ["Almoço", "13:00", 0.28],
    ["Lanche da tarde", "16:30", 0.12],
    ["Jantar", "20:00", 0.22],
    ["Ceia", "22:30", 0.08],
  ];

  const semLactose = perfil.restricoes_alimentares.some((r) => /lactose/i.test(r));
  const itens: Record<string, string[]> = {
    "Café da manhã": ["3 ovos mexidos", "Aveia (40g) com banana", "Café sem açúcar"],
    "Lanche da manhã": [semLactose ? "Iogurte sem lactose" : "Iogurte natural", "1 scoop de whey"],
    Almoço: ["Frango grelhado (150g)", "Arroz integral + feijão", "Brócolis e salada"],
    "Lanche da tarde": ["Pão integral", "Pasta de amendoim", "1 fruta"],
    Jantar: ["Patinho moído (150g)", "Batata-doce", "Legumes no vapor"],
    Ceia: ["Queijo cottage", "Castanhas (30g)"],
  };

  const refeicoes = dist.map(([nome, horario, pct]) => ({
    nome,
    horario,
    kcal: round10(metaKcal * pct),
    itens: itens[nome] ?? [],
  }));

  let observacao: string;
  if (belowFloor) {
    observacao =
      "Sua meta foi ajustada para o piso calórico seguro. Recomendamos acompanhamento de um profissional de saúde para um plano individualizado.";
  } else if (usaMed) {
    observacao = `Porções menores e distribuídas ao longo do dia por causa do uso de ${
      perfil.medicacao_emagrecimento.nome ?? "medicação"
    }, que reduz o apetite. Foco em proteína para preservar massa.`;
  } else if (treina) {
    observacao = `Porções e horários ajustados ao seu treino (${perfil.treino.frequencia_semana}x/sem) e à sua meta.`;
  } else {
    observacao = "Plano equilibrado ajustado à sua meta e rotina.";
  }

  return {
    meta_kcal: metaKcal,
    meta_proteina_g: metaProteina,
    observacao_ajuste: observacao,
    refeicoes,
    dica_do_dia: "Beba pelo menos 2,5L de água hoje e priorize a proteína em cada refeição.",
  };
}
