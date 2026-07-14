/**
 * Pontuação calculada 100% no backend, a partir de sinais que a IA devolve —
 * nunca aleatória de verdade (isso seria injusto e não auditável), mas também
 * nunca um valor fixo por "status": a nota de qualidade vem de como a IA leu o
 * que foi de fato relatado, então dois dias com o mesmo status pontuam diferente
 * se o esforço/qualidade relatados forem diferentes.
 *
 * | Sinal                          | Pontos              |
 * | Registrou o dia (base)         | +5                  |
 * | qualidade (0 a 10, dado pela IA)| +0 a +10 (1:1)      |
 * | treino_detectado = true        | +5                  |
 * | Bônus de streak (por dia)      | +1 (máx +10)        |
 * | alerta_saude = true             | pontos = 0          |
 */

export type LogStatus = "no_caminho" | "atencao" | "fora_da_meta";

export type PointSignals = {
  qualidade: number; // 0 a 10, avaliado pela IA a partir do relato
  treino: boolean;
  alertaSaude: boolean;
  streak: number; // streak já considerando o dia registrado
};

export type PointsBreakdown = { reason: string; points: number };

export function computePoints(s: PointSignals): {
  total: number;
  breakdown: PointsBreakdown[];
} {
  // Segurança em primeiro lugar: quando há alerta, não competimos.
  if (s.alertaSaude) return { total: 0, breakdown: [] };

  const breakdown: PointsBreakdown[] = [{ reason: "registro", points: 5 }];

  const qualidadePoints = Math.round(Math.min(Math.max(s.qualidade, 0), 10));
  breakdown.push({ reason: "qualidade", points: qualidadePoints });

  if (s.treino) breakdown.push({ reason: "treino", points: 5 });

  const streakBonus = Math.min(Math.max(s.streak, 0), 10);
  if (streakBonus > 0) breakdown.push({ reason: "streak", points: streakBonus });

  const total = breakdown.reduce((sum, b) => sum + b.points, 0);
  return { total, breakdown };
}
