"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, profiles } from "@/db";
import { requireOnboardedUser } from "@/lib/session";

export type PreferencesState = { error?: string } | null;

function parseTags(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export async function setPreferences(_prev: PreferencesState, formData: FormData): Promise<PreferencesState> {
  const user = await requireOnboardedUser();
  const gosta = parseTags(String(formData.get("gosta") ?? ""));
  const evita = parseTags(String(formData.get("evita") ?? ""));

  await db
    .update(profiles)
    .set({ prefs: { gosta, evita }, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  revalidatePath("/perfil");
  return null;
}
