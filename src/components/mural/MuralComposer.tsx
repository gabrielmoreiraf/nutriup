"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { createPost, type PostState } from "@/app/actions/mural";
import { looksLikeHeic, convertHeicToJpeg } from "@/lib/heic-client";

export default function MuralComposer() {
  const [state, action, pending] = useActionState<PostState, FormData>(createPost, null);
  const [preview, setPreview] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setConvertError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    if (!looksLikeHeic(file)) {
      setPreview(URL.createObjectURL(file));
      return;
    }

    // Fotos de iPhone costumam vir em HEIC por padrão — nem todo navegador exibe
    // esse formato, então converte pra JPEG aqui antes de anexar ao formulário.
    setConverting(true);
    try {
      const jpegFile = await convertHeicToJpeg(file);

      const dt = new DataTransfer();
      dt.items.add(jpegFile);
      if (inputRef.current) inputRef.current.files = dt.files;

      setPreview(URL.createObjectURL(jpegFile));
    } catch {
      setConvertError("Não deu pra converter essa foto. Tente outra imagem.");
      setPreview(null);
    } finally {
      setConverting(false);
    }
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
            cursor: converting ? "default" : "pointer",
          }}
        >
          {converting ? (
            <div
              style={{
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted)",
                background: "var(--mint)",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>Convertendo imagem...</span>
            </div>
          ) : preview ? (
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
          <input
            ref={inputRef}
            type="file"
            name="image"
            accept="image/*,.heic,.heif"
            onChange={onPick}
            style={{ display: "none" }}
            disabled={converting}
          />
        </label>

        <textarea
          className="ta"
          name="caption"
          style={{ marginTop: 14, minHeight: 90 }}
          placeholder="Escreva uma legenda..."
        />

        {(convertError || state?.error) && (
          <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 12 }}>
            {convertError ?? state?.error}
          </p>
        )}

        <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={pending || converting}>
          {pending ? "Publicando..." : converting ? "Aguarde..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
