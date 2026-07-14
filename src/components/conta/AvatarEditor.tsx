"use client";

import { useRef, useActionState, useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { setAvatar, removeAvatar, type AvatarState } from "@/app/actions/profile";
import Avatar from "@/components/Avatar";

export default function AvatarEditor({ name, image }: { name: string; image: string | null }) {
  const [state, action, pending] = useActionState<AvatarState, FormData>(setAvatar, null);
  const [removing, startRemove] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div style={{ position: "relative", width: 56, height: 56, flex: "none" }}>
      <form ref={formRef} action={action}>
        <label htmlFor="avatar-input" style={{ cursor: pending ? "default" : "pointer", display: "block" }}>
          <Avatar name={name} image={image} className="ava" style={{ width: 56, height: 56, fontSize: 22, opacity: pending ? 0.6 : 1 }} />
          <span
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              background: "var(--green)",
              borderRadius: 999,
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            <Camera size={12} color="#fff" />
          </span>
        </label>
        <input
          id="avatar-input"
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: "none" }}
          disabled={pending}
          onChange={() => formRef.current?.requestSubmit()}
        />
      </form>

      {image && (
        <button
          type="button"
          onClick={() => startRemove(() => removeAvatar())}
          disabled={removing || pending}
          aria-label="Remover foto"
          style={{
            position: "absolute",
            top: -6,
            left: -6,
            background: "#c0392b",
            border: "2px solid #fff",
            borderRadius: 999,
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Trash2 size={11} color="#fff" />
        </button>
      )}

      {state?.error && (
        <p style={{ position: "absolute", top: 62, left: 0, width: 220, color: "#c0392b", fontSize: 11.5, fontWeight: 600 }}>
          {state.error}
        </p>
      )}
    </div>
  );
}
