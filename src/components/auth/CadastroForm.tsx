"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { registerUser, type AuthState } from "@/app/actions/auth";
import { PASSWORD_RULES, isPasswordValid } from "@/lib/password";
import GoogleButton from "./GoogleButton";
import PasswordField from "./PasswordField";

export default function CadastroForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerUser, null);
  const [password, setPassword] = useState("");
  const [touchedPassword, setTouchedPassword] = useState(false);
  const passwordOk = isPasswordValid(password);

  return (
    <div className="pad">
      <Link href="/" className="back">
        <ArrowLeft size={18} />
      </Link>
      <h2 className="h-title" style={{ marginTop: 18 }}>
        Criar sua conta
      </h2>
      <p className="sub">Leva menos de um minuto.</p>

      <form action={action}>
        <div className="field">
          <label htmlFor="name">Nome</label>
          <input className="inp" id="name" name="name" placeholder="Como quer ser chamado?" required />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input className="inp" id="email" name="email" type="email" placeholder="voce@email.com" required />
        </div>

        <PasswordField
          name="password"
          label="Senha"
          autoComplete="new-password"
          required
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (!touchedPassword) setTouchedPassword(true);
          }}
        />

        {touchedPassword && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <div
                  key={rule.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    color: ok ? "var(--green-d)" : "var(--muted)",
                  }}
                >
                  {ok ? <Check size={14} /> : <X size={14} />}
                  {rule.label}
                </div>
              );
            })}
          </div>
        )}

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginTop: 16,
            fontSize: 12.5,
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          <input type="checkbox" name="terms" style={{ marginTop: 2 }} required />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" style={{ color: "var(--green-d)", fontWeight: 700 }}>
              Termos
            </Link>{" "}
            e a Política de Privacidade. Entendo que o NutriUp é orientativo e não substitui
            nutricionista ou médico.
          </span>
        </label>

        {state?.error && (
          <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 12 }}>
            {state.error}
          </p>
        )}

        <button className="btn btn-primary" style={{ marginTop: 20 }} disabled={pending || !passwordOk}>
          {pending ? "Criando..." : "Continuar"} <ArrowRight size={18} />
        </button>
      </form>

      {googleEnabled && <GoogleButton label="Cadastrar com Google" />}

      <p className="sub" style={{ textAlign: "center", marginTop: 18 }}>
        Já tem conta?{" "}
        <Link href="/entrar" style={{ color: "var(--green-d)", fontWeight: 700 }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
