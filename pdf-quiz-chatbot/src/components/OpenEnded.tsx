"use client";
import { cn, formatTimeDelta } from "@/lib/utils/utils";
import { Game, Question } from "@prisma/client";
import { differenceInSeconds } from "date-fns";
import { BarChart, ChevronRight, Loader2, Timer, Trophy, Sparkles } from "lucide-react";
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";
import OpenEndedPercentage from "./OpenEndedPercentage";
import BlankAnswerInput from "./BlankAnswerInput";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import axios, { AxiosError } from "axios";
import { useToast } from "../../src/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "question" | "answer" | "userAnswer" | "percentageCorrect">[] };
};

interface CheckAnswerResponse {
  percentageSimilar: number;
}

const OpenEnded = ({ game }: Props) => {
  const router = useRouter();
  
  // Find first unanswered question, or start from beginning
  const firstUnansweredIndex = React.useMemo(() => {
    const index = game.questions.findIndex(q => !q.userAnswer);
    return index >= 0 ? index : 0;
  }, [game.questions]);
  
  const [hasEnded, setHasEnded] = React.useState(false);
  const [questionIndex, setQuestionIndex] = React.useState(firstUnansweredIndex);
  
  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);
  
  // Initialize blankAnswer with existing answer if resuming
  const [blankAnswer, setBlankAnswer] = React.useState(currentQuestion?.userAnswer || "");
  
  // Initialize average percentage from existing answers
  const initialAverage = React.useMemo(() => {
    const answeredQuestions = game.questions.filter(q => q.percentageCorrect !== null);
    if (answeredQuestions.length === 0) return 0;
    const sum = answeredQuestions.reduce((acc, q) => acc + (q.percentageCorrect || 0), 0);
    return Math.round(sum / answeredQuestions.length);
  }, [game.questions]);

  const [averagePercentage, setAveragePercentage] = React.useState(initialAverage);
  const [totalCorrect, setTotalCorrect] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [currentPercentage, setCurrentPercentage] = React.useState<number | null>(null);

  // Update blankAnswer and show answer state when question changes
  React.useEffect(() => {
    setBlankAnswer(currentQuestion?.userAnswer || "");
    // If question was already answered, show the answer
    if (currentQuestion?.userAnswer && currentQuestion?.percentageCorrect !== null) {
      setShowAnswer(true);
      setCurrentPercentage(currentQuestion.percentageCorrect);
    } else {
      setShowAnswer(false);
      setCurrentPercentage(null);
    }
  }, [questionIndex, currentQuestion]);

  const { mutate: endGame, isPending: isEnding } = useMutation({
    mutationFn: async () => {
      console.log("Starting endGame mutation for game:", game.id);
      const payload: z.infer<typeof endGameSchema> = {
        gameId: game.id,
      };
      const response = await axios.post(`/api/endGame`, payload);
      console.log("endGame response:", response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("endGame mutation successful:", data);
      setHasEnded(true);
    },
    onError: (error) => {
      console.error("Failed to end game:", error);
      toast({
        title: "Error",
        description: "Failed to end game. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { toast } = useToast();
  const [now, setNow] = React.useState(new Date());

  const { mutate: checkAnswer, isPending: isChecking } = useMutation<CheckAnswerResponse, AxiosError>({
    mutationFn: async () => {
      if (!blankAnswer) {
        throw new Error("Please enter an answer");
      }

      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userInput: blankAnswer,
      };
      const response = await axios.post(`/api/checkAnswer`, payload);
      return response.data;
    },
  });

  React.useEffect(() => {
    if (!hasEnded) {
      const interval = setInterval(() => {
        setNow(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [hasEnded]);

  const moveToNextQuestion = React.useCallback(() => {
    setShowAnswer(false);
    setCurrentPercentage(null);
    if (questionIndex < game.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setBlankAnswer("");
    } else {
      endGame();
    }
  }, [questionIndex, game.questions.length, endGame]);

  const handleNext = React.useCallback(() => {
    if (!currentQuestion) {
      toast({
        title: "Error",
        description: "No question found",
        variant: "destructive",
      });
      return;
    }

    if (showAnswer) {
      moveToNextQuestion();
      return;
    }

    if (!blankAnswer) {
      toast({
        title: "Error",
        description: "Please enter an answer",
        variant: "destructive",
      });
      return;
    }

    checkAnswer(undefined, {
      onSuccess: ({ percentageSimilar }) => {
        setCurrentPercentage(percentageSimilar);
        setShowAnswer(true);
        const isCorrectEnough = percentageSimilar >= 70;
        if (isCorrectEnough) {
          setTotalCorrect(prev => prev + 1);
        }

        setAveragePercentage(prev => {
          const newTotal = prev * questionIndex + percentageSimilar;
          return newTotal / (questionIndex + 1);
        });
      },
      onError: (error: Error | AxiosError) => {
        console.error(error);
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to check answer"
          : error instanceof Error ? error.message : "Something went wrong";
        toast({
          title: "Error checking answer",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });
  }, [checkAnswer, currentQuestion, blankAnswer, toast, questionIndex, moveToNextQuestion, showAnswer]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isChecking && !hasEnded) {
        handleNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, isChecking, hasEnded]);

  if (hasEnded) {
    return (
      <div className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative p-8 overflow-hidden text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20" />
          <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h2 className="mb-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Quiz Completed!
          </h2>
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-300">
              Time: {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>
                Score: {totalCorrect} out of {game.questions.length} ({Math.round(averagePercentage)}% average)
              </span>
            </div>
          </div>
          {isEnding ? (
            <div className="mt-6">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600" />
              <p className="mt-2 text-sm text-gray-500">Saving your results...</p>
            </div>
          ) : (
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => {
                  console.log("Navigating to statistics:", game.id);
                  router.push(`/statistics/${game.id}`);
                }}
                variant="default"
                size="lg"
                className={cn(
                  "relative inline-flex items-center justify-center",
                  "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                  "shadow-lg shadow-purple-500/20",
                  "hover:shadow-purple-500/40 hover:scale-[1.02]",
                  "active:scale-[0.98]",
                  "transition-all duration-200",
                  "cursor-pointer select-none",
                  "px-6 py-3",
                  "rounded-lg",
                  "font-medium",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                )}
              >
                <span className="relative z-10">View Statistics</span>
                <BarChart className="relative z-10 w-4 h-4 ml-2" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/0 to-pink-600/0 hover:from-purple-600/20 hover:to-pink-600/20 transition-colors duration-200" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 text-center bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20"
        >
          <p className="text-red-600 dark:text-red-400 font-medium">No questions found</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "absolute -translate-x-1/2 md:w-[80vw] max-w-4xl w-[90vw] left-1/2",
      showAnswer 
        ? "relative top-32 mb-32 translate-y-0" 
        : "-translate-y-1/2 top-1/2 mt-12 mb-16"
    )}>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Topic:</span>
            <span className="px-3 py-1 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
              {game.topic}
            </span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Timer className="w-4 h-4 mr-2" />
            {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
          </div>
        </div>
        <OpenEndedPercentage percentage={Math.round(averagePercentage)} />
      </div>

      <div className="mt-4 space-y-4">
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20">
              <CardTitle className="text-center text-gray-700 dark:text-gray-300">
                <div className="text-lg font-bold">{questionIndex + 1}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {game.questions.length}
                </div>
              </CardTitle>
            </div>
            <div className="space-y-2 flex-1">
              <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                Fill in the blank in the following sentence:
              </CardDescription>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {currentQuestion.question}
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="flex flex-col items-center justify-center w-full gap-4">
          <div className="w-full">
            <BlankAnswerInput
              setBlankAnswer={setBlankAnswer}
              answer={currentQuestion.question}
            />
          </div>

          {showAnswer && (
            <div className="w-full p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Answer:</span>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{currentPercentage}% Match</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{blankAnswer}</p>
                <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Correct Answer:</span>
                  <p className="mt-1 text-green-600 dark:text-green-400 whitespace-pre-wrap">{currentQuestion.answer}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="default"
            size="lg"
            disabled={isChecking}
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <>
                {showAnswer ? "Next Question" : "Check Answer"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenEnded;
