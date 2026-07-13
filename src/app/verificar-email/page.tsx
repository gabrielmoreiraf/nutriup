import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { db, users, profiles } from "@/db";
import VerificarEmailForm from "@/components/auth/VerificarEmailForm";

export const dynamic = "force-dynamic";

export default async function VerificarEmailPage() {
  const user = await requireUser();

  const [row] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (row?.emailVerified) {
    const [profile] = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    redirect(profile ? "/inicio" : "/onboarding");
  }

  return (
    <div className="app-shell">
      <div className="app-screen">
        <VerificarEmailForm email={user.email ?? ""} />
      </div>
    </div>
  );
}
