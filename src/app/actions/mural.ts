"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, posts, likes, comments } from "@/db";
import { requireUser } from "@/lib/session";
import { uploadImage } from "@/lib/storage";
import { getTodayLog } from "@/lib/logs";

export type PostState = { error?: string } | null;

export async function createPost(_prev: PostState, formData: FormData): Promise<PostState> {
  const user = await requireUser();
  const caption = String(formData.get("caption") ?? "").trim();
  const file = formData.get("image");

  if (!caption && !(file instanceof File && file.size > 0)) {
    return { error: "Escreva uma legenda ou adicione uma foto." };
  }

  let imageUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadImage(file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Falha no upload da imagem." };
    }
  }

  // Selo "IA: alinhado com a meta" quando o dia de hoje foi avaliado como no_caminho.
  const todayLog = await getTodayLog(user.id);
  const aiAligned = todayLog?.status === "no_caminho" && !todayLog.alertaSaude;

  await db.insert(posts).values({ userId: user.id, caption: caption || null, imageUrl, aiAligned });

  revalidatePath("/mural");
  redirect("/mural");
}

export async function toggleLike(postId: string) {
  const user = await requireUser();
  const [existing] = await db
    .select({ postId: likes.postId })
    .from(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)))
    .limit(1);

  if (existing) {
    await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));
  } else {
    await db.insert(likes).values({ postId, userId: user.id }).onConflictDoNothing();
  }
  revalidatePath("/mural");
  revalidatePath(`/mural/${postId}`);
}

export async function addComment(postId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  await db.insert(comments).values({ postId, userId: user.id, text });
  revalidatePath(`/mural/${postId}`);
  revalidatePath("/mural");
}
