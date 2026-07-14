"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { requireUser } from "@/lib/session";
import { uploadImage } from "@/lib/storage";

export type AvatarState = { error?: string } | null;

export async function setAvatar(_prev: AvatarState, formData: FormData): Promise<AvatarState> {
  const user = await requireUser();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha uma imagem." };
  }

  let imageUrl: string;
  try {
    imageUrl = await uploadImage(file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha no upload da imagem." };
  }

  await db.update(users).set({ image: imageUrl }).where(eq(users.id, user.id));
  revalidatePath("/conta");
  revalidatePath("/ranking");
  revalidatePath("/mural");
  return null;
}

export async function removeAvatar() {
  const user = await requireUser();
  await db.update(users).set({ image: null }).where(eq(users.id, user.id));
  revalidatePath("/conta");
  revalidatePath("/ranking");
  revalidatePath("/mural");
}
