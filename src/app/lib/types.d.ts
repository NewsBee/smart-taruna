import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        username: string
        role: string;
        id: string;
        accessToken : string
    }
    interface Session{
        user: User & {
            username : string
        }
        token: {
            accessToken?: accessToken;
        }& DefaultSession["user"];
    }
//   type User = {
//     id: string;
//     email: string;
//     username: string;
//     password?: string;
//   };
}