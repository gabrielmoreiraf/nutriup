import { redirect } from "next/navigation";
import { googleEnabled } from "@/auth";
import { getUserId } from "@/lib/session";
import EntrarForm from "@/components/auth/EntrarForm";

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ bloqueado?: string }>;
}) {
  if (await getUserId()) redirect("/inicio");
  const { bloqueado } = await searchParams;
  return (
    <div className="app-shell">
      <div className="app-screen">
        <EntrarForm googleEnabled={googleEnabled} blocked={bloqueado === "1"} />
      </div>
    </div>
  );
}
