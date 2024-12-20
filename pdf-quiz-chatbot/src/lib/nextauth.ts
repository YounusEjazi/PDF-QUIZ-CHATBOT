import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions, getServerSession, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

// Erweiterte Typen
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
<<<<<<< Updated upstream
=======
    maxAge: 60 * 60, // Session expires after 1 hour
    updateAge: 15 * 60, // Token refresh interval
>>>>>>> Stashed changes
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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

        // Benutzer aus der Datenbank abrufen
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim() },
        });

        if (!user) {
          throw new Error("No user found. Please register first.");
        }

<<<<<<< Updated upstream
        // Passwort prüfen
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
=======
        const isValidPassword = await bcrypt.compare(
          credentials.password.trim(),
          user.password
        );
>>>>>>> Stashed changes
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

<<<<<<< Updated upstream
        return { id: user.id, email: user.email, name: user.name };
=======
        // Check if user is a SuperAdmin (optional)
        const superAdminEmails = ["lahmar.mustapha@gmail.com"];
        const role = superAdminEmails.includes(user.email) ? "superadmin" : "user";

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          image: user.image || null,
          role, // Include role in user object
        };
>>>>>>> Stashed changes
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
<<<<<<< Updated upstream
=======
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role || "user";
>>>>>>> Stashed changes
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
<<<<<<< Updated upstream
=======
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.role = token.role as string;
>>>>>>> Stashed changes
      }
      return session;
    },
  },
};

// Funktion für die Authentifizierungs-Session
export const getAuthSession = async () => {
  return await getServerSession(authOptions);
};
