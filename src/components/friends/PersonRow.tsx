"use client";

import { useTransition } from "react";
import Avatar from "@/components/Avatar";
import type { FriendPerson } from "@/lib/friends";

type Action = { label: string; run: () => Promise<void>; danger?: boolean };

export default function PersonRow({ person, actions }: { person: FriendPerson; actions: Action[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
      <Avatar
        name={person.name}
        image={person.image}
        className="rava"
        style={{ width: 40, height: 40, borderRadius: 12, fontSize: 14 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {person.name}
        </div>
        {person.handle && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>@{person.handle}</div>}
      </div>
      <div style={{ display: "flex", gap: 6, flex: "none" }}>
        {actions.map((a) => (
          <button
            key={a.label}
            className="btn btn-ghost"
            style={{ width: "auto", padding: "8px 12px", fontSize: 12.5, color: a.danger ? "#c0392b" : undefined }}
            disabled={pending}
            onClick={() => start(a.run)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
