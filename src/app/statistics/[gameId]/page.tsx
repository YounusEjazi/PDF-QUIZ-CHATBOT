import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db/db";
import { getAuthSession } from "@/lib/auth/nextauth";
import { LucideLayoutDashboard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import ResultsCard from "@/components/statistics/ResultsCard";
import AccuracyCard from "@/components/statistics/AccuracyCard";
import TimeTakenCard from "@/components/statistics/TimeTakenCard";
import QuestionsList from "@/components/statistics/QuestionsList";
import { cn } from "@/lib/utils/utils";

type Props = {
  params: Promise<{
    gameId: string;
  }>;
};

const Statistics = async ({ params }: Props) => {
  const { gameId } = await params;
  console.log("Loading statistics page for gameId:", gameId);
  const session = await getAuthSession();
  if (!session?.user) {
    console.log("No authenticated user found");
    return redirect("/");
  }
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { questions: true },
  });
  if (!game) {
    console.log("Game not found:", gameId);
    return redirect("/");
  }

  console.log("Found game:", {
    id: game.id,
    type: game.gameType,
    questionCount: game.questions.length,
    timeStarted: game.timeStarted,
    timeEnded: game.timeEnded,
    score: game.score
  });

  let accuracy: number = 0;

  if (game.gameType === "mcq") {
    let totalCorrect = game.questions.reduce((acc, question) => {
      if (question.isCorrect) {
        return acc + 1;
      }
      return acc;
    }, 0);
    accuracy = (totalCorrect / game.questions.length) * 100;
  } else if (game.gameType === "open_ended") {
    let totalPercentage = game.questions.reduce((acc, question) => {
      return acc + (question.percentageCorrect ?? 0);
    }, 0);
    accuracy = totalPercentage / game.questions.length;
  }
  accuracy = Math.round(accuracy * 100) / 100;

  console.log("Calculated accuracy:", accuracy);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Quiz Summary
          </h2>
          <Link 
            href="/dashboard" 
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
              "shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40",
              "hover:scale-[1.02] active:scale-[0.98]",
              "transition-all duration-200",
              "text-sm sm:text-base",
              "h-9 sm:h-10",
              "px-3 sm:px-4"
            )}
          >
            <LucideLayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
            Dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-7">
          <ResultsCard accuracy={accuracy} />
          <AccuracyCard accuracy={accuracy} />
          <TimeTakenCard
            timeEnded={new Date(game.timeEnded ?? 0)}
            timeStarted={new Date(game.timeStarted ?? 0)}
          />
        </div>
        <QuestionsList questions={game.questions} />
      </div>
    </div>
  );
};

export default Statistics;
