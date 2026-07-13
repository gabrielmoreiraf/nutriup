import { desc, eq, sql } from "drizzle-orm";
import { db, posts, users, likes, comments } from "@/db";

export type FeedPost = {
  id: string;
  caption: string | null;
  imageUrl: string | null;
  aiAligned: boolean;
  createdAt: Date;
  authorName: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

export async function getFeed(userId: string): Promise<FeedPost[]> {
  const rows = await db
    .select({
      id: posts.id,
      caption: posts.caption,
      imageUrl: posts.imageUrl,
      aiAligned: posts.aiAligned,
      createdAt: posts.createdAt,
      authorName: users.name,
      likeCount: sql<number>`(select count(*) from ${likes} where ${likes.postId} = ${posts.id})`.mapWith(Number),
      commentCount: sql<number>`(select count(*) from ${comments} where ${comments.postId} = ${posts.id})`.mapWith(Number),
      likedByMe: sql<boolean>`exists(select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${userId})`.mapWith(
        Boolean,
      ),
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .orderBy(desc(posts.createdAt));

  return rows.map((r) => ({ ...r, authorName: r.authorName ?? "Anônimo" }));
}

export type PostComment = {
  id: string;
  text: string;
  createdAt: Date;
  authorName: string;
};

export async function getPostWithComments(postId: string, userId: string) {
  const [post] = await db
    .select({
      id: posts.id,
      caption: posts.caption,
      imageUrl: posts.imageUrl,
      aiAligned: posts.aiAligned,
      createdAt: posts.createdAt,
      authorName: users.name,
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

  const rows = await db
    .select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      authorName: users.name,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.postId, postId))
    .orderBy(comments.createdAt);

  return {
    post: { ...post, authorName: post.authorName ?? "Anônimo" },
    comments: rows.map((r) => ({ ...r, authorName: r.authorName ?? "Anônimo" })) as PostComment[],
  };
}
