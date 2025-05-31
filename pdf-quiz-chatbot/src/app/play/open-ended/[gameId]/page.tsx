import OpenEnded from "@/components/OpenEnded";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
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

  // Log game data for debugging
  console.log("Game loaded:", {
    id: game.id,
    type: game.gameType,
    questionCount: game.questions.length,
    topic: game.topic
  });

  return <OpenEnded game={game} />;
};

export default OpenEndedPage;
