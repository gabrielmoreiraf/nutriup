import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Termos e Privacidade — NutriUp" };

export default function TermosPage() {
  return (
    <div className="app-shell">
      <div className="app-screen">
        <div className="pad">
          <Link href="/cadastro" className="back">
            <ArrowLeft size={18} />
          </Link>
          <h2 className="h-title" style={{ marginTop: 18 }}>
            Termos e Privacidade
          </h2>
          <div className="ai-body" style={{ padding: 0, marginTop: 12 }}>
            <p style={{ marginBottom: 12 }}>
              O NutriUp é uma ferramenta de <b>bem-estar orientativa</b>. Ele{" "}
              <b>não substitui</b> a avaliação de um nutricionista ou médico e não faz diagnóstico
              nem prescrição.
            </p>
            <p style={{ marginBottom: 12 }}>
              <b>Seus dados de saúde</b> (como medicação) são usados apenas para personalizar a
              avaliação da IA. Eles <b>nunca</b> aparecem no ranking, no mural ou em áreas públicas.
            </p>
            <p style={{ marginBottom: 12 }}>
              Em conformidade com a <b>LGPD</b>, você pode solicitar a exclusão da sua conta e de
              todos os seus dados a qualquer momento nas configurações do app.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 12.5 }}>
              Versão preliminar — o texto legal completo será publicado antes do lançamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
