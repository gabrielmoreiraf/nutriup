/**
 * Pontuação calculada 100% no backend (prompt-mestre §3).
 * A IA só devolve os sinais; aqui somamos de forma determinística e auditável.
 *
 * | Sinal                         | Pontos       |
 * | Registrou o dia (base)        | +5           |
 * | status = no_caminho           | +10          |
 * | status = atencao              | +5           |
 * | status = fora_da_meta         | +2           |
 * | treino_detectado = true       | +5           |
 * | Bônus de streak (por dia)     | +1 (máx +10) |
 * | alerta_saude = true           | pontos = 0   |
 */

export type LogStatus = "no_caminho" | "atencao" | "fora_da_meta";

export type PointSignals = {
  status: LogStatus;
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

  const statusPoints = s.status === "no_caminho" ? 10 : s.status === "atencao" ? 5 : 2;
  breakdown.push({ reason: `status_${s.status}`, points: statusPoints });

  if (s.treino) breakdown.push({ reason: "treino", points: 5 });

  const streakBonus = Math.min(Math.max(s.streak, 0), 10);
  if (streakBonus > 0) breakdown.push({ reason: "streak", points: streakBonus });

  const total = breakdown.reduce((sum, b) => sum + b.points, 0);
  return { total, breakdown };
}
