import React, { useState } from "react";
import {
  Home, Sparkles, Trophy, Newspaper, Flame, Dumbbell, Target,
  ChevronRight, Check, Heart, MessageCircle, Plus, Scale, Ruler,
  User, Download, ArrowRight, TrendingUp, Medal, Pill, Salad,
  Calendar, ArrowLeft, Share2, Zap, Utensils, Coffee, Moon, RefreshCw, ChefHat, Apple
} from "lucide-react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.nu-root{
  --green:#16B26B; --green-d:#0E9F5B; --blue:#2E90FA; --blue-d:#1570EF;
  --ink:#07312A; --muted:#5E7A73; --mint:#ECFAF2; --mint2:#D6F2E3;
  --sky:#E8F1FF; --line:#E4F0EA; --white:#fff;
  --grad:linear-gradient(135deg,#1570EF 0%,#16B26B 100%);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  color:var(--ink);
  min-height:100vh;
  background:radial-gradient(1200px 600px at 80% -10%,#e9f6ff 0%,transparent 55%),
             radial-gradient(1000px 600px at 0% 110%,#e6faef 0%,transparent 55%),
             #f4f8f7;
  padding:28px 16px 60px;
  box-sizing:border-box;
}
.nu-root *{box-sizing:border-box;}

.nu-head{max-width:900px;margin:0 auto 22px;text-align:center;}
.nu-head h1{font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:-.02em;}
.nu-head p{margin:0;color:var(--muted);font-size:14px;}

.nu-chips{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;max-width:760px;margin:14px auto 0;}
.nu-chip{border:1px solid var(--line);background:#fff;color:var(--muted);font-size:12px;font-weight:600;
  padding:7px 12px;border-radius:999px;cursor:pointer;transition:.15s;font-family:inherit;}
.nu-chip:hover{border-color:var(--green);color:var(--green-d);}
.nu-chip.on{background:var(--grad);color:#fff;border-color:transparent;box-shadow:0 6px 16px rgba(21,112,239,.25);}

/* phone */
.nu-stage{display:flex;justify-content:center;margin-top:26px;}
.nu-phone{width:392px;max-width:100%;height:812px;background:#fff;border-radius:44px;
  box-shadow:0 40px 80px -30px rgba(8,49,42,.45),0 0 0 11px #0d1f1c,0 0 0 13px #22332f;
  position:relative;overflow:hidden;display:flex;flex-direction:column;}
.nu-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:150px;height:30px;
  background:#0d1f1c;border-radius:0 0 18px 18px;z-index:40;}
.nu-status{height:46px;flex:none;display:flex;align-items:flex-end;justify-content:space-between;
  padding:0 26px 6px;font-size:13px;font-weight:700;color:var(--ink);z-index:20;}
.nu-screen{flex:1;overflow-y:auto;position:relative;}
.nu-screen::-webkit-scrollbar{width:0;}

/* generic */
.pad{padding:8px 20px 26px;}
.brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:19px;letter-spacing:-.02em;}
.brand .mark{width:34px;height:34px;border-radius:11px;background:var(--grad);display:flex;
  align-items:center;justify-content:center;color:#fff;box-shadow:0 8px 18px rgba(21,178,107,.35);}
.h-title{font-size:25px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin:0;}
.sub{color:var(--muted);font-size:14px;line-height:1.5;margin:8px 0 0;}
.btn{width:100%;border:none;border-radius:16px;padding:16px;font-size:15.5px;font-weight:700;
  cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:.15s;}
.btn-primary{background:var(--grad);color:#fff;box-shadow:0 14px 26px -8px rgba(21,112,239,.5);}
.btn-primary:active{transform:translateY(1px);}
.btn-ghost{background:#fff;color:var(--ink);border:1.5px solid var(--line);}
.field{margin-top:14px;}
.field label{display:block;font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:7px;}
.inp{width:100%;border:1.5px solid var(--line);background:#fff;border-radius:14px;padding:14px 15px;
  font-size:15px;font-family:inherit;color:var(--ink);outline:none;transition:.15s;}
.inp:focus{border-color:var(--green);box-shadow:0 0 0 4px var(--mint);}
.inp::placeholder{color:#9fb3ad;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

.steps{display:flex;gap:6px;margin:2px 0 18px;}
.steps i{height:5px;flex:1;border-radius:99px;background:var(--mint2);}
.steps i.on{background:var(--grad);}

.opt{display:flex;align-items:center;gap:13px;border:1.5px solid var(--line);border-radius:16px;
  padding:15px;cursor:pointer;background:#fff;margin-top:11px;transition:.15s;text-align:left;width:100%;font-family:inherit;}
.opt:hover{border-color:var(--green);}
.opt.sel{border-color:var(--green);background:var(--mint);box-shadow:0 0 0 3px var(--mint);}
.opt .ic{width:44px;height:44px;border-radius:12px;background:var(--mint);color:var(--green-d);
  display:flex;align-items:center;justify-content:center;flex:none;}
.opt.sel .ic{background:var(--green);color:#fff;}
.opt b{font-size:15px;font-weight:700;display:block;}
.opt span{font-size:12.5px;color:var(--muted);}
.opt .chk{margin-left:auto;color:var(--green);}

.pill-row{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px;}
.pill{border:1.5px solid var(--line);background:#fff;border-radius:12px;padding:11px 15px;
  font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;color:var(--ink);transition:.15s;}
.pill.sel{background:var(--green);color:#fff;border-color:var(--green);}

.install{margin-top:18px;border:1.5px dashed var(--blue);background:var(--sky);border-radius:16px;
  padding:14px 15px;display:flex;gap:12px;align-items:center;}
.install .ic{width:40px;height:40px;border-radius:11px;background:var(--blue);color:#fff;
  display:flex;align-items:center;justify-content:center;flex:none;}
.install b{font-size:13.5px;font-weight:700;display:block;}
.install span{font-size:12px;color:var(--muted);}

/* app header */
.app-top{padding:6px 20px 4px;display:flex;align-items:center;justify-content:space-between;}
.hi{font-size:13px;color:var(--muted);font-weight:600;}
.hi b{display:block;font-size:20px;color:var(--ink);font-weight:800;letter-spacing:-.02em;}
.ava{width:44px;height:44px;border-radius:14px;background:var(--grad);color:#fff;font-weight:800;
  display:flex;align-items:center;justify-content:center;font-size:16px;}
.streak{display:inline-flex;align-items:center;gap:6px;background:#FFF3E6;color:#E67514;
  font-weight:800;font-size:13px;padding:6px 11px;border-radius:999px;}

.card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px;margin-top:14px;
  box-shadow:0 12px 24px -20px rgba(8,49,42,.3);}
.card-grad{background:var(--grad);color:#fff;border:none;}
.metric{display:flex;align-items:center;gap:14px;}
.ring{width:82px;height:82px;flex:none;position:relative;}
.ring svg{transform:rotate(-90deg);}
.ring .num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.ring .num b{font-size:20px;font-weight:800;line-height:1;}
.ring .num span{font-size:10px;opacity:.85;}
.mini{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;}
.mini div{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px;text-align:center;}
.mini b{font-size:17px;font-weight:800;display:block;}
.mini span{font-size:11px;color:var(--muted);}

.sec-title{font-size:16px;font-weight:800;margin:22px 0 2px;letter-spacing:-.01em;}
.sec-sub{font-size:12.5px;color:var(--muted);margin:2px 0 0;}

/* AI */
.ta{width:100%;min-height:120px;border:1.5px solid var(--line);border-radius:18px;padding:15px;
  font-size:15px;font-family:inherit;resize:none;outline:none;line-height:1.5;color:var(--ink);}
.ta:focus{border-color:var(--green);box-shadow:0 0 0 4px var(--mint);}
.ai-result{border:1px solid var(--line);border-radius:20px;overflow:hidden;margin-top:16px;background:#fff;}
.ai-head{background:var(--mint);padding:15px 18px;display:flex;align-items:center;gap:11px;}
.ai-badge{background:var(--green);color:#fff;font-size:12px;font-weight:800;padding:6px 12px;border-radius:999px;
  display:inline-flex;align-items:center;gap:6px;}
.ai-body{padding:16px 18px;font-size:14px;line-height:1.55;color:#2c4d46;}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
.tag{background:var(--mint);color:var(--green-d);font-size:12px;font-weight:700;padding:6px 11px;border-radius:9px;}
.tag.blue{background:var(--sky);color:var(--blue-d);}
.earn{display:flex;align-items:center;justify-content:space-between;margin-top:16px;
  background:var(--grad);color:#fff;border-radius:16px;padding:14px 18px;}
.earn b{font-size:18px;font-weight:800;}

/* ranking */
.tabs{display:flex;background:var(--mint);border-radius:14px;padding:4px;margin-top:6px;}
.tabs button{flex:1;border:none;background:transparent;font-family:inherit;font-weight:700;font-size:13px;
  padding:9px;border-radius:11px;cursor:pointer;color:var(--muted);}
.tabs button.on{background:#fff;color:var(--ink);box-shadow:0 4px 10px -4px rgba(8,49,42,.2);}
.rank{display:flex;align-items:center;gap:13px;padding:13px 14px;border:1px solid var(--line);
  border-radius:16px;margin-top:10px;background:#fff;}
.rank.me{border-color:var(--green);background:var(--mint);box-shadow:0 0 0 3px var(--mint);}
.rank .pos{width:26px;font-weight:800;font-size:15px;text-align:center;color:var(--muted);}
.rank .rava{width:42px;height:42px;border-radius:13px;color:#fff;font-weight:800;display:flex;
  align-items:center;justify-content:center;font-size:15px;flex:none;}
.rank .nm{font-weight:700;font-size:14.5px;}
.rank .st{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:4px;}
.rank .pts{margin-left:auto;font-weight:800;font-size:15px;color:var(--green-d);}
.podium{display:flex;gap:9px;margin-top:14px;}

/* mural */
.post{border:1px solid var(--line);border-radius:20px;overflow:hidden;margin-top:14px;background:#fff;}
.post-h{display:flex;align-items:center;gap:11px;padding:13px 15px;}
.post-h .rava{width:40px;height:40px;border-radius:12px;color:#fff;font-weight:800;display:flex;
  align-items:center;justify-content:center;font-size:14px;flex:none;}
.post-h b{font-size:14px;font-weight:700;}
.post-h span{font-size:11.5px;color:var(--muted);}
.post-img{height:180px;display:flex;align-items:center;justify-content:center;font-size:52px;}
.post-cap{padding:13px 15px;font-size:14px;line-height:1.5;}
.post-act{display:flex;gap:20px;padding:0 15px 14px;color:var(--muted);font-size:13px;font-weight:600;}
.post-act span{display:flex;align-items:center;gap:6px;}
.aitag{display:inline-flex;align-items:center;gap:5px;background:var(--mint);color:var(--green-d);
  font-size:11px;font-weight:800;padding:4px 9px;border-radius:8px;margin:0 15px 12px;}

/* bottom nav */
.nav{flex:none;height:74px;background:#fff;border-top:1px solid var(--line);display:flex;
  align-items:center;justify-content:space-around;padding:0 8px 12px;position:relative;}
.nav button{border:none;background:none;font-family:inherit;display:flex;flex-direction:column;
  align-items:center;gap:3px;font-size:10.5px;font-weight:700;color:#a7bcb5;cursor:pointer;flex:1;}
.nav button.on{color:var(--green-d);}
.nav .fab{width:58px;height:58px;border-radius:20px;background:var(--grad);color:#fff;margin-top:-26px;
  display:flex;align-items:center;justify-content:center;box-shadow:0 14px 24px -8px rgba(21,112,239,.55);}
.center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:40px 30px;}
.back{width:38px;height:38px;border-radius:12px;border:1.5px solid var(--line);background:#fff;
  display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink);}
`;

const avatarColor = (s) => {
  const g = [["#1570EF", "#16B26B"], ["#F79009", "#EF6820"], ["#7A5AF8", "#2E90FA"],
  ["#EC4A82", "#F79009"], ["#12B76A", "#0BA5A5"], ["#6172F3", "#7A5AF8"]];
  let h = 0; for (const c of s) h += c.charCodeAt(0);
  const [a, b] = g[h % g.length];
  return `linear-gradient(135deg,${a},${b})`;
};

function Ring({ pct, label, sub, light }) {
  const r = 34, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  return (
    <div className="ring">
      <svg width="82" height="82">
        <circle cx="41" cy="41" r={r} fill="none" strokeWidth="8"
          stroke={light ? "rgba(255,255,255,.25)" : "#E4F0EA"} />
        <circle cx="41" cy="41" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
          stroke={light ? "#fff" : "url(#g1)"} strokeDasharray={c} strokeDashoffset={off} />
        <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1570EF" /><stop offset="1" stopColor="#16B26B" />
        </linearGradient></defs>
      </svg>
      <div className="num" style={{ color: light ? "#fff" : "var(--ink)" }}>
        <b>{label}</b><span>{sub}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [tab, setTab] = useState("amigos");
  const [goal, setGoal] = useState("massa");
  const [treat, setTreat] = useState(false);
  const [medWeight, setMedWeight] = useState(true);
  const [med, setMed] = useState("Mounjaro");
  const [freq, setFreq] = useState("3-4x");
  const [sex, setSex] = useState("M");
  const [aiText, setAiText] = useState("Comi uma lasanha fit no almoço e treinei perna pesado 💪");
  const [aiDone, setAiDone] = useState(true);

  const flow = [
    ["welcome", "Boas-vindas"], ["signup", "Cadastro"], ["basics", "Dados"],
    ["goal", "Meta"], ["health", "Saúde"], ["training", "Treino"],
  ];
  const app = [
    ["home", "Início"], ["plano", "Plano"], ["ai", "Diário IA"], ["ranking", "Ranking"], ["mural", "Mural"],
  ];

  const meals = [
    ["Café da manhã", "07:00", "520", <Coffee size={20} />, ["3 ovos mexidos", "Aveia (40g) com banana", "Café sem açúcar"]],
    ["Lanche da manhã", "10:00", "250", <Apple size={20} />, ["Iogurte natural", "1 scoop de whey", "Punhado de granola"]],
    ["Almoço", "13:00", "700", <Utensils size={20} />, ["Frango grelhado (150g)", "Arroz integral + feijão", "Brócolis e salada"]],
    ["Lanche da tarde", "16:30", "300", <ChefHat size={20} />, ["Pão integral", "Pasta de amendoim", "1 fruta"]],
    ["Jantar", "20:00", "550", <Salad size={20} />, ["Patinho moído (150g)", "Batata-doce", "Legumes no vapor"]],
    ["Ceia", "22:30", "200", <Moon size={20} />, ["Queijo cottage", "Castanhas (30g)"]],
  ];

  const goApp = screen === "home" || screen === "plano" || screen === "ai" || screen === "ranking" || screen === "mural";

  return (
    <div className="nu-root">
      <style>{css}</style>
      <div className="nu-head">
        <h1>NutriUp — protótipo de telas</h1>
        <p>Clique nos botões pra navegar, ou pule direto pra qualquer tela abaixo.</p>
        <div className="nu-chips">
          {flow.map(([k, l]) => (
            <button key={k} className={"nu-chip" + (screen === k ? " on" : "")} onClick={() => setScreen(k)}>{l}</button>
          ))}
          <span style={{ width: 1, background: "#d6e6df", margin: "0 3px" }} />
          {app.map(([k, l]) => (
            <button key={k} className={"nu-chip" + (screen === k ? " on" : "")} onClick={() => setScreen(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="nu-stage">
        <div className="nu-phone">
          <div className="nu-notch" />
          <div className="nu-status">
            <span>9:41</span>
            <span style={{ display: "flex", gap: 5 }}>
              <Zap size={14} fill="currentColor" /><span>100%</span>
            </span>
          </div>
          <div className="nu-screen">

            {/* WELCOME */}
            {screen === "welcome" && (
              <div className="pad">
                <div className="center">
                  <div className="brand" style={{ fontSize: 24 }}>
                    <span className="mark" style={{ width: 44, height: 44, borderRadius: 15 }}><Salad size={24} /></span>
                    NutriUp
                  </div>
                  <h2 className="h-title" style={{ marginTop: 26 }}>Sua rotina, avaliada por IA.</h2>
                  <p className="sub" style={{ fontSize: 15 }}>
                    Conte o que comeu e treinou no seu dia. A IA diz se você está na meta —
                    e você sobe no ranking junto com a galera.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => setScreen("signup")}>
                  Criar conta <ArrowRight size={18} />
                </button>
                <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => setScreen("home")}>
                  Já tenho conta
                </button>
                <div className="install">
                  <div className="ic"><Download size={20} /></div>
                  <div>
                    <b>Adicionar à tela inicial</b>
                    <span>Instale como app no iPhone ou Android — sem baixar da loja.</span>
                  </div>
                </div>
              </div>
            )}

            {/* SIGNUP */}
            {screen === "signup" && (
              <div className="pad">
                <div className="back" onClick={() => setScreen("welcome")}><ArrowLeft size={18} /></div>
                <h2 className="h-title" style={{ marginTop: 18 }}>Criar sua conta</h2>
                <p className="sub">Leva menos de um minuto.</p>
                <div className="field"><label>Nome</label><input className="inp" placeholder="Como quer ser chamado?" defaultValue="Léo" /></div>
                <div className="field"><label>E-mail</label><input className="inp" placeholder="voce@email.com" /></div>
                <div className="field"><label>Senha</label><input className="inp" type="password" placeholder="••••••••" /></div>
                <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => setScreen("basics")}>
                  Continuar <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* BASICS */}
            {screen === "basics" && (
              <div className="pad">
                <div className="back" onClick={() => setScreen("signup")}><ArrowLeft size={18} /></div>
                <div className="steps" style={{ marginTop: 18 }}><i className="on" /><i /><i /><i /></div>
                <h2 className="h-title">Seus dados</h2>
                <p className="sub">Pra calcular sua meta certinha.</p>
                <div className="row2" style={{ marginTop: 16 }}>
                  <div className="field" style={{ marginTop: 0 }}><label>Peso (kg)</label><input className="inp" defaultValue="78" /></div>
                  <div className="field" style={{ marginTop: 0 }}><label>Altura (cm)</label><input className="inp" defaultValue="176" /></div>
                </div>
                <div className="field"><label>Idade</label><input className="inp" defaultValue="27" /></div>
                <div className="field"><label>Sexo</label>
                  <div className="pill-row">
                    {["M", "F", "Outro"].map(o => (
                      <button key={o} className={"pill" + (sex === o ? " sel" : "")} onClick={() => setSex(o)}>{o === "M" ? "Masculino" : o === "F" ? "Feminino" : "Outro"}</button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => setScreen("goal")}>Continuar <ArrowRight size={18} /></button>
              </div>
            )}

            {/* GOAL */}
            {screen === "goal" && (
              <div className="pad">
                <div className="back" onClick={() => setScreen("basics")}><ArrowLeft size={18} /></div>
                <div className="steps" style={{ marginTop: 18 }}><i className="on" /><i className="on" /><i /><i /></div>
                <h2 className="h-title">Qual é a sua meta?</h2>
                <p className="sub">Isso guia como a IA vai te avaliar.</p>
                {[
                  ["perder", "Perder peso", "Déficit calórico saudável", <TrendingUp size={22} style={{ transform: "rotate(180deg)" }} />],
                  ["manter", "Manter peso", "Equilíbrio e boa forma", <Target size={22} />],
                  ["massa", "Ganhar massa", "Superávit com foco em proteína", <Dumbbell size={22} />],
                ].map(([k, t, s, ic]) => (
                  <button key={k} className={"opt" + (goal === k ? " sel" : "")} onClick={() => setGoal(k)}>
                    <span className="ic">{ic}</span>
                    <span><b>{t}</b><span>{s}</span></span>
                    {goal === k && <span className="chk"><Check size={20} /></span>}
                  </button>
                ))}
                <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => setScreen("health")}>Continuar <ArrowRight size={18} /></button>
              </div>
            )}

            {/* HEALTH */}
            {screen === "health" && (
              <div className="pad">
                <div className="back" onClick={() => setScreen("goal")}><ArrowLeft size={18} /></div>
                <div className="steps" style={{ marginTop: 18 }}><i className="on" /><i className="on" /><i className="on" /><i /></div>
                <h2 className="h-title">Saúde</h2>
                <p className="sub">A IA usa isso pra avaliar seu dia com precisão. Fica só pra você.</p>

                <div className="field"><label>Usa alguma medicação para emagrecer ou controle de peso?</label>
                  <div className="pill-row">
                    <button className={"pill" + (medWeight ? " sel" : "")} onClick={() => setMedWeight(true)}>Sim</button>
                    <button className={"pill" + (!medWeight ? " sel" : "")} onClick={() => setMedWeight(false)}>Não</button>
                  </div>
                </div>

                {medWeight && (
                  <>
                    <div className="field"><label>Qual?</label>
                      <div className="pill-row">
                        {["Mounjaro", "Ozempic", "Wegovy", "Saxenda", "Outro"].map(o => (
                          <button key={o} className={"pill" + (med === o ? " sel" : "")} onClick={() => setMed(o)}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div className="field"><label>Dose e frequência (opcional)</label>
                      <input className="inp" placeholder="Ex: 2,5 mg — 1x por semana" />
                    </div>
                  </>
                )}

                <div className="field"><label>Faz outro tratamento de saúde?</label>
                  <div className="pill-row">
                    <button className={"pill" + (treat ? " sel" : "")} onClick={() => setTreat(true)}>Sim</button>
                    <button className={"pill" + (!treat ? " sel" : "")} onClick={() => setTreat(false)}>Não</button>
                  </div>
                </div>
                {treat && (
                  <div className="field"><label>Quais medicamentos? (opcional)</label>
                    <input className="inp" placeholder="Ex: Losartana, Metformina..." />
                  </div>
                )}

                <div className="install" style={{ borderStyle: "solid", borderColor: "var(--line)", background: "var(--mint)" }}>
                  <div className="ic" style={{ background: "var(--green)" }}><Pill size={20} /></div>
                  <div><b>Por que perguntamos</b><span>Remédios como o Mounjaro reduzem o apetite — a IA considera isso ao avaliar seu dia. Nunca aparece no ranking ou mural.</span></div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => setScreen("training")}>Continuar <ArrowRight size={18} /></button>
              </div>
            )}

            {/* TRAINING */}
            {screen === "training" && (
              <div className="pad">
                <div className="back" onClick={() => setScreen("health")}><ArrowLeft size={18} /></div>
                <div className="steps" style={{ marginTop: 18 }}><i className="on" /><i className="on" /><i className="on" /><i className="on" /></div>
                <h2 className="h-title">Seu treino</h2>
                <p className="sub">Com que frequência você treina?</p>
                <div className="pill-row" style={{ marginTop: 16 }}>
                  {["Não treino", "1-2x", "3-4x", "5x+"].map(o => (
                    <button key={o} className={"pill" + (freq === o ? " sel" : "")} onClick={() => setFreq(o)}>{o}{o !== "Não treino" ? "/sem" : ""}</button>
                  ))}
                </div>
                <div className="field"><label>Tipo de treino</label>
                  <div className="pill-row">
                    {["Musculação", "Corrida", "Crossfit", "Funcional", "Outro"].map(o => (
                      <button key={o} className="pill">{o}</button>
                    ))}
                  </div>
                </div>
                <div className="card card-grad" style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Sparkles size={28} />
                    <div><b style={{ fontSize: 16 }}>Tudo pronto!</b>
                      <div style={{ fontSize: 13, opacity: .9 }}>Sua meta e perfil foram configurados.</div></div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => setScreen("home")}>Ir pro app <ArrowRight size={18} /></button>
              </div>
            )}

            {/* HOME */}
            {screen === "home" && (
              <div style={{ paddingBottom: 20 }}>
                <div className="app-top">
                  <div className="hi">Bom dia,<b>Léo 👋</b></div>
                  <div className="streak"><Flame size={15} fill="currentColor" /> 7 dias</div>
                </div>
                <div className="pad" style={{ paddingTop: 4 }}>
                  <div className="card card-grad">
                    <div className="metric">
                      <Ring pct={72} label="72%" sub="da meta" light />
                      <div>
                        <div style={{ fontSize: 13, opacity: .9, fontWeight: 600 }}>Meta de hoje</div>
                        <div style={{ fontSize: 19, fontWeight: 800, margin: "2px 0 6px" }}>Ganho de massa</div>
                        <div style={{ fontSize: 13, opacity: .92 }}>Faltam ~620 kcal e 40g de proteína.</div>
                      </div>
                    </div>
                  </div>
                  <div className="mini">
                    <div><b>1.480</b><span>kcal</span></div>
                    <div><b>112g</b><span>proteína</span></div>
                    <div><b>2,1L</b><span>água</span></div>
                  </div>

                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }} onClick={() => setScreen("plano")}>
                    <div className="ic" style={{ width: 46, height: 46, borderRadius: 14, background: "var(--mint)", color: "var(--green-d)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Utensils size={22} /></div>
                    <div><b style={{ fontSize: 15 }}>Ver meu plano de hoje</b>
                      <div style={{ fontSize: 12.5, color: "var(--muted)" }}>6 refeições · 2.520 kcal</div></div>
                    <ChevronRight size={20} style={{ marginLeft: "auto", color: "var(--muted)" }} />
                  </div>

                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }} onClick={() => setScreen("ai")}>
                    <div className="ic" style={{ width: 46, height: 46, borderRadius: 14, background: "var(--grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Sparkles size={22} /></div>
                    <div><b style={{ fontSize: 15 }}>Registrar meu dia</b>
                      <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Escreva e deixe a IA avaliar</div></div>
                    <ChevronRight size={20} style={{ marginLeft: "auto", color: "var(--muted)" }} />
                  </div>

                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }} onClick={() => setScreen("ranking")}>
                    <div className="rava" style={{ background: "#FFF3E6", color: "#E67514", width: 46, height: 46, borderRadius: 14 }}><Trophy size={22} /></div>
                    <div><b style={{ fontSize: 15 }}>Você está em 2º</b>
                      <div style={{ fontSize: 12.5, color: "var(--muted)" }}>60 pts pro 1º lugar da semana</div></div>
                    <ChevronRight size={20} style={{ marginLeft: "auto", color: "var(--muted)" }} />
                  </div>
                </div>
              </div>
            )}

            {/* AI */}
            {screen === "ai" && (
              <div className="pad" style={{ paddingTop: 12 }}>
                <h2 className="h-title">Diário do dia</h2>
                <p className="sub">Escreva como quiser. A IA entende linguagem natural.</p>
                <textarea className="ta" style={{ marginTop: 14 }} value={aiText} onChange={e => setAiText(e.target.value)} />
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setAiDone(true)}>
                  <Sparkles size={18} /> Avaliar com IA
                </button>

                {aiDone && (
                  <div className="ai-result">
                    <div className="ai-head">
                      <span className="ai-badge"><Check size={14} /> No caminho certo</span>
                      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>alinhado à meta de massa</span>
                    </div>
                    <div className="ai-body">
                      Boa escolha! A lasanha fit encaixa bem no seu superávit e o treino de perna
                      soma bastante volume. Pra fechar o dia, inclua uma fonte de vegetais no jantar
                      e ~30g de proteína antes de dormir.
                      <div className="tags">
                        <span className="tag">≈ 680 kcal</span>
                        <span className="tag">42g proteína</span>
                        <span className="tag blue">treino intenso ✓</span>
                      </div>
                      <div className="earn">
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}><Zap size={18} fill="#fff" /> Pontos ganhos</span>
                        <b>+18 pts</b>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RANKING */}
            {screen === "ranking" && (
              <div className="pad" style={{ paddingTop: 12 }}>
                <h2 className="h-title">Ranking</h2>
                <p className="sub">Consistência vale ponto. Bora subir essa semana.</p>
                <div className="tabs">
                  <button className={tab === "amigos" ? "on" : ""} onClick={() => setTab("amigos")}>Amigos</button>
                  <button className={tab === "global" ? "on" : ""} onClick={() => setTab("global")}>Global</button>
                </div>
                {[
                  ["1", "Marina S.", "streak 12 dias", "1.240", false],
                  ["2", "Você (Léo)", "streak 7 dias", "1.180", true],
                  ["3", "Rafa T.", "streak 9 dias", "1.095", false],
                  ["4", "Bia M.", "streak 5 dias", "980", false],
                  ["5", "Diego P.", "streak 4 dias", "910", false],
                  ["6", "Cau S.", "streak 6 dias", "845", false],
                ].map(([p, n, s, pts, me]) => (
                  <div key={p} className={"rank" + (me ? " me" : "")}>
                    <div className="pos">{p <= "3" ? ["🥇", "🥈", "🥉"][p - 1] : p}</div>
                    <div className="rava" style={{ background: avatarColor(n) }}>{n[0]}</div>
                    <div>
                      <div className="nm">{n}</div>
                      <div className="st"><Flame size={12} /> {s}</div>
                    </div>
                    <div className="pts">{pts}</div>
                  </div>
                ))}
              </div>
            )}

            {/* MURAL */}
            {screen === "mural" && (
              <div style={{ paddingBottom: 20 }}>
                <div className="app-top" style={{ paddingTop: 14 }}>
                  <h2 className="h-title" style={{ fontSize: 22 }}>Mural</h2>
                  <button className="btn btn-primary" style={{ width: "auto", padding: "10px 16px", fontSize: 13.5 }}>
                    <Plus size={16} /> Publicar
                  </button>
                </div>
                <div style={{ padding: "0 20px 10px" }}>
                  {[
                    ["Marina S.", "há 20 min", "#DFF6E7", "🥗", "Bowl de frango, arroz integral e brócolis. Bateu a meta de proteína! 💪", "24", "5", true],
                    ["Diego P.", "há 1h", "#E4EEFF", "🏋️", "Treino de perna concluído. Perna tremendo mas valeu 🔥", "18", "3", false],
                    ["Bia M.", "há 2h", "#FFF0E0", "🍳", "Café da manhã: ovos mexidos + aveia + banana.", "31", "8", true],
                  ].map(([n, t, bg, emoji, cap, likes, com, ai], i) => (
                    <div key={i} className="post">
                      <div className="post-h">
                        <div className="rava" style={{ background: avatarColor(n) }}>{n[0]}</div>
                        <div><b>{n}</b><div><span>{t}</span></div></div>
                      </div>
                      <div className="post-img" style={{ background: bg }}>{emoji}</div>
                      {ai && <div className="aitag"><Sparkles size={12} /> IA: alinhado com a meta</div>}
                      <div className="post-cap">{cap}</div>
                      <div className="post-act">
                        <span><Heart size={16} /> {likes}</span>
                        <span><MessageCircle size={16} /> {com}</span>
                        <span style={{ marginLeft: "auto" }}><Share2 size={16} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PLANO */}
            {screen === "plano" && (
              <div className="pad" style={{ paddingTop: 12 }}>
                <h2 className="h-title">Seu plano de hoje</h2>
                <p className="sub">Gerado pela IA a partir do seu perfil e da sua meta.</p>

                <div className="card card-grad">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, opacity: .9, fontWeight: 600 }}>Meta do dia · Ganho de massa</div>
                      <div style={{ fontSize: 27, fontWeight: 800, marginTop: 2 }}>2.520 kcal</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 23, fontWeight: 800 }}>185g</div>
                      <div style={{ fontSize: 12, opacity: .9 }}>proteína</div>
                    </div>
                  </div>
                </div>

                <div className="install" style={{ borderStyle: "solid", borderColor: "var(--line)", background: "var(--mint)", marginTop: 14 }}>
                  <div className="ic" style={{ background: "var(--green)" }}><Sparkles size={20} /></div>
                  <div><b>Adaptado pra você</b><span>Porções e horários ajustados ao seu treino (3-4x/sem) e ao seu apetite.</span></div>
                </div>

                {meals.map(([name, time, kcal, icon, items], i) => (
                  <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 15px", borderBottom: "1px solid var(--line)" }}>
                      <div className="ic" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--mint)", color: "var(--green-d)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{icon}</div>
                      <div style={{ flex: 1 }}>
                        <b style={{ fontSize: 14.5 }}>{name}</b>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{time} · ~{kcal} kcal</div>
                      </div>
                      <button style={{ padding: "7px 12px", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: "var(--ink)", background: "#fff", fontFamily: "inherit", cursor: "pointer" }}>Trocar</button>
                    </div>
                    <div style={{ padding: "12px 15px", fontSize: 13.5, lineHeight: 1.75, color: "#2c4d46" }}>
                      {items.map((it, j) => (<div key={j}>• {it}</div>))}
                    </div>
                  </div>
                ))}

                <button className="btn btn-ghost" style={{ marginTop: 16 }}><RefreshCw size={18} /> Gerar novo plano</button>

                <p style={{ fontSize: 11.5, color: "var(--muted)", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
                  Sugestão automática de bem-estar. Não substitui a orientação de um nutricionista ou médico.
                </p>
              </div>
            )}

          </div>

          {/* BOTTOM NAV — only on app screens */}
          {goApp && (
            <div className="nav">
              <button className={screen === "home" ? "on" : ""} onClick={() => setScreen("home")}><Home size={22} /> Início</button>
              <button className={screen === "plano" ? "on" : ""} onClick={() => setScreen("plano")}><Utensils size={22} /> Plano</button>
              <button onClick={() => setScreen("ai")}><span className="fab"><Sparkles size={26} /></span></button>
              <button className={screen === "ranking" ? "on" : ""} onClick={() => setScreen("ranking")}><Trophy size={22} /> Ranking</button>
              <button className={screen === "mural" ? "on" : ""} onClick={() => setScreen("mural")}><Newspaper size={22} /> Mural</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
