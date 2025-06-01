import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // Session expires after 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account", // Forces Google authentication prompt
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found. Please register first.");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        // Ensure we return consistent user details
        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          image: user.image || null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      // Add user data to token on login
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
      }

      // If it's a sign-in or update event, fetch the latest role
      if (trigger === "signIn" || trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      // Add user details to session from token
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      // Ensure user is created in the database for non-OAuth logins
      if (isNewUser && user.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            emailVerified: new Date(),
          },
        });
      }
    },
  },
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
    error: "/auth/error",   // Custom error page
  },
};

export const getAuthSession = async () => {
  return await getServerSession(authOptions);
};
