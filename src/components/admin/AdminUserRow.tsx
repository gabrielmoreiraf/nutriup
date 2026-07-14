"use client";

import { useState, useTransition } from "react";
import { Ban, ShieldCheck, Crown, XCircle } from "lucide-react";
import { setBlocked, grantDays, grantLifetime, revokeAccess, type AdminActionState } from "@/app/actions/admin";
import Avatar from "@/components/Avatar";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  isPremium: boolean;
  isBlocked: boolean;
  adminAccessUntil: string | null;
};

export default function AdminUserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [pending, start] = useTransition();
  const [days, setDays] = useState("30");
  const [error, setError] = useState<string | null>(null);

  const name = user.name || "Sem nome";
  const joined = new Date(user.createdAt).toLocaleDateString("pt-BR");
  const until = user.adminAccessUntil ? new Date(user.adminAccessUntil) : null;

  const run = (fn: () => Promise<AdminActionState>) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={name} image={user.image} className="ava" style={{ width: 44, height: 44, fontSize: 16, flex: "none" }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name} {isSelf && <span style={{ fontWeight: 600, color: "var(--muted)" }}>(você)</span>}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        <span style={badge("#eef1fb", "#3949ab")}>Desde {joined}</span>
        {user.isBlocked && <span style={badge("#fdf1ef", "#c0392b")}>Bloqueado</span>}
        {user.isPremium && (
          <span style={badge("var(--mint)", "var(--green-d)")}>
            {until ? `Premium até ${until.toLocaleDateString("pt-BR")}` : "Premium vitalício"}
          </span>
        )}
      </div>

      {error && <p style={{ color: "#c0392b", fontSize: 12.5, fontWeight: 600, marginTop: 8 }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          className="btn btn-ghost"
          style={{ ...smallBtn, color: user.isBlocked ? "var(--green-d)" : "#c0392b" }}
          disabled={pending || isSelf}
          title={isSelf ? "Você não pode bloquear a própria conta" : undefined}
          onClick={() => run(() => setBlocked(user.id, !user.isBlocked))}
        >
          <Ban size={15} /> {user.isBlocked ? "Desbloquear" : "Bloquear"}
        </button>

        {user.isPremium ? (
          <button className="btn btn-ghost" style={smallBtn} disabled={pending} onClick={() => run(() => revokeAccess(user.id))}>
            <XCircle size={15} /> Revogar
          </button>
        ) : (
          <button className="btn btn-ghost" style={smallBtn} disabled={pending} onClick={() => run(() => grantLifetime(user.id))}>
            <Crown size={15} /> Vitalício
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          className="inp"
          style={{ width: 84, padding: "8px 10px", fontSize: 13, marginTop: 0 }}
          type="number"
          min={1}
          max={3650}
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
        <button className="btn btn-ghost" style={{ ...smallBtn, flex: 1 }} disabled={pending} onClick={() => run(() => grantDays(user.id, Number(days)))}>
          <ShieldCheck size={15} /> Conceder {days || "0"} dias
        </button>
      </div>
    </div>
  );
}

const smallBtn: React.CSSProperties = { flex: 1, width: "auto", fontSize: 13, padding: "9px 10px" };

function badge(bg: string, color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    background: bg,
    color,
    fontWeight: 700,
    fontSize: 12,
    padding: "5px 10px",
    borderRadius: 999,
  };
}
