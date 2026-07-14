"use client";

import { useRef, useActionState, useTransition } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import { uploadAssessment, removeAssessment, type AssessmentState } from "@/app/actions/assessment";

export default function AssessmentUpload({ url, updatedAt }: { url: string | null; updatedAt: string | null }) {
  const [state, action, pending] = useActionState<AssessmentState, FormData>(uploadAssessment, null);
  const [removing, startRemove] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      {url ? (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            className="ic"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--mint)",
              color: "var(--green-d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <FileText size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 14 }}>Avaliação física anexada</b>
            {updatedAt && (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Enviada em {new Date(updatedAt).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12.5, color: "var(--green-d)", fontWeight: 700, textDecoration: "none" }}
          >
            Ver
          </a>
          <button
            type="button"
            onClick={() => startRemove(() => removeAssessment())}
            disabled={removing}
            aria-label="Remover avaliação"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b", padding: 4 }}
          >
            <Trash2 size={17} />
          </button>
        </div>
      ) : (
        <form ref={formRef} action={action}>
          <label htmlFor="assessment-input" className="install" style={{ cursor: pending ? "default" : "pointer" }}>
            <div className="ic" style={{ background: "var(--blue)" }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <b>{pending ? "Enviando..." : "Anexar avaliação física (PDF)"}</b>
              <span>A IA usa os dados reais do laudo (composição corporal, medidas) pra refinar seu plano.</span>
            </div>
          </label>
          <input
            id="assessment-input"
            type="file"
            name="file"
            accept="application/pdf"
            style={{ display: "none" }}
            disabled={pending}
            onChange={() => formRef.current?.requestSubmit()}
          />
        </form>
      )}
      {state?.error && <p style={{ color: "#c0392b", fontSize: 12.5, fontWeight: 600, marginTop: 8 }}>{state.error}</p>}
    </div>
  );
}
