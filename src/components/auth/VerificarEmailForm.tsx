"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { verifyEmailCode, resendVerificationCode, type VerifyState } from "@/app/actions/email-verification";

export default function VerificarEmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<VerifyState, FormData>(verifyEmailCode, null);
  const [resending, startResend] = useTransition();
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const resend = () => {
    setResendMsg(null);
    startResend(async () => {
      const res = await resendVerificationCode();
      if (res.ok) {
        setResendMsg("Código reenviado! Confira seu e-mail.");
        setCooldown(60);
      } else {
        setResendMsg(res.error ?? "Não foi possível reenviar agora.");
      }
    });
  };

  return (
    <div className="pad" style={{ paddingTop: 12 }}>
      <div className="center" style={{ paddingTop: 16, paddingBottom: 6 }}>
        <div className="mark" style={{ width: 52, height: 52, borderRadius: 16 }}>
          <Mail size={24} />
        </div>
        <h2 className="h-title" style={{ marginTop: 18, textAlign: "center" }}>
          Confirme seu e-mail
        </h2>
        <p className="sub" style={{ textAlign: "center" }}>
          Enviamos um código de 6 dígitos para <b>{email}</b>.
        </p>
      </div>

      <form action={action}>
        <div className="field">
          <label htmlFor="code">Código de verificação</label>
          <input
            className="inp"
            id="code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            style={{ textAlign: "center", fontSize: 22, letterSpacing: 8, fontWeight: 800 }}
            autoFocus
            required
          />
        </div>

        {state?.error && (
          <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 12 }}>{state.error}</p>
        )}

        <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={pending}>
          {pending ? "Verificando..." : "Verificar"}
        </button>
      </form>

      <button
        className="btn btn-ghost"
        style={{ marginTop: 12 }}
        onClick={resend}
        disabled={resending || cooldown > 0}
      >
        <RefreshCw size={18} />
        {cooldown > 0 ? `Reenviar em ${cooldown}s` : resending ? "Reenviando..." : "Reenviar código"}
      </button>

      {resendMsg && (
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginTop: 10,
            textAlign: "center",
            color: resendMsg.includes("reenviado") ? "var(--green-d)" : "#c0392b",
          }}
        >
          {resendMsg}
        </p>
      )}
    </div>
  );
}
