"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils/utils";

type Props = {
  timeStarted: Date;
  timeEnded: Date;
};

const TimeTakenCard = ({ timeStarted, timeEnded }: Props) => {
  const timeDiffInSeconds = differenceInSeconds(timeEnded, timeStarted);
  const minutes = Math.floor(timeDiffInSeconds / 60);
  const seconds = timeDiffInSeconds % 60;
  const formattedTime = `${minutes}m ${seconds}s`;

  const getTimeRating = (seconds: number) => {
    if (seconds < 60) return { text: "Lightning Fast!", color: "text-blue-500 dark:text-blue-400" };
    if (seconds < 120) return { text: "Quick Thinking!", color: "text-cyan-500 dark:text-cyan-400" };
    if (seconds < 300) return { text: "Well Paced!", color: "text-teal-500 dark:text-teal-400" };
    return { text: "Thorough!", color: "text-sky-500 dark:text-sky-400" };
  };

  const timeRating = getTimeRating(timeDiffInSeconds);

  return (
    <Card className="md:col-span-4 overflow-hidden">
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
            Time Taken
          </CardTitle>
          <motion.div
            initial={{ rotate: 180 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 dark:from-blue-400/5 dark:to-cyan-400/5" />
      </CardHeader>

      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center p-6 space-y-4"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 dark:from-blue-400/10 dark:to-cyan-400/10 blur-xl"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative z-10 text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400"
            >
              {formattedTime}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={cn("text-lg font-semibold", timeRating.color)}
            >
              {timeRating.text}
            </motion.span>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            >
              Total Quiz Duration
            </motion.p>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TimeTakenCard;
