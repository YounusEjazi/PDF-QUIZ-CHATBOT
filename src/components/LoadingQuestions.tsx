import React from "react";
import { Progress } from "./ui/progress";

type Props = { finished: boolean };

const loadingTexts = [
  "Generating questions...",
  "Unleashing the power of curiosity...",
  "Diving deep into the ocean of questions..",
  "Harnessing the collective knowledge of the cosmos...",
  "Igniting the flame of wonder and exploration...",
];

const LoadingQuestions = ({ finished }: Props) => {
  const [progress, setProgress] = React.useState(10);
  const [loadingText, setLoadingText] = React.useState(loadingTexts[0]);
  React.useEffect(() => {
    const interval = setInterval(() => {
      let randomIndex = Math.floor(Math.random() * loadingTexts.length);
      setLoadingText(loadingTexts[randomIndex]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (finished) return 100;
        if (prev === 100) {
          return 0;
        }
        if (Math.random() < 0.1) {
          return prev + 2;
        }
        return prev + 0.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [finished]);

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[70vw] md:w-[60vw] flex flex-col items-center">
      {/* Cool Loading Animation */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute w-full h-full border-4 border-transparent border-t-purple-600 border-r-pink-600 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        
        {/* Middle pulsing ring */}
        <div className="absolute w-3/4 h-3/4 border-4 border-transparent border-b-purple-500 border-l-pink-500 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute w-1/2 h-1/2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse opacity-75"></div>
        
        {/* Center dot */}
        <div className="absolute w-4 h-4 bg-white dark:bg-gray-900 rounded-full z-10"></div>
        
        {/* Orbiting dots */}
        <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-600 rounded-full"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-600 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-pink-500 rounded-full"></div>
        </div>
        
        {/* Additional orbiting elements at 45-degree angles */}
        <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-pink-400 rounded-full"></div>
        </div>
      </div>
      
      <Progress value={progress} className="w-full mt-4" />
      <h1 className="mt-2 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
        {loadingText}
      </h1>
    </div>
  );
};

export default LoadingQuestions;
