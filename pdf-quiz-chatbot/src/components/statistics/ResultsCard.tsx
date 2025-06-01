"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type Props = { accuracy: number };

const ResultsCard = ({ accuracy }: Props) => {
  const getResultConfig = (accuracy: number) => {
    if (accuracy > 75) {
      return {
        icon: <Trophy className="w-16 h-16 md:w-20 md:h-20" stroke="gold" fill="rgba(234, 179, 8, 0.2)" />,
        title: "Impressive!",
        color: "text-yellow-400 dark:text-yellow-300",
        message: "> 75% accuracy",
        gradient: "from-yellow-400/20 to-amber-500/20 dark:from-yellow-300/10 dark:to-amber-400/10"
      };
    } else if (accuracy > 25) {
      return {
        icon: <Trophy className="w-16 h-16 md:w-20 md:h-20" stroke="silver" fill="rgba(156, 163, 175, 0.2)" />,
        title: "Good job!",
        color: "text-gray-400 dark:text-gray-300",
        message: "> 25% accuracy",
        gradient: "from-gray-400/20 to-slate-500/20 dark:from-gray-300/10 dark:to-slate-400/10"
      };
    } else {
      return {
        icon: <Trophy className="w-16 h-16 md:w-20 md:h-20" stroke="brown" fill="rgba(120, 53, 15, 0.2)" />,
        title: "Nice try!",
        color: "text-yellow-800 dark:text-yellow-700",
        message: "< 25% accuracy",
        gradient: "from-yellow-800/20 to-amber-900/20 dark:from-yellow-700/10 dark:to-amber-800/10"
      };
    }
  };

  const config = getResultConfig(accuracy);

  return (
    <Card className="md:col-span-7 overflow-hidden">
      <CardHeader className="relative pb-7">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Results
          </CardTitle>
          <motion.div
            initial={{ rotate: -45 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 dark:from-purple-400/5 dark:to-pink-400/5" />
      </CardHeader>

      <CardContent>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 p-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={cn(
                "absolute inset-0 rounded-full bg-gradient-to-r",
                config.gradient
              )}
              style={{ filter: "blur(20px)" }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {config.icon}
            </motion.div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={cn("text-2xl md:text-3xl font-bold", config.color)}
            >
              {config.title}
            </motion.span>
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-base text-gray-500 dark:text-gray-400"
            >
              {config.message}
            </motion.span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full h-2 mt-4 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 dark:from-purple-400/20 dark:to-pink-400/20"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400"
                )}
              />
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default ResultsCard;
