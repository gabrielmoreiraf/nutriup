export type PlanType = "mensal" | "anual";

/** Preços em reais (BRL), usados tanto na UI quanto na chamada à Asaas. */
export const PLAN_PRICE: Record<PlanType, number> = {
  mensal: 19.99,
  anual: 99.99,
};

export const PLAN_LABELS: Record<PlanType, { title: string; price: string; sub: string }> = {
  mensal: { title: "Mensal", price: "R$ 19,99", sub: "por mês" },
  anual: { title: "Anual", price: "R$ 99,99", sub: "por ano · economize ~58%" },
};
