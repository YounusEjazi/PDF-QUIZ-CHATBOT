"use client";

import React, { useState } from "react";
import QuizCreation from "@/components/forms/QuizCreation";
import PDFQuizCreation from "@/components/forms/PDFQuizCreation";

const QuizSwitcher = ({ topic }: { topic: string }) => {
  const [isPDFMode, setIsPDFMode] = useState(false);

  const toggleMode = () => {
    setIsPDFMode((prev) => !prev);
  };

  return (
    <div className="flex-1 w-full max-w-screen-xl mx-auto pt-20 pb-16 px-4 sm:px-6 md:px-8">
      <div className="relative min-h-[calc(100vh-9rem)] flex items-center justify-center">
        {isPDFMode ? (
          <PDFQuizCreation toggleMode={toggleMode} />
        ) : (
          <QuizCreation topic={topic} toggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};

export default QuizSwitcher;
