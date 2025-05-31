"use client";
import { cn, formatTimeDelta } from "@/lib/utils";
import { Game, Question } from "@prisma/client";
import { differenceInSeconds } from "date-fns";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
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
import Link from "next/link";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "question" | "answer">[] };
};

interface CheckAnswerResponse {
  percentageSimilar: number;
}

const OpenEnded = ({ game }: Props) => {
  const [hasEnded, setHasEnded] = React.useState(false);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [blankAnswer, setBlankAnswer] = React.useState("");
  const [averagePercentage, setAveragePercentage] = React.useState(0);
  const [totalCorrect, setTotalCorrect] = React.useState(0);

  console.log("Total questions:", game.questions.length);
  console.log("Current question index:", questionIndex);

  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof endGameSchema> = {
        gameId: game.id,
      };
      const response = await axios.post(`/api/endGame`, payload);
      return response.data;
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
    if (questionIndex < game.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setBlankAnswer("");
    } else {
      endGame();
      setHasEnded(true);
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
        const isCorrectEnough = percentageSimilar >= 70;
        if (isCorrectEnough) {
          setTotalCorrect(prev => prev + 1);
        }

        toast({
          title: isCorrectEnough ? "Correct!" : "Not quite right",
          description: `The correct answer was: ${currentQuestion.answer}`,
          variant: isCorrectEnough ? "default" : "destructive",
        });

        setAveragePercentage(prev => {
          const newTotal = prev * questionIndex + percentageSimilar;
          return newTotal / (questionIndex + 1);
        });

        moveToNextQuestion();
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
  }, [checkAnswer, currentQuestion, blankAnswer, toast, questionIndex, moveToNextQuestion]);

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
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <div className="px-4 py-2 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You completed {game.questions.length} questions in{" "}
          {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
        </div>
        <div className="px-4 py-2 mt-2 font-semibold text-white bg-blue-500 rounded-md whitespace-nowrap">
          You got {totalCorrect} out of {game.questions.length} correct! ({Math.round(averagePercentage)}% average)
        </div>
        <Link
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <div className="px-4 py-2 mt-2 font-semibold text-red-500 rounded-md whitespace-nowrap">
          No questions found
        </div>
      </div>
    );
  }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <p>
            <span className="text-slate-400">Topic</span> &nbsp;
            <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
              {game.topic}
            </span>
          </p>
          <div className="flex self-start mt-3 text-slate-400">
            <Timer className="mr-2" />
            {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
          </div>
        </div>
        <OpenEndedPercentage percentage={Math.round(averagePercentage)} />
      </div>
      <Card className="w-full mt-4">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
            <div>{questionIndex + 1}</div>
            <div className="text-base text-slate-400">
              {game.questions.length}
            </div>
          </CardTitle>
          <CardDescription className="flex-grow text-lg">
            Fill in the blank in the following sentence:
          </CardDescription>
        </CardHeader>
        <div className="p-4 pt-0">
          <p className="text-lg font-medium">{currentQuestion.question}</p>
        </div>
      </Card>
      <div className="flex flex-col items-center justify-center w-full mt-4">
        <BlankAnswerInput
          setBlankAnswer={setBlankAnswer}
          answer={currentQuestion.question}
        />
        <Button
          variant="outline"
          className="mt-4"
          disabled={isChecking || hasEnded}
          onClick={handleNext}
        >
          {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OpenEnded;
