import Link from "next/link";
import { redirect } from "next/navigation";
import { Salad, ArrowRight } from "lucide-react";
import InstallBanner from "@/components/pwa/InstallBanner";
import { getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Tela de boas-vindas (entrada do onboarding).
 * Fiel ao protótipo /reference/NutriUp.jsx (screen === "welcome").
 * Usuário já logado vai direto pro app (o gate do (app) cuida do onboarding).
 */
export default async function WelcomePage() {
  if (await getUserId()) redirect("/inicio");
  return (
    <div className="app-shell">
      <div className="app-screen">
        <div className="pad">
          <div className="center">
            <div className="brand" style={{ fontSize: 24 }}>
              <span className="mark" style={{ width: 44, height: 44, borderRadius: 15 }}>
                <Salad size={24} />
              </span>
              NutriUp
            </div>
            <h2 className="h-title" style={{ marginTop: 26 }}>
              Sua rotina, avaliada por IA.
            </h2>
            <p className="sub" style={{ fontSize: 15 }}>
              Conte o que comeu e treinou no seu dia. A IA diz se você está na meta — e você sobe no
              ranking junto com a galera.
            </p>
          </div>
          <Link href="/cadastro" className="btn btn-primary">
            Criar conta <ArrowRight size={18} />
          </Link>
          <Link href="/entrar" className="btn btn-ghost" style={{ marginTop: 12 }}>
            Já tenho conta
          </Link>
          <InstallBanner />
        </div>
      </div>
    </div>
  );
}
