import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart, Sparkles, Send } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { getPostWithComments } from "@/lib/mural";
import { toggleLike, addComment } from "@/app/actions/mural";
import { avatarColor } from "@/lib/avatar";
import { timeAgo } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireOnboardedUser();
  const { id } = await params;
  const data = await getPostWithComments(id, user.id);
  if (!data) notFound();
  const { post, comments } = data;

  return (
    <div style={{ paddingBottom: 20 }}>
      <div className="app-top" style={{ paddingTop: 14 }}>
        <Link href="/mural" className="back">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="h-title" style={{ fontSize: 20 }}>
          Publicação
        </h2>
        <span style={{ width: 38 }} />
      </div>

      <div style={{ padding: "0 20px 10px" }}>
        <div className="post">
          <div className="post-h">
            <div className="rava" style={{ background: avatarColor(post.authorName) }}>
              {post.authorName[0]?.toUpperCase()}
            </div>
            <div>
              <b>{post.authorName}</b>
              <div>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {post.imageUrl ? (
            <div className="post-img" style={{ backgroundImage: `url(${post.imageUrl})` }} />
          ) : (
            <div className="post-img" style={{ background: "var(--mint)" }}>
              {post.aiAligned ? "🥗" : "🍽️"}
            </div>
          )}

          {post.aiAligned && (
            <div className="aitag">
              <Sparkles size={12} /> IA: alinhado com a meta
            </div>
          )}

          {post.caption && <div className="post-cap">{post.caption}</div>}

          <div className="post-act">
            <form action={toggleLike.bind(null, post.id)}>
              <button
                type="submit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: 13,
                  color: post.likedByMe ? "#EC4A82" : "var(--muted)",
                }}
              >
                <Heart size={16} fill={post.likedByMe ? "#EC4A82" : "none"} /> {post.likeCount}
              </button>
            </form>
          </div>
        </div>

        <div className="sec-title">Comentários ({comments.length})</div>
        {comments.length === 0 && <p className="sub">Nenhum comentário ainda. Seja o primeiro!</p>}

        {comments.map((c) => (
          <div key={c.id} className="card" style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: 14 }}>
            <div
              className="rava"
              style={{ background: avatarColor(c.authorName), width: 36, height: 36, borderRadius: 11, fontSize: 13 }}
            >
              {c.authorName[0]?.toUpperCase()}
            </div>
            <div>
              <b style={{ fontSize: 13.5 }}>{c.authorName}</b>
              <span style={{ fontSize: 11.5, color: "var(--muted)", marginLeft: 8 }}>{timeAgo(c.createdAt)}</span>
              <div style={{ fontSize: 14, marginTop: 2 }}>{c.text}</div>
            </div>
          </div>
        ))}

        <form action={addComment.bind(null, post.id)} style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input className="inp" name="text" placeholder="Escreva um comentário..." required style={{ flex: 1 }} />
          <button
            className="btn btn-primary"
            style={{ width: "auto", padding: "0 16px" }}
            aria-label="Comentar"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
