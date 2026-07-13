const TZ = "America/Sao_Paulo";

/** Data de hoje no fuso do Brasil, no formato YYYY-MM-DD. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(new Date());
}

/** YYYY-MM-DD de N dias atrás (no fuso do Brasil). */
export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(d);
}

/** "há X min/h/d" a partir de uma data. */
export function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const days = Math.floor(h / 24);
  return `há ${days}d`;
}

/** Dia anterior a uma data YYYY-MM-DD (seguro em qualquer fuso). */
export function prevISO(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

/** Início da semana (segunda-feira) como YYYY-MM-DD, para o ranking semanal. */
export function weekStartISO(): string {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const day = local.getDay(); // 0=dom
  const diff = (day + 6) % 7; // dias desde segunda
  local.setDate(local.getDate() - diff);
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const d = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
