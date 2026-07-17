"use client";

import { useRef, useActionState, useState, useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { setAvatar, removeAvatar, type AvatarState } from "@/app/actions/profile";
import Avatar from "@/components/Avatar";
import { looksLikeHeic, convertHeicToJpeg } from "@/lib/heic-client";

export default function AvatarEditor({ name, image }: { name: string; image: string | null }) {
  const [state, action, pending] = useActionState<AvatarState, FormData>(setAvatar, null);
  const [removing, startRemove] = useTransition();
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setConvertError(null);
    if (!file) return;

    if (!looksLikeHeic(file)) {
      formRef.current?.requestSubmit();
      return;
    }

    // Fotos de iPhone costumam vir em HEIC por padrão — converte pra JPEG antes de enviar.
    setConverting(true);
    try {
      const jpegFile = await convertHeicToJpeg(file);
      const dt = new DataTransfer();
      dt.items.add(jpegFile);
      if (inputRef.current) inputRef.current.files = dt.files;
      formRef.current?.requestSubmit();
    } catch {
      setConvertError("Não deu pra converter essa foto. Tente outra imagem.");
    } finally {
      setConverting(false);
    }
  };

  const busy = pending || converting;

  return (
    <div style={{ position: "relative", width: 56, height: 56, flex: "none" }}>
      <form ref={formRef} action={action}>
        <label htmlFor="avatar-input" style={{ cursor: busy ? "default" : "pointer", display: "block" }}>
          <Avatar name={name} image={image} className="ava" style={{ width: 56, height: 56, fontSize: 22, opacity: busy ? 0.6 : 1 }} />
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
          ref={inputRef}
          id="avatar-input"
          type="file"
          name="image"
          accept="image/*,.heic,.heif"
          style={{ display: "none" }}
          disabled={busy}
          onChange={onPick}
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

      {(convertError || state?.error) && (
        <p style={{ position: "absolute", top: 62, left: 0, width: 220, color: "#c0392b", fontSize: 11.5, fontWeight: 600 }}>
          {convertError ?? state?.error}
        </p>
      )}
    </div>
  );
}
