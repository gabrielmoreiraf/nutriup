"use client";

import { useActionState } from "react";
import { setPreferences, type PreferencesState } from "@/app/actions/preferences";

export default function PreferencesForm({ gosta, evita }: { gosta: string[]; evita: string[] }) {
  const [state, action, pending] = useActionState<PreferencesState, FormData>(setPreferences, null);

  return (
    <form action={action}>
      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="gosta">O que você gosta de comer (separe por vírgula)</label>
        <textarea
          className="ta"
          id="gosta"
          name="gosta"
          style={{ minHeight: 70 }}
          placeholder="frango, arroz, banana, ovo..."
          defaultValue={gosta.join(", ")}
        />
      </div>
      <div className="field">
        <label htmlFor="evita">O que você não gosta ou não tem condição de comprar</label>
        <textarea
          className="ta"
          id="evita"
          name="evita"
          style={{ minHeight: 70 }}
          placeholder="peixe, lactose, alimentos caros..."
          defaultValue={evita.join(", ")}
        />
      </div>
      {state?.error && (
        <p style={{ color: "#c0392b", fontSize: 12.5, fontWeight: 600, marginTop: -8, marginBottom: 8 }}>
          {state.error}
        </p>
      )}
      <button className="btn btn-ghost" style={{ marginTop: 4 }} disabled={pending}>
        {pending ? "Salvando..." : "Salvar preferências"}
      </button>
    </form>
  );
}
