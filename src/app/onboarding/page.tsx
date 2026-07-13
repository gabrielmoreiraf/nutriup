import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireVerifiedUser } from "@/lib/session";
import { db, profiles } from "@/db";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await requireVerifiedUser();
  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (profile) redirect("/inicio");

  return (
    <div className="app-shell">
      <div className="app-screen">
        <OnboardingWizard />
      </div>
    </div>
  );
}
