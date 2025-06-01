import { getAuthSession } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/db/db";
import { redirect } from "next/navigation";
import { DashboardTabs } from "@/components/DashboardTabs";

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
      name: true,
      firstName: true,
      lastName: true,
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
    <div className="container mx-auto py-8">
      <DashboardTabs user={formattedUser} initialTab={initialTab} />
    </div>
  );
}

