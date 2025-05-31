import React from "react";

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
      <div className="text-red-500">
        Error: Question format is invalid. Please contact support.
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full mt-4">
      <div className="text-xl font-semibold flex items-center flex-wrap">
        <span>{parts[0]}</span>
        <input
          id="user-blank-input"
          className="text-center border-b-2 border-black dark:border-white w-40 focus:border-2 focus:border-b-4 focus:outline-none mx-2 px-2 bg-transparent"
          type="text"
          placeholder="Enter answer"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          autoFocus
        />
        <span>{parts[1]}</span>
      </div>
    </div>
  );
};

export default BlankAnswerInput;
