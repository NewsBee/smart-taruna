import prismadb from "@/app/lib/prismadb";
import NextAuth from "next-auth/next";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import axios from "axios";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismadb),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours
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
        // const res = await axios.post("auth/signin",{
        //     email : "SAasas@saa.csa",
        //     password : "saasasassa"
        // })
        const user = await prismadb.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!user) {
          return null;
        }
        const passwordMatch = await compare(
          credentials.password,
          user.password
        );
        if (!passwordMatch) {
          return null;
        }

        // console.log(res)

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          accessToken: "ASassa",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // console.log(user);
      // console.log(account);
      if (user && account) {
        // To avoid TypeScript error, ensure you are returning the correct type
        // for the JWT token object. Only return a Promise of a JWT object, not undefined.
        token.accessToken = account.access_token;
        return Promise.resolve({
          ...token,
          username: user.username,
          role: user.role,
          id: user.id,
          accessToken: user.accessToken,
        });
      }
      // console.log(token);
      return Promise.resolve(token);
    },
    async session({ session, user, token }) {
      if (token) {
        session.token = {
          accessToken: token.accessToken,
        };
      }
      //   console.log(session.token)
      return Promise.resolve({
        ...session,
        user: {
          ...session.user,
          username: token.username,
          role: token.role,
          id: token.id,
        },
      });
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
