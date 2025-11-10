import OpenEnded from "@/components/OpenEnded";
import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    gameId: string;
  };
};

const OpenEndedPage = async ({ params: { gameId } }: Props) => {
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
          answer: true,
          userAnswer: true,
          percentageCorrect: true,
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
    },
  });

  if (!game) {
    console.error("Game not found:", gameId);
    return redirect("/quiz");
  }

  if (game.gameType !== "open_ended") {
    console.error("Invalid game type:", game.gameType);
    return redirect("/quiz");
  }

  if (!game.questions || game.questions.length === 0) {
    console.error("No questions found for game:", gameId);
    return redirect("/quiz");
  }

  // If game is already completed, redirect to statistics
  if (game.timeEnded) {
    return redirect(`/statistics/${gameId}`);
  }

  // Log game data for debugging
  console.log("Game loaded:", {
    id: game.id,
    type: game.gameType,
    questionCount: game.questions.length,
    topic: game.topic
  });

  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-1 relative pb-24">
        <OpenEnded game={game} />
      </main>
    </div>
  );
};

export default OpenEndedPage;
