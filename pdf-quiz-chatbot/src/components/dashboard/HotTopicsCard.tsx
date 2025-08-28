"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WordCloud from "../WordCloud";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { motion as m } from "framer-motion";

type Props = {
  topics?: {
    topic: string;
    count: number;
  }[];
};

const HotTopicsCard = ({ topics = [] }: Props) => {
  // Randomly select 10 topics and format them
  const randomTopics = React.useMemo(() => {
    const shuffled = [...topics].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10).map(topic => ({
      text: topic.topic,
      value: topic.count
    }));
  }, [topics]);

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50",
      "border border-orange-200/50 dark:border-orange-800/50",
      "hover:shadow-xl hover:shadow-orange-500/25 hover:scale-[1.02]"
    )}>
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-4 right-4 w-16 h-16 bg-orange-400 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-red-400 rounded-full blur-xl animate-pulse animation-delay-1000" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-orange-700 via-orange-600 to-red-600 bg-clip-text text-transparent dark:from-orange-300 dark:via-orange-200 dark:to-red-300">
            Hot Topics
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Click on a topic to start a quiz on it
          </CardDescription>
        </div>
        <div className="relative">
          <TrendingUp 
            size={32} 
            strokeWidth={2.5}
            className="text-orange-600 dark:text-orange-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
          />
          <Zap 
            size={16} 
            className="absolute -top-1 -right-1 text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" 
          />
        </div>
      </CardHeader>

      <CardContent className="h-[320px] p-0 relative z-10">
        <div className="h-full rounded-lg border border-orange-200/30 dark:border-orange-800/30 overflow-hidden bg-white/50 dark:bg-slate-900/50">
          <div className="p-4">
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <WordCloud formattedTopics={randomTopics} />
            </m.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotTopicsCard; 