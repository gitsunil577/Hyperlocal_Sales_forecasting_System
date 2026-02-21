import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: MongoDBAdapter(clientPromise) as any,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: (user as any).role as "admin" | "vendor",
          id: (user.id ?? "") as string,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: ((token as any).role ?? "vendor") as "admin" | "vendor",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: ((token as any).id ?? "") as string,
        },
      };
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("salesforecast");
        const user = await db.collection("users").findOne({
          email: (credentials.email as string).toLowerCase(),
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash as string
        );
        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email as string,
          name: user.fullName as string,
          role: user.role as "admin" | "vendor",
        };
      },
    }),
  ],
});
