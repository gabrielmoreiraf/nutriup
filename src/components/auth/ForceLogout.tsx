"use client";

import { useEffect } from "react";
import { logoutBlocked } from "@/app/actions/auth";

/** Dispara o signOut de verdade a partir do client (Server Component não pode mexer em cookie). */
export default function ForceLogout() {
  useEffect(() => {
    logoutBlocked();
  }, []);

  return (
    <div className="pad" style={{ textAlign: "center", paddingTop: 100 }}>
      <p className="sub">Encerrando sua sessão...</p>
    </div>
  );
}
