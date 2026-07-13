"use client";

import { useState, useTransition } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { deleteAccount } from "@/app/actions/account";

export default function ContaActions() {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <button
        className="btn btn-ghost"
        style={{ marginTop: 16 }}
        onClick={() => start(async () => await logout())}
        disabled={pending}
      >
        <LogOut size={18} /> Sair da conta
      </button>

      <div className="sec-title" style={{ color: "#c0392b" }}>
        Zona de risco
      </div>
      <p className="sec-sub">
        Excluir sua conta remove permanentemente seu perfil, histórico, pontos e publicações. Não dá
        pra desfazer.
      </p>

      {!confirming ? (
        <button
          className="btn btn-ghost"
          style={{ marginTop: 12, color: "#c0392b", borderColor: "#f3c3bd" }}
          onClick={() => setConfirming(true)}
        >
          <Trash2 size={18} /> Excluir minha conta
        </button>
      ) : (
        <div className="card" style={{ borderColor: "#f3c3bd", background: "#fdf1ef" }}>
          <b style={{ fontSize: 14.5, fontWeight: 800, color: "#c0392b" }}>Tem certeza?</b>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            Esta ação apaga todos os seus dados de forma definitiva.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Cancelar
            </button>
            <button
              className="btn"
              style={{ flex: 1, background: "#c0392b", color: "#fff" }}
              onClick={() => start(async () => await deleteAccount())}
              disabled={pending}
            >
              {pending ? "Excluindo..." : "Excluir tudo"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
