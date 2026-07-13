"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, Sparkles, Trophy, Newspaper } from "lucide-react";

/**
 * Menu inferior fiel ao protótipo (/reference/NutriUp.jsx):
 * Início · Plano · [FAB Diário IA] · Ranking · Mural
 */
export default function BottomNav() {
  const pathname = usePathname();
  const isOn = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="nav">
      <Link href="/inicio" className={isOn("/inicio") ? "on" : ""}>
        <Home size={22} /> Início
      </Link>
      <Link href="/plano" className={isOn("/plano") ? "on" : ""}>
        <Utensils size={22} /> Plano
      </Link>
      <Link href="/diario" aria-label="Diário IA">
        <span className="fab">
          <Sparkles size={26} />
        </span>
      </Link>
      <Link href="/ranking" className={isOn("/ranking") ? "on" : ""}>
        <Trophy size={22} /> Ranking
      </Link>
      <Link href="/mural" className={isOn("/mural") ? "on" : ""}>
        <Newspaper size={22} /> Mural
      </Link>
    </nav>
  );
}
