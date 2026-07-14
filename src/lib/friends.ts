import { and, eq } from "drizzle-orm";
import { db, friendships, users } from "@/db";

/** IDs dos amigos aceitos (usado pelo ranking "amigos" e pelo mural). */
export async function friendIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ friendId: friendships.friendId })
    .from(friendships)
    .where(and(eq(friendships.userId, userId), eq(friendships.status, "accepted")));
  return rows.map((r) => r.friendId);
}

export type FriendPerson = { userId: string; name: string; handle: string | null; image: string | null };

export type FriendsData = {
  myHandle: string | null;
  incoming: FriendPerson[];
  outgoing: FriendPerson[];
  friends: FriendPerson[];
};

/** Dados pra tela /ranking/amigos: meu @, convites recebidos/enviados e amigos atuais. */
export async function getFriendsData(userId: string): Promise<FriendsData> {
  const [me] = await db.select({ handle: users.handle }).from(users).where(eq(users.id, userId)).limit(1);

  const incoming = await db
    .select({ userId: friendships.userId, name: users.name, handle: users.handle, image: users.image })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.userId))
    .where(and(eq(friendships.friendId, userId), eq(friendships.status, "pending")));

  const outgoing = await db
    .select({ userId: friendships.friendId, name: users.name, handle: users.handle, image: users.image })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.friendId))
    .where(and(eq(friendships.userId, userId), eq(friendships.status, "pending")));

  const friends = await db
    .select({ userId: friendships.friendId, name: users.name, handle: users.handle, image: users.image })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.friendId))
    .where(and(eq(friendships.userId, userId), eq(friendships.status, "accepted")));

  return {
    myHandle: me?.handle ?? null,
    incoming: incoming.map((r) => ({ ...r, name: r.name ?? "Anônimo" })),
    outgoing: outgoing.map((r) => ({ ...r, name: r.name ?? "Anônimo" })),
    friends: friends.map((r) => ({ ...r, name: r.name ?? "Anônimo" })),
  };
}
