"use client";

import { useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  TrendingUp,
  Target,
  Dumbbell,
  Pill,
  Sparkles,
} from "lucide-react";
import { completeOnboarding, type OnboardingInput } from "@/app/actions/onboarding";
import ImcCard from "./ImcCard";

type Goal = "perder_peso" | "manter" | "ganho_massa";
type Sex = "M" | "F" | "Outro";
type Freq = "nao_treino" | "1-2x" | "3-4x" | "5x+";

const FREQ_LABEL: Record<Freq, string> = {
  nao_treino: "Não treino",
  "1-2x": "1-2x/sem",
  "3-4x": "3-4x/sem",
  "5x+": "5x+/sem",
};

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // básicos
  const [weight, setWeight] = useState("78");
  const [height, setHeight] = useState("176");
  const [age, setAge] = useState("27");
  const [sex, setSex] = useState<Sex>("M");
  // meta
  const [goal, setGoal] = useState<Goal>("ganho_massa");
  // saúde
  const [medUses, setMedUses] = useState(false);
  const [med, setMed] = useState("Mounjaro");
  const [medDose, setMedDose] = useState("");
  const [treat, setTreat] = useState(false);
  const [otherConditions, setOtherConditions] = useState("");
  // treino
  const [freq, setFreq] = useState<Freq>("3-4x");
  const [trainingType, setTrainingType] = useState("Musculação");

  const back = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const validateBasics = (): boolean => {
    const w = Number(weight.replace(",", "."));
    const h = Number(height);
    const a = Number(age);
    if (!w || w < 30 || w > 400) return fail("Informe um peso válido (kg).");
    if (!h || h < 100 || h > 250) return fail("Informe uma altura válida (cm).");
    if (!a || a < 12 || a > 110) return fail("Informe uma idade válida.");
    return true;
  };

  const fail = (msg: string) => {
    setError(msg);
    return false;
  };

  const next = () => {
    setError(null);
    if (step === 0 && !validateBasics()) return;
    setStep((s) => s + 1);
  };

  const finish = () => {
    setError(null);
    const input: OnboardingInput = {
      weightKg: Number(weight.replace(",", ".")),
      heightCm: Number(height),
      age: Number(age),
      sex,
      goal,
      medUses,
      medName: medUses ? med : undefined,
      medDose: medUses && medDose.trim() ? medDose.trim() : undefined,
      otherConditions: treat && otherConditions.trim()
        ? otherConditions.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      trainingFreq: freq,
      trainingType: freq !== "nao_treino" ? trainingType : undefined,
    };
    startTransition(async () => {
      const res = await completeOnboarding(input);
      if (res?.error) setError(res.error);
      // sucesso → completeOnboarding faz redirect para /inicio
    });
  };

  return (
    <div className="pad">
      {step > 0 && (
        <div className="back" onClick={back} role="button" tabIndex={0}>
          <ArrowLeft size={18} />
        </div>
      )}
      <div className="steps" style={{ marginTop: 18 }}>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i <= step ? "on" : ""} />
        ))}
      </div>

      {/* STEP 0 — dados básicos */}
      {step === 0 && (
        <>
          <h2 className="h-title">Seus dados</h2>
          <p className="sub">Pra calcular sua meta certinha.</p>
          <div className="row2" style={{ marginTop: 16 }}>
            <div className="field" style={{ marginTop: 0 }}>
              <label>Peso (kg)</label>
              <input className="inp" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="field" style={{ marginTop: 0 }}>
              <label>Altura (cm)</label>
              <input className="inp" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <ImcCard weight={weight} height={height} />
          </div>

          <div className="field">
            <label>Idade</label>
            <input className="inp" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="field">
            <label>Sexo</label>
            <div className="pill-row">
              {(["M", "F", "Outro"] as Sex[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  className={"pill" + (sex === o ? " sel" : "")}
                  onClick={() => setSex(o)}
                >
                  {o === "M" ? "Masculino" : o === "F" ? "Feminino" : "Outro"}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* STEP 1 — meta */}
      {step === 1 && (
        <>
          <h2 className="h-title">Qual é a sua meta?</h2>
          <p className="sub">Isso guia como a IA vai te avaliar.</p>
          {(
            [
              ["perder_peso", "Perder peso", "Déficit calórico saudável", <TrendingUp key="i" size={22} style={{ transform: "rotate(180deg)" }} />],
              ["manter", "Manter peso", "Equilíbrio e boa forma", <Target key="i" size={22} />],
              ["ganho_massa", "Ganhar massa", "Superávit com foco em proteína", <Dumbbell key="i" size={22} />],
            ] as [Goal, string, string, React.ReactNode][]
          ).map(([k, t, s, ic]) => (
            <button key={k} type="button" className={"opt" + (goal === k ? " sel" : "")} onClick={() => setGoal(k)}>
              <span className="ic">{ic}</span>
              <span>
                <b>{t}</b>
                <span>{s}</span>
              </span>
              {goal === k && (
                <span className="chk">
                  <Check size={20} />
                </span>
              )}
            </button>
          ))}
        </>
      )}

      {/* STEP 2 — saúde */}
      {step === 2 && (
        <>
          <h2 className="h-title">Saúde</h2>
          <p className="sub">A IA usa isso pra avaliar seu dia com precisão. Fica só pra você.</p>

          <div className="field">
            <label>Usa alguma medicação para emagrecer ou controle de peso?</label>
            <div className="pill-row">
              <button type="button" className={"pill" + (medUses ? " sel" : "")} onClick={() => setMedUses(true)}>
                Sim
              </button>
              <button type="button" className={"pill" + (!medUses ? " sel" : "")} onClick={() => setMedUses(false)}>
                Não
              </button>
            </div>
          </div>

          {medUses && (
            <>
              <div className="field">
                <label>Qual?</label>
                <div className="pill-row">
                  {["Mounjaro", "Ozempic", "Wegovy", "Saxenda", "Outro"].map((o) => (
                    <button key={o} type="button" className={"pill" + (med === o ? " sel" : "")} onClick={() => setMed(o)}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Dose e frequência (opcional)</label>
                <input
                  className="inp"
                  placeholder="Ex: 2,5 mg — 1x por semana"
                  value={medDose}
                  onChange={(e) => setMedDose(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="field">
            <label>Faz outro tratamento de saúde?</label>
            <div className="pill-row">
              <button type="button" className={"pill" + (treat ? " sel" : "")} onClick={() => setTreat(true)}>
                Sim
              </button>
              <button type="button" className={"pill" + (!treat ? " sel" : "")} onClick={() => setTreat(false)}>
                Não
              </button>
            </div>
          </div>
          {treat && (
            <div className="field">
              <label>Quais medicamentos? (opcional)</label>
              <input
                className="inp"
                placeholder="Ex: Losartana, Metformina..."
                value={otherConditions}
                onChange={(e) => setOtherConditions(e.target.value)}
              />
            </div>
          )}

          <div className="install" style={{ borderStyle: "solid", borderColor: "var(--line)", background: "var(--mint)" }}>
            <div className="ic" style={{ background: "var(--green)" }}>
              <Pill size={20} />
            </div>
            <div>
              <b>Por que perguntamos</b>
              <span>
                Remédios como o Mounjaro reduzem o apetite — a IA considera isso ao avaliar seu dia.
                Nunca aparece no ranking ou mural.
              </span>
            </div>
          </div>
        </>
      )}

      {/* STEP 3 — treino */}
      {step === 3 && (
        <>
          <h2 className="h-title">Seu treino</h2>
          <p className="sub">Com que frequência você treina?</p>
          <div className="pill-row" style={{ marginTop: 16 }}>
            {(Object.keys(FREQ_LABEL) as Freq[]).map((o) => (
              <button key={o} type="button" className={"pill" + (freq === o ? " sel" : "")} onClick={() => setFreq(o)}>
                {FREQ_LABEL[o]}
              </button>
            ))}
          </div>
          {freq !== "nao_treino" && (
            <div className="field">
              <label>Tipo de treino</label>
              <div className="pill-row">
                {["Musculação", "Corrida", "Crossfit", "Funcional", "Outro"].map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={"pill" + (trainingType === o ? " sel" : "")}
                    onClick={() => setTrainingType(o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="card card-grad" style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Sparkles size={28} />
              <div>
                <b style={{ fontSize: 16 }}>Tudo pronto!</b>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Sua meta e perfil foram configurados.</div>
              </div>
            </div>
          </div>
        </>
      )}

      {error && (
        <p style={{ color: "#c0392b", fontSize: 13, fontWeight: 600, marginTop: 14 }}>{error}</p>
      )}

      {step < 3 ? (
        <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={next}>
          Continuar <ArrowRight size={18} />
        </button>
      ) : (
        <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={finish} disabled={pending}>
          {pending ? "Salvando..." : "Ir pro app"} <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}
