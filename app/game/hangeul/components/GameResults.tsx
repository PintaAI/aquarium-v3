import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface GameResultsProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  onRestart: () => void;
}

export function GameResults({ 
  score, 
  totalQuestions, 
  correctAnswers, 
  incorrectAnswers, 
  onRestart 
}: GameResultsProps) {
  // Calculate accuracy percentage
  const accuracy = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 0;
  
  // Determine performance message based on score
  let performanceMessage = "";
  if (accuracy >= 90) {
    performanceMessage = "Luar biasa! Kamu menguasai Hangeul dengan sangat baik!";
  } else if (accuracy >= 70) {
    performanceMessage = "Bagus sekali! Teruslah berlatih!";
  } else if (accuracy >= 50) {
    performanceMessage = "Terus belajar! Kamu semakin mahir!";
  } else {
    performanceMessage = "Jangan menyerah! Setiap latihan membuatmu lebih baik!";
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center flex flex-col items-center justify-center h-full"
    >
      <div className="mb-8">
        <h3 className="text-3xl font-bold mb-2">Game Selesai!</h3>
        <p className="text-muted-foreground">Inilah hasil belajar Hangeul-mu</p>
      </div>
      
      <div className="w-full max-w-sm mb-8">
        <div className="text-2xl font-bold flex justify-center items-baseline gap-2 mb-4">
          <span className="text-4xl text-primary">{score}</span>
          <span className="text-muted-foreground">/ {totalQuestions}</span>
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Akurasi</span>
          <span className="font-medium">{accuracy}%</span>
        </div>
        <Progress value={accuracy} className="h-2 mb-6" />
        
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-xl font-bold text-green-700 dark:text-green-300">
              {correctAnswers}
            </div>
            <div className="text-sm text-green-800 dark:text-green-400">
              Jawaban Benar
            </div>
          </div>
          
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-xl font-bold text-red-700 dark:text-red-300">
              {incorrectAnswers}
            </div>
            <div className="text-sm text-red-800 dark:text-red-400">
              Jawaban Salah
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-lg mb-6">{performanceMessage}</p>
      
      <Button onClick={onRestart} size="lg" className="text-lg px-6">
        Main Lagi!
      </Button>
    </motion.div>
  );
}
