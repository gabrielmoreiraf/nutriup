"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { sendFriendRequest, type FriendState } from "@/app/actions/friends";

export default function AddFriendForm() {
  const [state, action, pending] = useActionState<FriendState, FormData>(sendFriendRequest, null);

  return (
    <form action={action}>
      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="target-handle">@ do seu amigo</label>
        <input className="inp" id="target-handle" name="handle" placeholder="apelido_do_amigo" required />
      </div>
      {state?.error && (
        <p style={{ color: "#c0392b", fontSize: 12.5, fontWeight: 600, marginTop: -8, marginBottom: 8 }}>
          {state.error}
        </p>
      )}
      <button className="btn btn-primary" style={{ marginTop: 4 }} disabled={pending}>
        <UserPlus size={18} /> {pending ? "Enviando..." : "Enviar convite"}
      </button>
    </form>
  );
}
