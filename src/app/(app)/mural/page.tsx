import Link from "next/link";
import { Plus, Heart, MessageCircle, Sparkles } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { getFeed } from "@/lib/mural";
import { toggleLike } from "@/app/actions/mural";
import { avatarColor } from "@/lib/avatar";
import { timeAgo } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function MuralPage() {
  const user = await requireOnboardedUser();
  const feed = await getFeed(user.id);

  return (
    <>
      <div className="app-top" style={{ paddingTop: 14 }}>
        <h2 className="h-title" style={{ fontSize: 22 }}>
          Mural
        </h2>
        <Link
          href="/mural/novo"
          className="btn btn-primary"
          style={{ width: "auto", padding: "10px 16px", fontSize: 13.5, textDecoration: "none" }}
        >
          <Plus size={16} /> Publicar
        </Link>
      </div>

      <div style={{ padding: "0 20px 10px" }}>
        {feed.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "26px 18px" }}>
            <b style={{ fontSize: 15, fontWeight: 800 }}>O mural está vazio</b>
            <p className="sub" style={{ marginTop: 6 }}>
              Seja o primeiro a compartilhar uma refeição ou treino.
            </p>
          </div>
        ) : (
          feed.map((p) => (
            <div key={p.id} className="post">
              <div className="post-h">
                <div className="rava" style={{ background: avatarColor(p.authorName) }}>
                  {p.authorName[0]?.toUpperCase()}
                </div>
                <div>
                  <b>{p.authorName}</b>
                  <div>
                    <span>{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
              </div>

              {p.imageUrl ? (
                <div className="post-img" style={{ backgroundImage: `url(${p.imageUrl})` }} />
              ) : (
                <div className="post-img" style={{ background: "var(--mint)" }}>
                  {p.aiAligned ? "🥗" : "🍽️"}
                </div>
              )}

              {p.aiAligned && (
                <div className="aitag">
                  <Sparkles size={12} /> IA: alinhado com a meta
                </div>
              )}

              {p.caption && <div className="post-cap">{p.caption}</div>}

              <div className="post-act">
                <form action={toggleLike.bind(null, p.id)}>
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
                      color: p.likedByMe ? "#EC4A82" : "var(--muted)",
                    }}
                  >
                    <Heart size={16} fill={p.likedByMe ? "#EC4A82" : "none"} /> {p.likeCount}
                  </button>
                </form>
                <Link
                  href={`/mural/${p.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", textDecoration: "none" }}
                >
                  <MessageCircle size={16} /> {p.commentCount}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
