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
import { Sparkles } from "lucide-react";
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
      "group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-yellow-500/20",
      "backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-white/20"
    )}>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-yellow-600 to-amber-600 bg-clip-text text-transparent">
            Hot Topics
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Click on a topic to start a quiz on it
          </CardDescription>
        </div>
        <Sparkles 
          size={28} 
          strokeWidth={2.5}
          className="text-yellow-600 dark:text-yellow-400 transition-transform group-hover:scale-110" 
        />
      </CardHeader>

      <CardContent className="h-[320px] p-0">
        <div className="h-full rounded-md border border-white/10 overflow-hidden">
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