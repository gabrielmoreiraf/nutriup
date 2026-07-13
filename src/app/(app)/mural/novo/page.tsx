import { requireOnboardedUser } from "@/lib/session";
import MuralComposer from "@/components/mural/MuralComposer";

export default async function NovoPostPage() {
  await requireOnboardedUser();
  return <MuralComposer />;
}
