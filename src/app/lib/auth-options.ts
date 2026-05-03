import prismadb from "@/app/lib/prismadb";
import { compare, hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

const getUniqueUsername = async (name: string | null | undefined, email: string) => {
  const baseUsername =
    (name || email.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "user";

  let username = baseUsername;
  let suffix = 1;

  while (await prismadb.user.findUnique({ where: { username } })) {
    username = `${baseUsername}-${suffix}`;
    suffix += 1;
  }

  return username;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prismadb.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const passwordMatch = await compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          accessToken: "credentials",
        };
      },
    }),
    ...(googleProvider ? [googleProvider] : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const email = profile?.email;
      if (!email) return false;

      const existingUser = await prismadb.user.findUnique({
        where: { email },
      });

      if (existingUser) return true;

      const username = await getUniqueUsername(profile.name, email);
      const password = await hash(randomUUID(), 10);

      await prismadb.user.create({
        data: {
          username,
          email,
          password,
        },
      });

      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "google" && token.email) {
          const dbUser = await prismadb.user.findUnique({
            where: { email: token.email },
            select: { id: true, username: true, role: true },
          });

          if (dbUser) {
            return {
              ...token,
              username: dbUser.username,
              role: dbUser.role,
              id: dbUser.id.toString(),
              accessToken: account.access_token,
            };
          }
        }

        return {
          ...token,
          username: user.username,
          role: user.role,
          id: user.id,
          accessToken: user.accessToken || account.access_token,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.token = {
          accessToken: token.accessToken,
        };
      }

      return {
        ...session,
        user: {
          ...session.user,
          username: token.username,
          role: token.role,
          id: token.id,
        },
      };
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
};
