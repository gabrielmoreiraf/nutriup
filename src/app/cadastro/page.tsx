import { redirect } from "next/navigation";
import { googleEnabled } from "@/auth";
import { getUserId } from "@/lib/session";
import CadastroForm from "@/components/auth/CadastroForm";

export default async function CadastroPage() {
  if (await getUserId()) redirect("/inicio");
  return (
    <div className="app-shell">
      <div className="app-screen">
        <CadastroForm googleEnabled={googleEnabled} />
      </div>
    </div>
  );
}
