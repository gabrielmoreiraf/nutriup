"use client";

import { useActionState } from "react";
import { setHandle, type FriendState } from "@/app/actions/friends";

export default function HandleForm({ currentHandle }: { currentHandle: string | null }) {
  const [state, action, pending] = useActionState<FriendState, FormData>(setHandle, null);

  return (
    <form action={action}>
      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="handle">Seu @ (pra amigos te encontrarem)</label>
        <input
          className="inp"
          id="handle"
          name="handle"
          placeholder="seu_apelido"
          defaultValue={currentHandle ?? ""}
          required
        />
      </div>
      {state?.error && (
        <p style={{ color: "#c0392b", fontSize: 12.5, fontWeight: 600, marginTop: -8, marginBottom: 8 }}>
          {state.error}
        </p>
      )}
      <button className="btn btn-ghost" style={{ marginTop: 4 }} disabled={pending}>
        {pending ? "Salvando..." : currentHandle ? "Atualizar @" : "Criar meu @"}
      </button>
    </form>
  );
}
