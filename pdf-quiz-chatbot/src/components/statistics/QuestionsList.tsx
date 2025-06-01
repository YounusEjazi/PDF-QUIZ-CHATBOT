"use client";
import React from "react";
import { motion } from "framer-motion";
import { Question } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/utils";
import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  questions: Question[];
};

const QuestionsList = ({ questions }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 rounded-xl overflow-hidden border bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg"
    >
      <Table>
        <TableCaption>Your answers from the quiz.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
            <TableHead>Question & Your Answer</TableHead>
            <TableHead className="w-[150px] text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question, index) => (
            <motion.tr
              key={question.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                question.isCorrect
                  ? "bg-green-50/50 dark:bg-green-900/10"
                  : "bg-red-50/50 dark:bg-red-900/10"
              )}
            >
              <TableCell className="font-medium text-center">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="font-medium text-gray-900 dark:text-gray-100"
                  >
                    {question.question}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className={cn(
                      "text-sm",
                      question.isCorrect
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    Your answer: {question.userAnswer}
                  </motion.p>
                  {!question.isCorrect && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      Correct answer: {question.answer}
                    </motion.p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      delay: index * 0.1 + 0.2,
                    }}
                  >
                    {question.isCorrect ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Correct</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Incorrect</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default QuestionsList;
