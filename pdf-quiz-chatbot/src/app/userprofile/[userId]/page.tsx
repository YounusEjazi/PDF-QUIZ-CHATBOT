import { getAuthSession } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/db/db";
import { redirect } from "next/navigation";
import { DashboardTabs } from "@/components/DashboardTabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings | PDF Quiz Chatbot",
  description: "Manage your profile settings and preferences",
};

type Props = {
  params: {
    userId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      bio: true,
      image: true,
      totalPoints: true,
      quizzesTaken: true,
      averageScore: true,
      bestScore: true,
      totalCorrect: true,
      totalQuestions: true,
      winStreak: true,
      bestStreak: true,
      level: true,
      experience: true,
      lastQuizDate: true,
      games: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          topic: true,
          score: true,
          gameType: true,
          createdAt: true
        }
      }
    }
  });
}

export default async function UserProfile({ params: { userId }, searchParams }: Props) {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }

  const user = await getUserData(userId);
  if (!user) {
    return redirect("/");
  }

  // Convert Date objects to ISO strings for client component
  const formattedUser = {
    ...user,
    lastQuizDate: user.lastQuizDate?.toISOString() || null,
    games: user.games.map(game => ({
      ...game,
      createdAt: game.createdAt.toISOString()
    }))
  };

  // Get the tab from search params, defaulting to "stats"
  const initialTab = (searchParams.tab === "settings" ? "settings" : "stats") as "stats" | "settings";

  return (
    <main className="min-h-screen w-full relative overflow-hidden p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-blue-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-indigo-900/50 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      {/* Top Navigation Bar */}
      <nav className="relative mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
          Profile Settings
        </h1>
      </nav>

      {/* Main Content */}
      <div className="relative">
        <div className="p-6 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
          <DashboardTabs user={formattedUser} initialTab={initialTab} />
        </div>
      </div>
    </main>
  );
}

