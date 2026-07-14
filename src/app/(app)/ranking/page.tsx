import Link from "next/link";
import { Flame, UserPlus } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { getWeeklyRanking, type RankScope } from "@/lib/ranking";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireOnboardedUser();
  const { tab } = await searchParams;
  const scope: RankScope = tab === "global" ? "global" : "amigos";
  const rows = await getWeeklyRanking(user.id, scope);

  return (
    <div className="pad" style={{ paddingTop: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 className="h-title">Ranking</h2>
          <p className="sub">Consistência vale ponto. Bora subir essa semana.</p>
        </div>
        <Link
          href="/ranking/amigos"
          className="btn btn-ghost"
          style={{ width: "auto", padding: "10px 14px", fontSize: 13, whiteSpace: "nowrap", textDecoration: "none" }}
        >
          <UserPlus size={16} /> Amigos
        </Link>
      </div>

      <div className="tabs">
        <Link href="/ranking?tab=amigos" className={scope === "amigos" ? "on" : ""} style={tabStyle}>
          Amigos
        </Link>
        <Link href="/ranking?tab=global" className={scope === "global" ? "on" : ""} style={tabStyle}>
          Global
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "26px 18px" }}>
          <b style={{ fontSize: 15, fontWeight: 800 }}>Ninguém pontuou ainda esta semana</b>
          <p className="sub" style={{ marginTop: 6 }}>
            Registre seu dia no Diário pra somar os primeiros pontos.
          </p>
        </div>
      ) : (
        rows.map((r) => (
          <div key={r.userId} className={"rank" + (r.isMe ? " me" : "")}>
            <div className="pos">{r.position <= 3 ? MEDALS[r.position - 1] : r.position}</div>
            <Avatar name={r.name} image={r.image} className="rava" />
            <div>
              <div className="nm">{r.isMe ? `Você (${r.name})` : r.name}</div>
              <div className="st">
                <Flame size={12} /> streak {r.streak} {r.streak === 1 ? "dia" : "dias"}
              </div>
            </div>
            <div className="pts">{r.points.toLocaleString("pt-BR")}</div>
          </div>
        ))
      )}
    </div>
  );
}

const tabStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
} as const;
