"use client";
import { Game, Question } from "@prisma/client";
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";
import { differenceInSeconds } from "date-fns";
import { useRouter } from "next/navigation";
import { BarChart, ChevronRight, Loader2, Timer, Trophy } from "lucide-react";
import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import { cn, formatTimeDelta } from "@/lib/utils/utils";
import MCQCounter from "./MCQCounter";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "options" | "question">[] };
};

const MCQ = ({ game }: Props) => {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [hasEnded, setHasEnded] = React.useState(false);
  const [stats, setStats] = React.useState({
    correct_answers: 0,
    wrong_answers: 0,
  });
  const [selectedChoice, setSelectedChoice] = React.useState<number>(0);
  const [now, setNow] = React.useState(new Date());
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const { toast } = useToast();

  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const options = React.useMemo(() => {
    if (!currentQuestion?.options) return [];
    try {
      if (Array.isArray(currentQuestion.options)) {
        return currentQuestion.options;
      }
      const optionsStr = currentQuestion.options.toString()
        .replace(/'/g, '"')
        .replace(/\\/g, '');
      const parsed = JSON.parse(optionsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to parse options:", error, currentQuestion.options);
      return [];
    }
  }, [currentQuestion]);

  const { mutate: checkAnswer, isPending: isChecking } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userInput: options[selectedChoice],
      };
      const response = await axios.post(`/api/checkAnswer`, payload);
      return response.data;
    },
  });

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

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!hasEnded) {
        setNow(new Date());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasEnded]);

  const handleNext = React.useCallback(() => {
    if (!currentQuestion || !options || options.length === 0) {
      console.error("Invalid question or options:", { currentQuestion, options });
      toast({
        title: "Error",
        description: "No valid question or options found",
        variant: "destructive",
      });
      return;
    }

    if (showAnswer) {
      if (questionIndex === game.questions.length - 1) {
        endGame();
      } else {
        setQuestionIndex((prev) => prev + 1);
        setTimeout(() => {
          setShowAnswer(false);
          setSelectedChoice(0);
          setIsCorrect(null);
        }, 0);
      }
      return;
    }

    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }) => {
        setIsCorrect(isCorrect);
        setShowAnswer(true);
        if (isCorrect) {
          setStats((stats) => ({
            ...stats,
            correct_answers: stats.correct_answers + 1,
          }));
        } else {
          setStats((stats) => ({
            ...stats,
            wrong_answers: stats.wrong_answers + 1,
          }));
        }
      },
      onError: (error) => {
        console.error("Error checking answer:", error);
        toast({
          title: "Error",
          description: "Failed to check answer. Please try again.",
          variant: "destructive",
        });
      },
    });
  }, [checkAnswer, questionIndex, game.questions.length, toast, endGame, currentQuestion, options, showAnswer]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showAnswer) return;
      const key = event.key;
      if (key === "1") setSelectedChoice(0);
      else if (key === "2") setSelectedChoice(1);
      else if (key === "3") setSelectedChoice(2);
      else if (key === "4") setSelectedChoice(3);
      else if (key === "Enter") handleNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, showAnswer]);

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
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Time: {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
          </p>
          {isEnding ? (
            <div>
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
                <BarChart className="relative z-10 w-4 h-4" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/0 to-pink-600/0 hover:from-purple-600/20 hover:to-pink-600/20 transition-colors duration-200" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
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
        <MCQCounter
          correct_answers={stats.correct_answers}
          wrong_answers={stats.wrong_answers}
        />
      </div>

      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mt-4 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20">
              <CardTitle className="text-center text-gray-700 dark:text-gray-300">
                <div className="text-lg font-bold">{questionIndex + 1}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {game.questions.length}
                </div>
              </CardTitle>
            </div>
            <CardDescription className="flex-grow text-lg text-gray-700 dark:text-gray-300">
              {currentQuestion?.question}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-col items-center justify-center w-full mt-4 gap-3">
          <AnimatePresence mode="wait">
            {options.map((option, index) => (
              <motion.div
                key={`${questionIndex}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="w-full"
              >
                <Button
                  variant={selectedChoice === index ? "default" : "outline"}
                  className={cn(
                    "justify-start w-full py-8 relative group transition-all duration-200",
                    selectedChoice === index && !showAnswer && "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                    showAnswer && selectedChoice === index && isCorrect && "bg-gradient-to-r from-green-600 to-emerald-600 text-white",
                    showAnswer && selectedChoice === index && !isCorrect && "bg-gradient-to-r from-red-600 to-rose-600 text-white",
                    !showAnswer && "hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99]"
                  )}
                  onClick={() => !showAnswer && setSelectedChoice(index)}
                  disabled={showAnswer}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg" />
                  <div className="flex items-center justify-start gap-4">
                    <div className={cn(
                      "p-2 px-3 border rounded-lg transition-colors",
                      selectedChoice === index && !showAnswer && "border-white text-white",
                      showAnswer && selectedChoice === index && isCorrect && "border-white text-white",
                      showAnswer && selectedChoice === index && !isCorrect && "border-white text-white"
                    )}>
                      {index + 1}
                    </div>
                    <div className="text-start">{option}</div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MCQ;
