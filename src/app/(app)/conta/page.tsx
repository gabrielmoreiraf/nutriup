import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, ShieldCheck, Crown, FileText, ChevronRight } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { db, users } from "@/db";
import { getProfileWithName } from "@/lib/plans";
import { billingEnabled } from "@/lib/premium";
import { GOAL_LABEL } from "@/lib/labels";
import { avatarColor } from "@/lib/avatar";
import ContaActions from "@/components/conta/ContaActions";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const user = await requireOnboardedUser();
  const [u] = await db
    .select({ email: users.email, isPremium: users.isPremium, planType: users.planType })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const row = await getProfileWithName(user.id);
  const name = row?.name ?? "você";
  const goalLabel = GOAL_LABEL[row?.profile.goal ?? "manter"] ?? "—";
  const premium = billingEnabled() ? !!u?.isPremium : true;

  return (
    <div className="pad" style={{ paddingTop: 12 }}>
      <Link href="/inicio" className="back">
        <ArrowLeft size={18} />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
        <div className="ava" style={{ background: avatarColor(name), width: 56, height: 56, fontSize: 22 }}>
          {name[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800 }}>{name}</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>{u?.email}</div>
        </div>
      </div>

      <div className="mini" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 18 }}>
        <div>
          <b style={{ fontSize: 14 }}>{goalLabel}</b>
          <span>meta</span>
        </div>
        <div>
          <b style={{ fontSize: 14 }}>{premium ? "Premium" : "Grátis"}</b>
          <span>plano</span>
        </div>
      </div>

      {!premium && (
        <Link href="/assinar" className="card" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
          <div className="ic" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--grad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <Crown size={20} />
          </div>
          <div>
            <b style={{ fontSize: 15 }}>Virar Premium</b>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Libere plano e diário por IA</div>
          </div>
          <ChevronRight size={20} style={{ marginLeft: "auto", color: "var(--muted)" }} />
        </Link>
      )}

      <div className="install" style={{ borderStyle: "solid", borderColor: "var(--line)", background: "var(--mint)" }}>
        <div className="ic" style={{ background: "var(--green)" }}>
          <ShieldCheck size={20} />
        </div>
        <div>
          <b>Seus dados de saúde são privados</b>
          <span>Medicação e condições ficam só pra IA personalizar seu dia. Nunca aparecem no ranking ou no mural.</span>
        </div>
      </div>

      <Link href="/termos" className="card" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
        <div className="ic" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--mint)", color: "var(--green-d)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <FileText size={20} />
        </div>
        <div>
          <b style={{ fontSize: 15 }}>Termos e Privacidade</b>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Como tratamos seus dados (LGPD)</div>
        </div>
        <ChevronRight size={20} style={{ marginLeft: "auto", color: "var(--muted)" }} />
      </Link>

      <ContaActions />

      <p className="disclaimer">
        O NutriUp é orientativo e não substitui a avaliação de um nutricionista ou médico.
      </p>
    </div>
  );
}
