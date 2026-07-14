/**
 * IMC — calculado no backend (fórmula fixa), nunca pela IA. A IA só recebe
 * o número e a classificação já prontos, como dado de contexto do perfil.
 */
export type ImcFaixa =
  | "abaixo_do_peso"
  | "peso_normal"
  | "sobrepeso"
  | "obesidade_1"
  | "obesidade_2"
  | "obesidade_3";

export type ImcGravidade = "ok" | "atencao" | "alerta" | "alerta_alto";

export type ImcClassificacao = {
  faixa: ImcFaixa;
  label: string;
  gravidade: ImcGravidade;
};

export function calcularIMC(pesoKg: number, alturaCm: number): number {
  const alturaM = alturaCm / 100;
  const imc = pesoKg / (alturaM * alturaM);
  return Math.round(imc * 10) / 10;
}

export function classificarIMC(imc: number): ImcClassificacao {
  if (imc < 18.5) return { faixa: "abaixo_do_peso", label: "Abaixo do peso", gravidade: "atencao" };
  if (imc < 25) return { faixa: "peso_normal", label: "Peso normal", gravidade: "ok" };
  if (imc < 30) return { faixa: "sobrepeso", label: "Sobrepeso", gravidade: "atencao" };
  if (imc < 35) return { faixa: "obesidade_1", label: "Obesidade grau I", gravidade: "alerta" };
  if (imc < 40) return { faixa: "obesidade_2", label: "Obesidade grau II", gravidade: "alerta" };
  return { faixa: "obesidade_3", label: "Obesidade grau III", gravidade: "alerta_alto" };
}

/** Texto de apoio por faixa, sempre com o disclaimer de acompanhamento profissional quando cabe. */
export function textoIMC(imc: number, faixa: ImcFaixa): string {
  const n = imc.toLocaleString("pt-BR");
  switch (faixa) {
    case "abaixo_do_peso":
      return `Seu IMC é ${n}, faixa considerada abaixo do peso. O NutriUp vai te ajudar a montar uma rotina mais nutritiva. Para uma avaliação completa, vale conversar com um nutricionista.`;
    case "peso_normal":
      return `Seu IMC é ${n}, dentro da faixa considerada normal. Vamos manter esse equilíbrio.`;
    case "sobrepeso":
      return `Seu IMC é ${n}, faixa considerada sobrepeso. Vamos montar um plano pra te ajudar a evoluir com consistência.`;
    case "obesidade_1":
      return `Seu IMC é ${n}, faixa considerada obesidade grau I. O app pode te apoiar no dia a dia, mas o acompanhamento com nutricionista ou médico é importante nessa faixa.`;
    case "obesidade_2":
      return `Seu IMC é ${n}, faixa considerada obesidade grau II. O app pode te apoiar no dia a dia, mas o acompanhamento com nutricionista ou médico é importante nessa faixa.`;
    case "obesidade_3":
      return `Seu IMC é ${n}, faixa considerada obesidade grau III. O app pode te apoiar no dia a dia — nessa faixa, o acompanhamento com nutricionista ou médico é especialmente importante.`;
  }
}

/** Cores por gravidade — sempre em tons suaves (âmbar/laranja), nunca vermelho puro/alarmista. */
export const IMC_COLORS: Record<ImcGravidade, { bg: string; text: string; icon: string }> = {
  ok: { bg: "var(--mint)", text: "var(--green-d)", icon: "var(--green)" },
  atencao: { bg: "#FFF7E6", text: "#B54708", icon: "#F79009" },
  alerta: { bg: "#FFF3E6", text: "#B93815", icon: "#E67514" },
  alerta_alto: { bg: "#FEF0EC", text: "#C4320A", icon: "#C4320A" },
};
