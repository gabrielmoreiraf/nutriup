import { desc, eq, inArray, sql } from "drizzle-orm";
import { db, posts, users, likes, comments } from "@/db";
import { friendIds } from "@/lib/friends";

export type FeedPost = {
  id: string;
  caption: string | null;
  imageUrl: string | null;
  aiAligned: boolean;
  createdAt: Date;
  authorName: string;
  authorImage: string | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

/** Mural é só entre amigos — nunca global (diferente do ranking, que tem aba "global"). */
export async function getFeed(userId: string): Promise<FeedPost[]> {
  const ids = [userId, ...(await friendIds(userId))];

  const rows = await db
    .select({
      id: posts.id,
      caption: posts.caption,
      imageUrl: posts.imageUrl,
      aiAligned: posts.aiAligned,
      createdAt: posts.createdAt,
      authorName: users.name,
      authorImage: users.image,
      likeCount: sql<number>`(select count(*) from ${likes} where ${likes.postId} = ${posts.id})`.mapWith(Number),
      commentCount: sql<number>`(select count(*) from ${comments} where ${comments.postId} = ${posts.id})`.mapWith(Number),
      likedByMe: sql<boolean>`exists(select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${userId})`.mapWith(
        Boolean,
      ),
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .where(inArray(posts.userId, ids))
    .orderBy(desc(posts.createdAt));

  return rows.map((r) => ({ ...r, authorName: r.authorName ?? "Anônimo" }));
}

export type PostComment = {
  id: string;
  text: string;
  createdAt: Date;
  authorName: string;
  authorImage: string | null;
};

export async function getPostWithComments(postId: string, userId: string) {
  const [post] = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      caption: posts.caption,
      imageUrl: posts.imageUrl,
      aiAligned: posts.aiAligned,
      createdAt: posts.createdAt,
      authorName: users.name,
      authorImage: users.image,
      likeCount: sql<number>`(select count(*) from ${likes} where ${likes.postId} = ${posts.id})`.mapWith(Number),
      likedByMe: sql<boolean>`exists(select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${userId})`.mapWith(
        Boolean,
      ),
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) return null;

  // Só o autor e os amigos dele podem ver o post (mural não é global).
  if (post.userId !== userId) {
    const ids = await friendIds(userId);
    if (!ids.includes(post.userId)) return null;
  }

  const rows = await db
    .select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.postId, postId))
    .orderBy(comments.createdAt);

  const { userId: _authorId, ...postFields } = post;
  return {
    post: { ...postFields, authorName: post.authorName ?? "Anônimo" },
    comments: rows.map((r) => ({ ...r, authorName: r.authorName ?? "Anônimo" })) as PostComment[],
  };
}
