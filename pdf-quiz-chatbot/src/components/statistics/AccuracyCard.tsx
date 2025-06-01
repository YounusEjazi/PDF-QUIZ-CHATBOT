"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type Props = {
  accuracy: number;
};

const AccuracyCard = ({ accuracy }: Props) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 6;
  
  // Format accuracy to at most 1 decimal place
  const formattedAccuracy = Math.round(accuracy * 10) / 10;

  return (
    <Card className="md:col-span-3 overflow-hidden">
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
            Accuracy
          </CardTitle>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 dark:from-emerald-400/5 dark:to-teal-400/5" />
      </CardHeader>

      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center p-6"
        >
          <div className="relative w-32 h-32 md:w-36 md:h-36">
            {/* SVG container with proper viewBox */}
            <svg 
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 100 100"
              style={{ 
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
              }}
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                className="text-gray-200 dark:text-gray-800"
              />
              {/* Animated progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (accuracy / 100) * circumference }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>

            {/* Gradient definition */}
            <svg width="0" height="0">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" />
                  <stop offset="100%" stopColor="rgb(20, 184, 166)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered text */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formattedAccuracy}%
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {accuracy >= 75 ? "Excellent" : accuracy >= 50 ? "Good" : "Keep practicing"}
            </p>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default AccuracyCard;
