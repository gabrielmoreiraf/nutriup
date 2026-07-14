import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { getProfileWithName } from "@/lib/plans";
import PreferencesForm from "@/components/perfil/PreferencesForm";
import AssessmentUpload from "@/components/perfil/AssessmentUpload";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await requireOnboardedUser();
  const row = await getProfileWithName(user.id);
  const profile = row?.profile;

  return (
    <div className="pad" style={{ paddingTop: 12 }}>
      <Link href="/conta" className="back">
        <ArrowLeft size={18} />
      </Link>
      <h2 className="h-title" style={{ marginTop: 18 }}>
        Seu perfil nutricional
      </h2>
      <p className="sub">Quanto mais informação real, mais preciso o plano que a IA monta pra você.</p>

      <div className="sec-title">Preferências alimentares</div>
      <p className="sec-sub">Isso ajuda a IA a montar cardápios com o que você realmente come.</p>
      <PreferencesForm gosta={profile?.prefs?.gosta ?? []} evita={profile?.prefs?.evita ?? []} />

      <div className="sec-title">Avaliação física</div>
      <p className="sec-sub">
        Tem um laudo de bioimpedância ou dobras cutâneas? Anexe em PDF pra IA considerar.
      </p>
      <AssessmentUpload
        url={profile?.assessmentUrl ?? null}
        updatedAt={profile?.assessmentUpdatedAt ? profile.assessmentUpdatedAt.toISOString() : null}
      />
    </div>
  );
}
