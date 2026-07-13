"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { loginUser, type AuthState } from "@/app/actions/auth";
import GoogleButton from "./GoogleButton";
import PasswordField from "./PasswordField";

export default function EntrarForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginUser, null);

  return (
    <div className="pad">
      <Link href="/" className="back">
        <ArrowLeft size={18} />
      </Link>
      <h2 className="h-title" style={{ marginTop: 18 }}>
        Bem-vindo de volta
      </h2>
      <p className="sub">Entre pra continuar sua rotina.</p>

      <form action={action}>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input className="inp" id="email" name="email" type="email" placeholder="voce@email.com" required />
        </div>
        <PasswordField name="password" label="Senha" autoComplete="current-password" required />

        {state?.error && (
          <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 12 }}>
            {state.error}
          </p>
        )}

        <button className="btn btn-primary" style={{ marginTop: 20 }} disabled={pending}>
          {pending ? "Entrando..." : "Entrar"} <ArrowRight size={18} />
        </button>
      </form>

      {googleEnabled && <GoogleButton />}

      <p className="sub" style={{ textAlign: "center", marginTop: 18 }}>
        Ainda não tem conta?{" "}
        <Link href="/cadastro" style={{ color: "var(--green-d)", fontWeight: 700 }}>
          Criar conta
        </Link>
      </p>
    </div>
  );
}
