"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

type Props = {
  formattedTopics: {
    text: string;
    value: number;
  }[];
};

const WordCloud = ({ formattedTopics }: Props) => {
  const router = useRouter();
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const maxValue = Math.max(...formattedTopics.map(topic => topic.value));

  // Create a beautiful grid layout
  const createGridLayout = () => {
    const words = [...formattedTopics];
    const cols = 3;
    const rows = Math.ceil(words.length / cols);
    const layout: Array<{ word: any; row: number; col: number }> = [];

    words.forEach((word, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      layout.push({ word, row, col });
    });

    return layout;
  };

  const gridLayout = createGridLayout();

  // Generate beautiful colors
  const getWordStyle = (value: number, isHovered: boolean) => {
    const normalizedValue = value / maxValue;
    
    // Create a beautiful gradient from orange to red
    const hue = 25 + (normalizedValue * 35); // Orange to red
    const saturation = 85 + (normalizedValue * 10);
    const lightness = 60 - (normalizedValue * 15);
    
    const baseColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const hoverColor = `hsl(${hue}, ${saturation + 5}%, ${lightness + 5}%)`;
    
    return {
      background: isHovered 
        ? `linear-gradient(135deg, ${hoverColor}20, ${baseColor}15)`
        : `linear-gradient(135deg, ${baseColor}15, ${baseColor}10)`,
      borderColor: isHovered ? `${baseColor}40` : `${baseColor}25`,
      textColor: baseColor,
      fontSize: Math.max(14, Math.min(24, 16 + normalizedValue * 8)),
      fontWeight: normalizedValue > 0.7 ? 700 : normalizedValue > 0.4 ? 600 : 500,
    };
  };

  return (
    <div className="relative w-full h-[280px] p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 w-16 h-16 bg-orange-400 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-red-400 rounded-full blur-xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400 rounded-full blur-xl animate-pulse animation-delay-2000" />
      </div>

      {/* Words Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-3 h-full">
        {gridLayout.map(({ word, row, col }, index) => {
          const isHovered = hoveredWord === word.text;
          const style = getWordStyle(word.value, isHovered);
          
          return (
            <motion.div
              key={word.text}
              className="flex items-center justify-center"
              initial={{ 
                opacity: 0, 
                scale: 0.8,
                y: 20
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHoveredWord(word.text)}
              onHoverEnd={() => setHoveredWord(null)}
              onClick={() => {
                router.push(`/quiz?topic=${encodeURIComponent(word.text)}`);
              }}
            >
              <motion.div
                className={`
                  relative cursor-pointer rounded-xl px-3 py-2
                  border-2 backdrop-blur-sm shadow-lg
                  transition-all duration-300 ease-out
                  transform-gpu
                  ${isHovered ? 'shadow-xl' : 'shadow-md'}
                `}
                style={{
                  background: style.background,
                  borderColor: style.borderColor,
                  color: style.textColor,
                  fontSize: `${style.fontSize}px`,
                  fontWeight: style.fontWeight,
                }}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                {/* Hover glow effect */}
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `radial-gradient(circle, ${style.textColor}20 0%, transparent 70%)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                {/* Word text */}
                <span className="relative z-10 whitespace-nowrap">
                  {word.text}
                </span>
                
                {/* Value indicator */}
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: style.textColor,
                    color: 'white',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {word.value}
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive hint */}
      <motion.div
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 dark:text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        💡 Click any topic to start a quiz
      </motion.div>
    </div>
  );
};

export default WordCloud;
