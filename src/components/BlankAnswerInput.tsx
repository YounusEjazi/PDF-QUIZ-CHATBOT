import React from "react";
import { cn } from "@/lib/utils/utils";

type Props = {
  answer: string;
  setBlankAnswer: React.Dispatch<React.SetStateAction<string>>;
};

const BlankAnswerInput = ({ answer, setBlankAnswer }: Props) => {
  const [parts, setParts] = React.useState<string[]>([]);
  const [userInput, setUserInput] = React.useState("");

  React.useEffect(() => {
    // Ensure we have a valid question with exactly one blank
    if (answer && answer.includes("_____")) {
      const newParts = answer.split("_____");
      if (newParts.length === 2) {
        setParts(newParts);
      } else {
        console.error("Question format error: Multiple or no blanks found");
      }
    } else {
      console.error("Question format error: No blank found in:", answer);
    }
  }, [answer]);

  // Update the blank answer whenever user input changes
  React.useEffect(() => {
    setBlankAnswer(userInput.trim());
  }, [userInput, setBlankAnswer]);

  if (parts.length !== 2) {
    return (
      <div className="p-4 text-center bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20">
        <p className="text-red-600 dark:text-red-400 font-medium">
          Error: Question format is invalid. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <div className="text-lg text-gray-700 dark:text-gray-300 flex items-center flex-wrap gap-2">
        <span className="whitespace-pre-wrap">{parts[0]}</span>
        <input
          id="user-blank-input"
          className={cn(
            "min-w-[120px] w-auto px-4 py-2 rounded-lg",
            "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
            "border border-gray-200/50 dark:border-gray-700/50",
            "text-center text-purple-600 dark:text-purple-400 placeholder-gray-400 dark:placeholder-gray-600",
            "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
            "transition-all duration-200"
          )}
          type="text"
          placeholder="Type your answer"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          autoFocus
        />
        <span className="whitespace-pre-wrap">{parts[1]}</span>
      </div>
    </div>
  );
};

export default BlankAnswerInput;
