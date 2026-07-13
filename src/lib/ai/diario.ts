import { z } from "zod";
import type { Perfil } from "./profile";
import { PROMPT_AVALIAR_DIA } from "./prompts";
import { anthropicEnabled, callAnthropicText, parseJsonLoose } from "./anthropic";

export const avaliacaoSchema = z.object({
  status: z.enum(["no_caminho", "atencao", "fora_da_meta"]),
  titulo: z.string(),
  feedback: z.string(),
  estimativa: z.object({ kcal: z.number(), proteina_g: z.number() }),
  treino_detectado: z.boolean(),
  ajuste_medicacao_aplicado: z.boolean(),
  alerta_saude: z.boolean(),
  sugestao: z.string(),
});

export type Avaliacao = z.infer<typeof avaliacaoSchema>;

export type PlanoDoDia = {
  meta_kcal: number;
  meta_proteina_g: number;
  refeicoes: { nome: string; horario: string; kcal: number; itens: string[] }[];
};

export async function evaluateDay(
  perfil: Perfil,
  planoDoDia: PlanoDoDia,
  relato: string,
): Promise<Avaliacao & { source: "ai" | "mock" }> {
  if (anthropicEnabled()) {
    try {
      const text = await callAnthropicText({
        system: PROMPT_AVALIAR_DIA,
        user: JSON.stringify({ perfil, plano_do_dia: planoDoDia, relato }),
        maxTokens: 600,
        temperature: 0.3,
      });
      const parsed = avaliacaoSchema.parse(parseJsonLoose(text));
      return { ...parsed, source: "ai" };
    } catch (err) {
      console.error("[ai] evaluateDay falhou, usando mock:", err);
    }
  }
  return { ...mockEvaluate(perfil, planoDoDia, relato), source: "mock" };
}

/* ------------------------------------------------------------------ mock */

const CONCERNING = [
  /vomit/i,
  /purga/i,
  /purgar/i,
  /jejum\s+(prolongad|forçad)/i,
  /n[aã]o\s+como\s+h[aá]/i,
  /pulei\s+(v[aá]rias|todas)/i,
  /compens/i,
  /culpa/i,
  /me\s+odeio/i,
  /passar\s+fome/i,
];

const TREINO = /(trein|muscula|academia|corri|corrida|crossfit|pedal|nata|caminhad|perna|peito|costas)/i;

export function mockEvaluate(perfil: Perfil, plano: PlanoDoDia, relato: string): Avaliacao {
  const texto = relato.toLowerCase();

  // Segurança tem prioridade máxima.
  if (CONCERNING.some((re) => re.test(relato))) {
    return {
      status: "atencao",
      titulo: "Estamos com você",
      feedback:
        "Obrigado por compartilhar. Percebi sinais de que a relação com a comida pode estar pesando. Você não precisa lidar com isso sozinho(a).",
      estimativa: { kcal: 0, proteina_g: 0 },
      treino_detectado: false,
      ajuste_medicacao_aplicado: perfil.medicacao_emagrecimento.usa,
      alerta_saude: true,
      sugestao:
        "Considere conversar com um nutricionista ou psicólogo. Se precisar falar agora, ligue para o CVV: 188 (24h, gratuito).",
    };
  }

  const treino = TREINO.test(relato);
  const usaMed = perfil.medicacao_emagrecimento.usa;

  // Estimativa grosseira: proporção de menções de comida × meta.
  const foodHits = (texto.match(/(comi|almoc|jantar|lanch|caf[eé]|shake|whey|prote[ií]na|arroz|frango|ovo|salada|lasanha|p[aã]o|fruta)/g) ?? []).length;
  const ratio = Math.min(1, 0.35 + foodHits * 0.12);
  const estKcal = Math.round((plano.meta_kcal * ratio) / 10) * 10;
  const estProt = Math.round(plano.meta_proteina_g * Math.min(1, ratio + 0.1));

  // Status: medicação nunca penaliza baixa ingestão.
  let status: Avaliacao["status"];
  if (usaMed) {
    status = foodHits >= 2 ? "no_caminho" : "atencao";
  } else if (ratio >= 0.8) {
    status = "no_caminho";
  } else if (ratio >= 0.55) {
    status = "atencao";
  } else {
    status = "fora_da_meta";
  }

  const titulos = {
    no_caminho: "No caminho certo",
    atencao: "Quase lá",
    fora_da_meta: "Dia fora da meta",
  };

  const feedbacks = {
    no_caminho: "Boa! Suas escolhas encaixam bem na sua meta" + (treino ? " e o treino somou volume." : "."),
    atencao: "Você registrou e isso já conta. Dá pra ajustar um ponto pra chegar mais perto da meta.",
    fora_da_meta: "Valeu por ser honesto no registro. Amanhã é uma nova chance de se aproximar da meta.",
  };

  return {
    status,
    titulo: titulos[status],
    feedback: feedbacks[status],
    estimativa: { kcal: estKcal, proteina_g: estProt },
    treino_detectado: treino,
    ajuste_medicacao_aplicado: usaMed,
    alerta_saude: false,
    sugestao:
      status === "no_caminho"
        ? "Feche o dia com uma boa hidratação e ~30g de proteína antes de dormir."
        : "Inclua uma fonte de proteína na próxima refeição pra chegar mais perto da meta.",
  };
}
