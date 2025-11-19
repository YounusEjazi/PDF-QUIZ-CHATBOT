"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { History, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type Props = {};

const HistoryCard = (props: Props) => {
  const router = useRouter();
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50",
        "border border-blue-200/50 dark:border-blue-800/50",
        "hover:shadow-xl hover:shadow-blue-500/25"
      )}
      onClick={() => {
        router.push("/history");
      }}
    >
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-4 right-4 w-16 h-16 bg-blue-400 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-cyan-400 rounded-full blur-xl animate-pulse animation-delay-1000" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
        <CardTitle className="text-2xl font-bold bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-300 dark:via-blue-200 dark:to-cyan-300">
          History
        </CardTitle>
        <div className="relative">
          <History 
            size={32} 
            strokeWidth={2.5}
            className="text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
          />
          <Clock 
            size={16} 
            className="absolute -top-1 -right-1 text-cyan-500 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" 
          />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          View past quiz attempts and track your progress over time. Analyze your performance and see how you've improved!
        </p>
        <div className="mt-4 flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
          <TrendingUp size={14} className="mr-2" />
          Track your progress
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryCard;
