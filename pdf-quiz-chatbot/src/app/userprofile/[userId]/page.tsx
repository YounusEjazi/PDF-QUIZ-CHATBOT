import { getAuthSession } from "@/lib/nextauth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardTabs } from "@/components/DashboardTabs";

type Props = {
  params: {
    userId: string;
  };
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

export default async function UserProfile({ params: { userId } }: Props) {
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

  return (
    <div className="container mx-auto py-8">
      <DashboardTabs user={formattedUser} />
    </div>
  );
}

