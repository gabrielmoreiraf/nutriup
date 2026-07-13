"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, QrCode, CreditCard, ArrowLeft } from "lucide-react";
import {
  subscribeWithPix,
  subscribeWithCard,
  getSubscriptionStatus,
  type CardSubscribeInput,
} from "@/app/actions/asaas";
import type { PlanType } from "@/lib/pricing";

const PLANS: { key: PlanType; title: string; price: string; sub: string; badge?: string }[] = [
  { key: "anual", title: "Anual", price: "R$ 99,99", sub: "por ano", badge: "Melhor custo" },
  { key: "mensal", title: "Mensal", price: "R$ 19,99", sub: "por mês" },
];

const BENEFITS = [
  "Plano alimentar diário gerado por IA",
  "Avaliação do seu dia em linguagem natural",
  "Ranking, streak e mural da comunidade",
];

type Step =
  | { name: "plans" }
  | { name: "checkout"; plan: PlanType }
  | { name: "pix-result"; plan: PlanType; qrCodeImage: string; copyPaste: string }
  | { name: "success" };

export default function AssinarPlans({ enabled }: { enabled: boolean }) {
  const [step, setStep] = useState<Step>({ name: "plans" });

  if (step.name === "plans") {
    return (
      <>
        <div className="card" style={{ padding: 18 }}>
          {BENEFITS.map((b) => (
            <div key={b} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0" }}>
              <Check size={18} style={{ color: "var(--green)", flex: "none" }} />
              <span style={{ fontSize: 14 }}>{b}</span>
            </div>
          ))}
        </div>

        {PLANS.map((p) => (
          <div key={p.key} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <b style={{ fontSize: 16, fontWeight: 800 }}>{p.title}</b>
                {p.badge && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: "#fff",
                      background: "var(--green)",
                      padding: "3px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {p.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>
                {p.price} <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{p.sub}</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "auto", padding: "12px 18px" }}
              onClick={() => setStep({ name: "checkout", plan: p.key })}
            >
              Assinar
            </button>
          </div>
        ))}

        {!enabled && (
          <div
            className="install"
            style={{ borderStyle: "solid", borderColor: "var(--line)", background: "var(--mint)" }}
          >
            <div className="ic" style={{ background: "var(--green)" }}>
              <Check size={20} />
            </div>
            <div>
              <b>Modo de desenvolvimento</b>
              <span>Sem Asaas configurado, o acesso premium está liberado para testar todo o fluxo.</span>
            </div>
          </div>
        )}

        <p className="disclaimer">Pagamento via Pix ou cartão de crédito. Cancele quando quiser.</p>
      </>
    );
  }

  if (step.name === "checkout") {
    return (
      <CheckoutForm
        plan={step.plan}
        onBack={() => setStep({ name: "plans" })}
        onPixReady={(qrCodeImage, copyPaste) => setStep({ name: "pix-result", plan: step.plan, qrCodeImage, copyPaste })}
        onCardConfirmed={() => setStep({ name: "success" })}
      />
    );
  }

  if (step.name === "pix-result") {
    return <PixResult qrCodeImage={step.qrCodeImage} copyPaste={step.copyPaste} onConfirmed={() => setStep({ name: "success" })} />;
  }

  return (
    <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
      <div
        className="ic"
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: "var(--grad)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <Check size={28} />
      </div>
      <b style={{ fontSize: 17, fontWeight: 800 }}>Assinatura confirmada!</b>
      <p className="sub" style={{ marginTop: 6 }}>
        Seu NutriUp Premium já está ativo. Aproveite o plano por IA e o diário inteligente.
      </p>
    </div>
  );
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function CheckoutForm({
  plan,
  onBack,
  onPixReady,
  onCardConfirmed,
}: {
  plan: PlanType;
  onBack: () => void;
  onPixReady: (qrCodeImage: string, copyPaste: string) => void;
  onCardConfirmed: () => void;
}) {
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [cpf, setCpf] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // campos exclusivos do cartão
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  const submit = async () => {
    setError(null);
    if (onlyDigits(cpf).length !== 11 && onlyDigits(cpf).length !== 14) {
      setError("Digite um CPF ou CNPJ válido.");
      return;
    }
    setPending(true);
    try {
      if (method === "pix") {
        const res = await subscribeWithPix(plan, cpf);
        if (res.ok) onPixReady(res.qrCodeImage, res.copyPaste);
        else setError(res.error);
      } else {
        const input: CardSubscribeInput = {
          cpfCnpj: cpf,
          email,
          phone,
          postalCode,
          addressNumber,
          holderName,
          cardNumber,
          expiryMonth,
          expiryYear,
          cvv,
        };
        const res = await subscribeWithCard(plan, input);
        if (res.ok) onCardConfirmed();
        else setError(res.error ?? "Não foi possível processar o cartão.");
      }
    } catch {
      setError("Algo deu errado. Tente de novo.");
    }
    setPending(false);
  };

  return (
    <div>
      <div className="back" onClick={onBack} role="button" tabIndex={0} style={{ marginBottom: 14 }}>
        <ArrowLeft size={18} />
      </div>

      <div className="tabs">
        <button className={method === "pix" ? "on" : ""} onClick={() => setMethod("pix")} type="button">
          <QrCode size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
          Pix
        </button>
        <button className={method === "card" ? "on" : ""} onClick={() => setMethod("card")} type="button">
          <CreditCard size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
          Cartão
        </button>
      </div>

      <div className="field">
        <label htmlFor="cpf">CPF ou CNPJ</label>
        <input
          className="inp"
          id="cpf"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
      </div>

      {method === "card" && (
        <>
          <div className="field">
            <label htmlFor="holderName">Nome no cartão</label>
            <input className="inp" id="holderName" value={holderName} onChange={(e) => setHolderName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cardNumber">Número do cartão</label>
            <input
              className="inp"
              id="cardNumber"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className="row2">
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="expiryMonth">Mês</label>
              <input className="inp" id="expiryMonth" placeholder="MM" maxLength={2} value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} />
            </div>
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="expiryYear">Ano</label>
              <input className="inp" id="expiryYear" placeholder="AAAA" maxLength={4} value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="cvv">CVV</label>
            <input className="inp" id="cvv" inputMode="numeric" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input className="inp" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="phone">Telefone</label>
            <input className="inp" id="phone" inputMode="numeric" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="row2">
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="postalCode">CEP</label>
              <input className="inp" id="postalCode" inputMode="numeric" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="addressNumber">Número</label>
              <input className="inp" id="addressNumber" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
            </div>
          </div>
        </>
      )}

      {error && <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 12 }}>{error}</p>}

      <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={submit} disabled={pending}>
        {pending ? "Processando..." : method === "pix" ? "Gerar Pix" : "Confirmar assinatura"}
      </button>
    </div>
  );
}

function PixResult({
  qrCodeImage,
  copyPaste,
  onConfirmed,
}: {
  qrCodeImage: string;
  copyPaste: string;
  onConfirmed: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const res = await getSubscriptionStatus();
      if (res?.status === "active") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onConfirmed();
      }
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ textAlign: "center", padding: 20 }}>
      <b style={{ fontSize: 16, fontWeight: 800 }}>Escaneie o QR Code</b>
      <p className="sub" style={{ marginTop: 4 }}>Abra o app do seu banco e pague com Pix.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${qrCodeImage}`}
        alt="QR Code Pix"
        style={{ width: 220, height: 220, margin: "16px auto", display: "block", borderRadius: 12 }}
      />
      <button className="btn btn-ghost" onClick={copy}>
        <Copy size={16} /> {copied ? "Copiado!" : "Copiar código Pix"}
      </button>
      <p className="disclaimer">Confirmamos automaticamente assim que o pagamento cair.</p>
    </div>
  );
}
