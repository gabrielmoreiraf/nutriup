import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/session";
import { billingEnabled } from "@/lib/premium";
import AssinarPlans from "@/components/assinar/AssinarPlans";

export const dynamic = "force-dynamic";

export default async function AssinarPage() {
  await requireUser();
  return (
    <div className="app-shell">
      <div className="app-screen">
        <div className="pad">
          <Link href="/inicio" className="back">
            <ArrowLeft size={18} />
          </Link>
          <div className="brand" style={{ marginTop: 18, fontSize: 20 }}>
            <span className="mark">
              <Sparkles size={20} />
            </span>
            NutriUp Premium
          </div>
          <h2 className="h-title" style={{ marginTop: 14 }}>
            Libere a IA do seu jeito
          </h2>
          <p className="sub">Gere planos e avalie seus dias com a inteligência do NutriUp.</p>

          <div style={{ marginTop: 8 }}>
            <AssinarPlans enabled={billingEnabled()} />
          </div>
        </div>
      </div>
    </div>
  );
}
