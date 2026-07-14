/** Anel de progresso (portado do protótipo). Componente puro de SVG. */
export default function Ring({
  pct,
  label,
  sub,
  light,
}: {
  pct: number;
  label: string;
  sub: string;
  light?: boolean;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(Math.max(pct, 0), 100) / 100) * c;
  return (
    <div className="progress-ring">
      <svg width="82" height="82">
        <circle cx="41" cy="41" r={r} fill="none" strokeWidth="8" stroke={light ? "rgba(255,255,255,.25)" : "#E4F0EA"} />
        <circle
          cx="41"
          cy="41"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke={light ? "#fff" : "url(#nu-ring)"}
          strokeDasharray={c}
          strokeDashoffset={off}
        />
        <defs>
          <linearGradient id="nu-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1570EF" />
            <stop offset="1" stopColor="#16B26B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="num" style={{ color: light ? "#fff" : "var(--ink)" }}>
        <b>{label}</b>
        <span>{sub}</span>
      </div>
    </div>
  );
}
