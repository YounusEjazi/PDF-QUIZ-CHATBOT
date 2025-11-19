import MCQ from "@/components/MCQ";
import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: Promise<{
    gameId: string;
  }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MCQPage = async ({ params }: Props) => {
  const { gameId } = await params;
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
          userAnswer: true,
          isCorrect: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!game || !game.questions || game.questions.length === 0 || game.gameType === "open_ended") {
    console.error("Invalid game data:", { gameId, game });
    return redirect("/quiz");
  }

  // If game is already completed, redirect to statistics
  if (game.timeEnded) {
    return redirect(`/statistics/${gameId}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <MCQ game={game} />
      </div>
    </div>
  );
};

export default MCQPage;
