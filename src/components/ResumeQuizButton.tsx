"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type Props = {
  gameId: string;
  gameType: "mcq" | "open_ended";
  isCompleted?: boolean; // If true, only show Restart button (for completed quizzes)
};

export default function ResumeQuizButton({ gameId, gameType, isCompleted = false }: Props) {
  const router = useRouter();
  const [isRestarting, setIsRestarting] = useState(false);

  const handleResume = () => {
    const route = gameType === "mcq" 
      ? `/play/mcq/${gameId}`
      : `/play/open-ended/${gameId}`;
    router.push(route);
  };

  const handleRestart = async () => {
    try {
      setIsRestarting(true);
      const response = await axios.post(`/api/game/${gameId}/restart`);
      const newGameId = response.data.newGameId;
      toast.success("New quiz created from existing questions!");
      
      // Navigate to the new game
      const route = gameType === "mcq" 
        ? `/play/mcq/${newGameId}`
        : `/play/open-ended/${newGameId}`;
      router.push(route);
    } catch (error) {
      console.error("Error restarting quiz:", error);
      toast.error("Failed to restart quiz. Please try again.");
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {!isCompleted && (
        <Button
          onClick={handleResume}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md hover:shadow-lg transition-all"
        >
          <Play className="w-4 h-4 mr-1.5" />
          <span className="font-medium">Resume</span>
        </Button>
      )}
      <Button
        onClick={handleRestart}
        disabled={isRestarting}
        size="sm"
        variant={isCompleted ? "default" : "outline"}
        className={
          isCompleted
            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md hover:shadow-lg transition-all"
            : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
      >
        <RotateCcw className={`w-4 h-4 mr-1.5 ${isRestarting ? "animate-spin" : ""}`} />
        <span>{isCompleted ? "Retake Quiz" : "Restart"}</span>
      </Button>
    </div>
  );
}

