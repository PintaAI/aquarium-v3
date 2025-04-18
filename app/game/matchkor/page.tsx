"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import MatchGame from "./components/MatchGame"
import GameSettings from "./components/GameSettings"
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
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <h2 className="text-2xl font-bold text-primary">Game Over!</h2>
              <p className="text-xl">Your final score: <span className="font-bold text-primary">{score}</span> points</p>
              <div className="space-x-4 pt-4">
                <button 
                  onClick={() => beginGame(difficulty)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                >
                  Play Again
                </button>
                <button 
                  onClick={returnToStart}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition"
                >
                  Return to Menu
                </button>
              </div>
            </div>
          )}
          
        </CardContent>
      </Card>
    </div>
  )
}
