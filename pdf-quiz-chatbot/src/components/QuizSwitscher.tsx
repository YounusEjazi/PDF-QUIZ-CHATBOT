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
    <div className="flex flex-col items-center w-full min-h-screen py-10 px-4">
      {isPDFMode ? (
        <PDFQuizCreation toggleMode={toggleMode} />
      ) : (
        <QuizCreation topic={topic} toggleMode={toggleMode} />
      )}
    </div>
  );
};

export default QuizSwitcher;
