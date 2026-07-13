import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, users, accounts, sessions, verificationTokens } from "@/db";

/** Google só entra no ar quando as chaves existirem (plugável). */
export const googleEnabled = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [
  Credentials({
    name: "E-mail e senha",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    authorize: async (creds) => {
      const email = String(creds?.email ?? "")
        .trim()
        .toLowerCase();
      const password = String(creds?.password ?? "");
      if (!email || !password) return null;

      const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!u?.passwordHash) return null;

      const ok = await bcrypt.compare(password, u.passwordHash);
      if (!ok) return null;

      return { id: u.id, name: u.name, email: u.email, image: u.image };
    },
  }),
];

if (googleEnabled) {
  providers.push(Google({ allowDangerousEmailAccountLinking: true }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Credentials exige sessão JWT (não banco). Google persiste via adapter.
  session: { strategy: "jwt" },
  trustHost: true,
  providers,
  pages: { signIn: "/entrar" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) session.user.id = token.uid as string;
      return session;
    },
  },
});
