import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Check if user exists in database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { role: true },
        });
        
        console.log("Sign in - DB User:", dbUser);
        
        // If user doesn't exist, they will be created with default role
        if (!dbUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
            },
          });
        }
        
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return true;
      }
    },
    async jwt({ token, user, account, profile, trigger }) {
      try {
        console.log("JWT Callback - Token before:", token);
        console.log("JWT Callback - User:", user);
        
        if (trigger === "signIn" || trigger === "signUp" || !token.role) {
          // Fetch user role from database
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! },
            select: { id: true, role: true },
          });
          
          console.log("JWT Callback - DB User:", dbUser);
          
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          }
        }
        
        console.log("JWT Callback - Token after:", token);
        return token;
      } catch (error) {
        console.error("JWT error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        console.log("Session Callback - Token:", token);
        console.log("Session Callback - Session before:", session);
        
        if (session?.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        
        console.log("Session Callback - Session after:", session);
        return session;
      } catch (error) {
        console.error("Session error:", error);
        return session;
      }
    },
  },
}; 