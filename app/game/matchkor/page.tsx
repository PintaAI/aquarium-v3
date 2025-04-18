"use client"

import { useState } from "react";
import { Card, CardContent,  CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { IoReloadOutline, IoHomeOutline } from "react-icons/io5";
import MatchGame from "./components/MatchGame";
import GameSettings from "./components/GameSettings";
import StartScreen from "./components/StartScreen"

export default function MatchKorPage() {
  const [gameState, setGameState] = useState<"start" | "settings" | "playing" | "finished">("start")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [score, setScore] = useState(0)
  
  const startGame = () => {
    setGameState("settings")
  }
  
  const beginGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty)
    setGameState("playing")
    setScore(0)
  }
  
  const endGame = (finalScore: number) => {
    setScore(finalScore)
    setGameState("finished")
  }
  
  const returnToStart = () => {
    setGameState("start")
  }
  
  return (
    <div className="container mx-auto max-w-5xl">
      <Card className="h-[calc(100vh-140px)] md:h-[calc(100vh-230px)] border-0">
        <CardContent className="h-full p-0">
          {gameState === "start" && (
            <StartScreen onStart={startGame} />
          )}
          
          {gameState === "settings" && (
            <GameSettings onStart={beginGame} />
          )}
          
          {gameState === "playing" && (
            <MatchGame 
              difficulty={difficulty} 
              onGameEnd={endGame} 
            />
          )}

          {gameState === "finished" && (
            <Card className="w-full h-full flex flex-col shadow-lg bg-gradient-to-b from-muted/30 to-background">
              {/* Removed CardHeader */}
              <CardContent className="flex-grow flex flex-col items-center justify-center gap-6 pt-12"> {/* Adjusted gap and added padding-top */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4" // Added margin-bottom for spacing
                >
                  <CardTitle className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                    Permainan Selesai!
                  </CardTitle>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-2xl mb-4">
                    Skor:{" "}
                    <span className="font-bold text-primary">{score}</span> poin
                  </p>
                  <div className="flex justify-center gap-4 pt-6">
                    <Button
                      onClick={() => beginGame(difficulty)}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 px-6 py-3 text-base"
                    >
                      <IoReloadOutline className="mr-2 h-5 w-5" />
                      Main Lagi
                    </Button>
                    <Button
                      onClick={returnToStart}
                      variant="outline"
                      size="lg"
                      className="px-6 py-3 text-base"
                    >
                      <IoHomeOutline className="mr-2 h-5 w-5" />
                      Kembali
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
