"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
};

/** Campo de senha com botão de mostrar/ocultar. Controlado se `value`/`onChange` forem passados. */
export default function PasswordField({
  name,
  label,
  placeholder = "••••••••",
  autoComplete,
  value,
  onChange,
  required,
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className="inp"
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          style={{ paddingRight: 44 }}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          style={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: 8,
            color: "var(--muted)",
            display: "flex",
          }}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
