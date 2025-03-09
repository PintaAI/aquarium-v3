import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackDisplayProps {
  message: string;
  isCorrect: boolean | null;
}

export function FeedbackDisplay({ message, isCorrect }: FeedbackDisplayProps) {
  if (!message) return null;
  
  // Determine background and text colors based on correctness
  const bgColor = 
    isCorrect === true ? 'bg-green-100/80 dark:bg-green-900/70' : 
    isCorrect === false ? 'bg-red-100/80 dark:bg-red-900/70' : 
    'bg-blue-100/80 dark:bg-blue-900/70';
    
  const textColor = 
    isCorrect === true ? 'text-green-800 dark:text-green-200' : 
    isCorrect === false ? 'text-red-800 dark:text-red-200' : 
    'text-blue-800 dark:text-blue-200';
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`text-center p-4 rounded-lg w-full backdrop-blur-sm shadow-md ${bgColor} ${textColor}`}
      >
        <p className="text-xl font-semibold">{message}</p>
      </motion.div>
    </AnimatePresence>
  );
}
