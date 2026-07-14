import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOnboardedUser } from "@/lib/session";
import { getFriendsData } from "@/lib/friends";
import { acceptFriendRequest, declineFriendRequest, cancelFriendRequest, removeFriend } from "@/app/actions/friends";
import HandleForm from "@/components/friends/HandleForm";
import AddFriendForm from "@/components/friends/AddFriendForm";
import PersonRow from "@/components/friends/PersonRow";

export const dynamic = "force-dynamic";

export default async function AmigosPage() {
  const user = await requireOnboardedUser();
  const data = await getFriendsData(user.id);

  return (
    <div className="pad" style={{ paddingTop: 12 }}>
      <Link href="/ranking" className="back">
        <ArrowLeft size={18} />
      </Link>
      <h2 className="h-title" style={{ marginTop: 18 }}>
        Amigos
      </h2>
      <p className="sub">
        Adicione amigos pelo @ pra competir no ranking. O mural também só mostra posts de amigos.
      </p>

      <div className="sec-title">Seu @</div>
      <HandleForm currentHandle={data.myHandle} />

      <div className="sec-title">Adicionar amigo</div>
      <AddFriendForm />

      {data.incoming.length > 0 && (
        <>
          <div className="sec-title">Convites recebidos</div>
          {data.incoming.map((p) => (
            <PersonRow
              key={p.userId}
              person={p}
              actions={[
                { label: "Aceitar", run: acceptFriendRequest.bind(null, p.userId) },
                { label: "Recusar", run: declineFriendRequest.bind(null, p.userId), danger: true },
              ]}
            />
          ))}
        </>
      )}

      {data.outgoing.length > 0 && (
        <>
          <div className="sec-title">Convites enviados</div>
          {data.outgoing.map((p) => (
            <PersonRow
              key={p.userId}
              person={p}
              actions={[{ label: "Cancelar", run: cancelFriendRequest.bind(null, p.userId), danger: true }]}
            />
          ))}
        </>
      )}

      <div className="sec-title">Seus amigos ({data.friends.length})</div>
      {data.friends.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
          <p className="sub">Você ainda não tem amigos adicionados.</p>
        </div>
      ) : (
        data.friends.map((p) => (
          <PersonRow
            key={p.userId}
            person={p}
            actions={[{ label: "Remover", run: removeFriend.bind(null, p.userId), danger: true }]}
          />
        ))
      )}
    </div>
  );
}
