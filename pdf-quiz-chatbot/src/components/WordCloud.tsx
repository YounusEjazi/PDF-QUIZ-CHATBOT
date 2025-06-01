"use client";
import React from 'react';
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
  const maxValue = Math.max(...formattedTopics.map(topic => topic.value));

  // Generate random positions within a circle
  const getPosition = (index: number) => {
    // Random angle and radius
    const angle = Math.random() * 2 * Math.PI;
    const radiusMax = typeof window !== 'undefined' && window.innerWidth < 768 ? 70 : 100; // Smaller radius for mobile
    const radiusMin = typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 30;  // Smaller min radius for mobile
    const radius = radiusMin + (Math.random() * (radiusMax - radiusMin));
    
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  // Responsive font size calculation
  const calculateFontSize = (size: number) => {
    const baseSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 14 : 16;
    const maxSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 24 : 32;
    return Math.max(baseSize, Math.min(maxSize, Math.floor(20 * size)));
  };

  return (
    <div className="relative w-full h-[280px] flex items-center justify-center overflow-hidden">
      {formattedTopics.map((topic, index) => {
        const size = (topic.value / maxValue) * (1.5 - 0.8) + 0.8;
        const fontSize = calculateFontSize(size);
        const position = getPosition(index);

        // Generate a warm gradient color based on size
        const baseHue = 45; // Yellow base
        const hue = baseHue + (size * 10); // Slight variation in yellow/amber
        const saturation = 85 + (size * 10); // More saturated for important topics
        const lightness = 50 + (size * 5); // Brighter for larger words

        return (
          <motion.div
            key={topic.text}
            className="absolute cursor-pointer"
            initial={{ 
              x: 0,
              y: 50,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              x: position.x,
              y: position.y,
              opacity: 1,
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 15,
              delay: index * 0.1
            }}
            whileHover={{ 
              scale: 1.1, // Reduced scale effect on hover
              zIndex: 10,
              transition: { duration: 0.2 }
            }}
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: size > 1.2 ? 700 : size > 1 ? 600 : 500,
            }}
            onClick={() => {
              router.push(`/quiz?topic=${encodeURIComponent(topic.text)}`);
            }}
          >
            <motion.div
              animate={{
                y: [-2, 2, -2],
                x: [-1, 1, -1],
              }}
              transition={{
                y: {
                  duration: 3 + Math.random(),
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x: {
                  duration: 4 + Math.random(),
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              }}
              className={`
                px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg
                backdrop-blur-md border border-yellow-200/20
                shadow-lg hover:shadow-yellow-500/30
                transition-all duration-300
                hover:border-yellow-500/30
                whitespace-nowrap
                text-yellow-900/90 dark:text-yellow-100/90
                text-sm sm:text-base
              `}
              style={{
                background: `linear-gradient(135deg, 
                  hsl(${hue}, ${saturation}%, ${lightness}%, 0.12) 0%,
                  hsl(${hue + 10}, ${saturation + 5}%, ${lightness + 5}%, 0.08) 100%)`
              }}
            >
              {topic.text}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WordCloud;
