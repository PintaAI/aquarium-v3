"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface HangulCharacter {
  character: string;
  pronunciation: string;
}

const hangulCharacters: HangulCharacter[] = [
  // Konsonan
  { character: 'ㄱ', pronunciation: 'G' },
  { character: 'ㄴ', pronunciation: 'N' },
  { character: 'ㄷ', pronunciation: 'D' },
  { character: 'ㄹ', pronunciation: 'R/L' },
  { character: 'ㅁ', pronunciation: 'M' },
  { character: 'ㅂ', pronunciation: 'B' },
  { character: 'ㅅ', pronunciation: 'S' },
  { character: 'ㅇ', pronunciation: 'Diam/Ng' },
  { character: 'ㅈ', pronunciation: 'J' },
  { character: 'ㅊ', pronunciation: 'Ch' },
  { character: 'ㅋ', pronunciation: 'K' },
  { character: 'ㅌ', pronunciation: 'T' },
  { character: 'ㅍ', pronunciation: 'P' },
  { character: 'ㅎ', pronunciation: 'H' },

  // Vokal Tunggal Berdiri
  { character: 'ㅏ', pronunciation: 'A' },
  { character: 'ㅑ', pronunciation: 'Ya' },
  { character: 'ㅓ', pronunciation: 'Eo' },
  { character: 'ㅕ', pronunciation: 'Yeo' },

  // Vokal Tunggal Duduk
  { character: 'ㅜ', pronunciation: 'U' },
  { character: 'ㅠ', pronunciation: 'Yu' },
  { character: 'ㅗ', pronunciation: 'O' },
  { character: 'ㅛ', pronunciation: 'Yo' },
  { character: 'ㅡ', pronunciation: 'Eu' },

  // Vokal Rangkap Berdiri
  { character: 'ㅔ', pronunciation: 'E' },
  { character: 'ㅖ', pronunciation: 'Ye' },
  { character: 'ㅐ', pronunciation: 'Ae' },
  { character: 'ㅒ', pronunciation: 'Yae' },

  // Vokal Rangkap Duduk
  { character: 'ㅘ', pronunciation: 'Wa' },
  { character: 'ㅙ', pronunciation: 'Wae' },
  { character: 'ㅚ', pronunciation: 'Oe/We' },
  { character: 'ㅝ', pronunciation: 'Weo/Wo' },
  { character: 'ㅞ', pronunciation: 'We' },
  { character: 'ㅟ', pronunciation: 'Wi' },
  { character: 'ㅢ', pronunciation: 'Ui/Eui' }
];

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 10; // detik
const FEEDBACK_DURATION = 1500; // milidetik

export default function HangeulGame() {
  const [currentChar, setCurrentChar] = useState<HangulCharacter | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_PER_QUESTION);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    generateQuestion();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      handleNextQuestion();
    }
  }, [timeLeft, gameOver]);

  const generateQuestion = () => {
    const randomChar = hangulCharacters[Math.floor(Math.random() * hangulCharacters.length)];
    setCurrentChar(randomChar);

    const tempOptions = new Set<string>();
    tempOptions.add(randomChar.pronunciation);

    while (tempOptions.size < 4) {
      const randomOption = hangulCharacters[Math.floor(Math.random() * hangulCharacters.length)].pronunciation;
      tempOptions.add(randomOption);
    }

    setOptions(shuffleArray(Array.from(tempOptions)));
    setFeedback('');
    setTimeLeft(TIME_PER_QUESTION);
  };

  const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleOptionClick = (option: string, index: number) => {
    if (buttonRefs.current[index]) {
      buttonRefs.current[index]?.blur();
    }

    if (option === currentChar?.pronunciation) {
      setFeedback('Benar!');
      setScore(score + 1);
    } else {
      setFeedback(`Salah! jawaban yang benar adalah ${currentChar?.pronunciation}.`);
    }
    
    setTimeout(() => {
      setFeedback('');
      handleNextQuestion();
    }, FEEDBACK_DURATION);
  };

  const handleNextQuestion = () => {
    if (questionNumber < TOTAL_QUESTIONS) {
      setQuestionNumber(questionNumber + 1);
      generateQuestion();
    } else {
      setGameOver(true);
      triggerConfetti();
    }
  };

  const restartGame = () => {
    setScore(0);
    setQuestionNumber(1);
    setGameOver(false);
    generateQuestion();
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-2xl mx-auto">
      <Card className="w-full h-[550px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <h2 className="text-2xl text-center font-bold">한글 러시 | Hangeul Rush</h2>
          {!gameOver && (
            <div className="mt-2">
              <Progress value={(questionNumber / TOTAL_QUESTIONS) * 100} className="w-full" />
              <div className="flex justify-between mt-2">
                <span>Pertanyaan {questionNumber}/{TOTAL_QUESTIONS}</span>
                <span>Waktu tersisa: {timeLeft}dtk</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {!gameOver ? (
              currentChar && (
                <motion.div
                  key={currentChar.character}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center h-full justify-between"
                >
                  <div className="text-8xl font-bold my-6 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                    {currentChar.character}
                  </div>
                  <AnimatePresence>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`text-center p-3 rounded-lg mb-4 w-full ${
                          feedback === 'Benar!' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <p className="text-xl font-semibold">{feedback}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {options.map((option, index) => (
                      <Button
                        key={index}
                        ref={(el) => {
                          buttonRefs.current[index] = el;
                        }}
                        onClick={() => handleOptionClick(option, index)}
                        variant="outline"
                        className="w-full text-lg py-6 bg-white text-black hover:bg-blue-100 hover:text-blue-800 focus:bg-blue-100 focus:text-blue-800 transition-colors"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center flex flex-col items-center justify-center h-full"
              >
                <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
                <p className="text-xl mb-4">Skor mu adalah: {score}/{TOTAL_QUESTIONS}</p>
                <Button onClick={restartGame} className="text-lg py-2 px-4">
                  Main Lagi !
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {!gameOver && (
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold">Score: {score}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
