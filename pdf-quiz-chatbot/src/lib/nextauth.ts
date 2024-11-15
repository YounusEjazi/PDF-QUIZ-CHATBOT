import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions, getServerSession, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";

// Extend default session interface to include user ID
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // Populate JWT with user ID from the database
    jwt: async ({ token }) => {
      if (!token.id) {
        const user = await prisma.user.findUnique({
          where: { email: token.email || undefined },
        });
        if (user) {
          token.id = user.id;
        }
      }
      return token;
    },
    // Add user ID to session data
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Custom sign-in page route
  },
};

// Export utility for getting the current session in server components
export const getAuthSession = async () => {
  return getServerSession(authOptions);
};
