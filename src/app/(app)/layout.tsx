import BottomNav from "@/components/BottomNav";
import { requireOnboardedUser } from "@/lib/session";

/**
 * Shell das telas do app (com menu inferior).
 * Exige usuário logado e com onboarding concluído.
 * As telas de onboarding ficam fora deste grupo e não têm menu.
 */
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireOnboardedUser();
  return (
    <div className="app-shell">
      <div className="app-screen has-nav">{children}</div>
      <BottomNav />
    </div>
  );
}
