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
    <div className="relative flex flex-col items-center justify-center h-screen">
      {!isPDFMode ? (
        <QuizCreation topic={topic} toggleMode={toggleMode} />
      ) : (
        <PDFQuizCreation toggleMode={toggleMode} />
      )}
    </div>
  );
};

export default QuizSwitcher;
