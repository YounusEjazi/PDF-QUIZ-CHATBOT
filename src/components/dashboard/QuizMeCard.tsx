"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { BrainCircuit, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type Props = {};

const QuizMeCard = (props: Props) => {
  const router = useRouter();
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50",
        "border border-purple-200/50 dark:border-purple-800/50",
        "hover:shadow-xl hover:shadow-purple-500/25"
      )}
      onClick={() => {
        router.push("/quiz");
      }}
    >
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-4 right-4 w-16 h-16 bg-purple-400 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-pink-400 rounded-full blur-xl animate-pulse animation-delay-1000" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
        <CardTitle className="text-2xl font-bold bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-300 dark:via-purple-200 dark:to-pink-300">
          Quiz me!
        </CardTitle>
        <div className="relative">
          <BrainCircuit 
            size={32} 
            strokeWidth={2.5}
            className="text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
          />
          <Sparkles 
            size={16} 
            className="absolute -top-1 -right-1 text-pink-500 dark:text-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" 
          />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Challenge yourself to a quiz with a topic of your choice. Test your knowledge and learn something new!
        </p>
        <div className="mt-4 flex items-center text-xs text-purple-600 dark:text-purple-400 font-medium">
          <span className="mr-2">🚀</span>
          Ready to start?
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizMeCard;
