import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { desc } from "drizzle-orm";
import { db, users } from "@/db";
import { requireAdmin } from "@/lib/admin";
import AdminUserRow from "@/components/admin/AdminUserRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — NutriUp" };

export default async function AdminPage() {
  const admin = await requireAdmin();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
      isPremium: users.isPremium,
      isBlocked: users.isBlocked,
      adminAccessUntil: users.adminAccessUntil,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div className="app-shell">
      <div className="app-screen">
        <div className="pad" style={{ paddingTop: 12 }}>
          <Link href="/conta" className="back">
            <ArrowLeft size={18} />
          </Link>
          <h2 className="h-title" style={{ marginTop: 18 }}>
            Admin
          </h2>
          <p className="sub">
            {rows.length} {rows.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}
          </p>

          {rows.map((u) => (
            <AdminUserRow
              key={u.id}
              isSelf={u.id === admin.id}
              user={{
                id: u.id,
                name: u.name,
                email: u.email,
                image: u.image,
                createdAt: u.createdAt.toISOString(),
                isPremium: u.isPremium,
                isBlocked: u.isBlocked,
                adminAccessUntil: u.adminAccessUntil ? u.adminAccessUntil.toISOString() : null,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
