import { prisma } from "@/lib/db/db";
import { Clock, CopyCheck, Edit2, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeleteQuizButton from "@/components/DeleteQuizButton";
import ResumeQuizButton from "@/components/ResumeQuizButton";

type Props = {
  limit: number;
  userId: string;
  showScrollArea?: boolean;
};

const HistoryComponent = async ({ limit, userId, showScrollArea = true }: Props) => {
  const games = await prisma.game.findMany({
    take: limit,
    where: {
      userId,
    },
    include: {
      questions: {
        select: {
          id: true,
          userAnswer: true,
        },
      },
    },
    orderBy: {
      timeStarted: "desc",
    },
  });

  // Separate incomplete and complete games
  // A game is incomplete if timeEnded is null (not finished)
  const incompleteGames = games.filter(game => game.timeEnded === null);
  const completeGames = games.filter(game => game.timeEnded !== null);
  
  console.log("Games analysis:", {
    total: games.length,
    incomplete: incompleteGames.length,
    complete: completeGames.length,
    incompleteIds: incompleteGames.map(g => g.id)
  });

  const Content = () => (
    <div className="space-y-6">
      {/* Incomplete Quizzes Section */}
      {incompleteGames.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>Incomplete Quizzes</span>
          </div>
          {incompleteGames.map((game) => {
            const answeredCount = game.questions.filter(q => q.userAnswer !== null).length;
            const totalQuestions = game.questions.length;
            const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
            
            return (
              <div
                key={game.id}
                className="group relative bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-lg rounded-xl p-4 hover:bg-amber-50/70 dark:hover:bg-amber-900/20 transition-all border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      game.gameType === "mcq" 
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    }`}>
                      {game.gameType === "mcq" ? (
                        <CopyCheck className="w-5 h-5" />
                      ) : (
                        <Edit2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="text-base sm:text-lg font-semibold line-clamp-2 sm:line-clamp-1">
                        {game.topic}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Started {new Date(game.timeStarted).toLocaleDateString()}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {game.gameType === "mcq" ? "Multiple Choice" : "Fill in the Blank"}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {answeredCount}/{totalQuestions} answered ({progress}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <ResumeQuizButton gameId={game.id} gameType={game.gameType} isCompleted={false} />
                    <DeleteQuizButton gameId={game.id} gameTopic={game.topic} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Quizzes Section */}
      {completeGames.length > 0 && (
        <div className="space-y-4">
          {incompleteGames.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 pt-2">
              <span>Completed Quizzes</span>
            </div>
          )}
          {completeGames.map((game) => {
            const score = game.score || 0;
            const scoreColor = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
            
            return (
              <div
                key={game.id}
                className="group relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all border border-gray-200 dark:border-gray-700 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      game.gameType === "mcq" 
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    }`}>
                      {game.gameType === "mcq" ? (
                        <CopyCheck className="w-5 h-5" />
                      ) : (
                        <Edit2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <Link
                        href={`/statistics/${game.id}`}
                        className="text-base sm:text-lg font-semibold hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-2 sm:line-clamp-1"
                      >
                        {game.topic}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(game.timeEnded!).toLocaleDateString()}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {game.gameType === "mcq" ? "Multiple Choice" : "Fill in the Blank"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:shrink-0">
                    {game.score !== null && (
                      <div className="flex items-center space-x-2">
                        <Trophy className={`w-5 h-5 ${scoreColor}`} />
                        <span className={`text-lg font-bold ${scoreColor}`}>
                          {Math.round(game.score)}%
                        </span>
                      </div>
                    )}
                    <ResumeQuizButton gameId={game.id} gameType={game.gameType} isCompleted={true} />
                    <DeleteQuizButton gameId={game.id} gameTopic={game.topic} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {games.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No quiz history yet. Start a quiz to see your progress!
        </div>
      )}
    </div>
  );

  if (!showScrollArea) {
    return <Content />;
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
      <Content />
    </ScrollArea>
  );
};

export default HistoryComponent;
