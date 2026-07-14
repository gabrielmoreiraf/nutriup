"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, users, friendships } from "@/db";
import { requireUser } from "@/lib/session";
import { normalizeHandle, isValidHandle } from "@/lib/handle";

export type FriendState = { error?: string } | null;

export async function setHandle(_prev: FriendState, formData: FormData): Promise<FriendState> {
  const user = await requireUser();
  const handle = normalizeHandle(String(formData.get("handle") ?? ""));
  if (!isValidHandle(handle)) {
    return { error: "Use de 3 a 20 letras minúsculas, números ou _." };
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.handle, handle)).limit(1);
  if (existing && existing.id !== user.id) {
    return { error: "Esse @ já está em uso." };
  }

  await db.update(users).set({ handle }).where(eq(users.id, user.id));
  revalidatePath("/conta");
  revalidatePath("/ranking/amigos");
  return null;
}

export async function sendFriendRequest(_prev: FriendState, formData: FormData): Promise<FriendState> {
  const user = await requireUser();
  const handle = normalizeHandle(String(formData.get("handle") ?? ""));
  if (!handle) return { error: "Informe um @." };

  const [target] = await db.select({ id: users.id }).from(users).where(eq(users.handle, handle)).limit(1);
  if (!target) return { error: "Nenhum usuário com esse @." };
  if (target.id === user.id) return { error: "Você não pode adicionar a si mesmo." };

  const [mine] = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(and(eq(friendships.userId, user.id), eq(friendships.friendId, target.id)))
    .limit(1);
  if (mine?.status === "accepted") return { error: "Vocês já são amigos." };
  if (mine?.status === "pending") return { error: "Convite já enviado, aguardando resposta." };

  const [theirs] = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(and(eq(friendships.userId, target.id), eq(friendships.friendId, user.id)))
    .limit(1);

  if (theirs?.status === "pending") {
    // Convite cruzado (o outro já tinha te chamado) — vira amizade na hora.
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(and(eq(friendships.userId, target.id), eq(friendships.friendId, user.id)));
    await db
      .insert(friendships)
      .values({ userId: user.id, friendId: target.id, status: "accepted" })
      .onConflictDoUpdate({ target: [friendships.userId, friendships.friendId], set: { status: "accepted" } });
  } else {
    await db
      .insert(friendships)
      .values({ userId: user.id, friendId: target.id, status: "pending" })
      .onConflictDoUpdate({ target: [friendships.userId, friendships.friendId], set: { status: "pending" } });
  }

  revalidatePath("/ranking/amigos");
  return null;
}

export async function acceptFriendRequest(fromUserId: string) {
  const user = await requireUser();
  await db
    .update(friendships)
    .set({ status: "accepted" })
    .where(and(eq(friendships.userId, fromUserId), eq(friendships.friendId, user.id)));
  await db
    .insert(friendships)
    .values({ userId: user.id, friendId: fromUserId, status: "accepted" })
    .onConflictDoUpdate({ target: [friendships.userId, friendships.friendId], set: { status: "accepted" } });
  revalidatePath("/ranking/amigos");
  revalidatePath("/ranking");
}

export async function declineFriendRequest(fromUserId: string) {
  const user = await requireUser();
  await db.delete(friendships).where(and(eq(friendships.userId, fromUserId), eq(friendships.friendId, user.id)));
  revalidatePath("/ranking/amigos");
}

export async function cancelFriendRequest(toUserId: string) {
  const user = await requireUser();
  await db.delete(friendships).where(and(eq(friendships.userId, user.id), eq(friendships.friendId, toUserId)));
  revalidatePath("/ranking/amigos");
}

export async function removeFriend(otherUserId: string) {
  const user = await requireUser();
  await db.delete(friendships).where(and(eq(friendships.userId, user.id), eq(friendships.friendId, otherUserId)));
  await db.delete(friendships).where(and(eq(friendships.userId, otherUserId), eq(friendships.friendId, user.id)));
  revalidatePath("/ranking/amigos");
  revalidatePath("/ranking");
  revalidatePath("/mural");
}
