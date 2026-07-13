import { redirect } from "next/navigation";
import { googleEnabled } from "@/auth";
import { getUserId } from "@/lib/session";
import EntrarForm from "@/components/auth/EntrarForm";

export default async function EntrarPage() {
  if (await getUserId()) redirect("/inicio");
  return (
    <div className="app-shell">
      <div className="app-screen">
        <EntrarForm googleEnabled={googleEnabled} />
      </div>
    </div>
  );
}
