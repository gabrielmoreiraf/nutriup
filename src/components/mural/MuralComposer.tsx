"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { createPost, type PostState } from "@/app/actions/mural";

export default function MuralComposer() {
  const [state, action, pending] = useActionState<PostState, FormData>(createPost, null);
  const [preview, setPreview] = useState<string | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="pad">
      <Link href="/mural" className="back">
        <ArrowLeft size={18} />
      </Link>
      <h2 className="h-title" style={{ marginTop: 18 }}>
        Publicar
      </h2>
      <p className="sub">Compartilhe uma refeição ou treino com a galera.</p>

      <form action={action}>
        <label
          className="field"
          style={{
            display: "block",
            marginTop: 16,
            border: "1.5px dashed var(--line)",
            borderRadius: 18,
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Prévia"
              width={480}
              height={220}
              unoptimized
              style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              style={{
                height: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "var(--muted)",
                background: "var(--mint)",
              }}
            >
              <ImagePlus size={28} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Adicionar foto</span>
            </div>
          )}
          <input type="file" name="image" accept="image/*" onChange={onPick} style={{ display: "none" }} />
        </label>

        <textarea
          className="ta"
          name="caption"
          style={{ marginTop: 14, minHeight: 90 }}
          placeholder="Escreva uma legenda..."
        />

        {state?.error && (
          <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 12 }}>{state.error}</p>
        )}

        <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={pending}>
          {pending ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
