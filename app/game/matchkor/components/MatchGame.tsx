"use client"

import { useState, useEffect, useCallback } from "react"
import { Progress } from "@/components/ui/progress"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"


interface MatchGameProps {
  difficulty: "easy" | "medium" | "hard"
  onGameEnd: (score: number) => void
}

type Card = {
  id: number
  content: string
  type: "korean" | "indonesian"
  matchId: number
  isFlipped: boolean
  isMatched: boolean
}

// Sample vocabulary data (would be better to fetch from API in real application)
const vocabularyPairs = [
  { korean: "안녕하세요", indonesian: "Halo" },
  { korean: "감사합니다", indonesian: "Terima kasih" },
  { korean: "사랑해요", indonesian: "Saya cinta kamu" },
  { korean: "미안해요", indonesian: "Maaf" },
  { korean: "잘 먹겠습니다", indonesian: "Selamat makan" },
  { korean: "잘 자요", indonesian: "Selamat tidur" },
  { korean: "이름", indonesian: "Nama" },
  { korean: "학생", indonesian: "Murid" },
  { korean: "선생님", indonesian: "Guru" },
  { korean: "친구", indonesian: "Teman" },
  { korean: "가족", indonesian: "Keluarga" },
  { korean: "책", indonesian: "Buku" },
  { korean: "학교", indonesian: "Sekolah" },
  { korean: "집", indonesian: "Rumah" },
  { korean: "음식", indonesian: "Makanan" },
  { korean: "물", indonesian: "Air" },
  { korean: "커피", indonesian: "Kopi" },
  { korean: "시간", indonesian: "Waktu" },
  { korean: "날씨", indonesian: "Cuaca" },
  { korean: "좋아요", indonesian: "Suka" }
]

export default function MatchGame({ difficulty, onGameEnd }: MatchGameProps) {
  // Game configuration based on difficulty
  const getDifficultySettings = () => {
    switch (difficulty) {
      case "easy":
        return { pairs: 8, timeLimit: 120 } // 2 minutes
      case "medium":
        return { pairs: 12, timeLimit: 180 } // 3 minutes
      case "hard":
        return { pairs: 16, timeLimit: 240 } // 4 minutes
    }
  }

  const { pairs, timeLimit } = getDifficultySettings()

  // Game state
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit)
  const [gameActive, setGameActive] = useState<boolean>(true)
  
  // End game function wrapped in useCallback
  const endGame = useCallback(() => {
    setGameActive(false)
    onGameEnd(score)
  }, [score, onGameEnd])
  
  // Initialize game
  useEffect(() => {
    const selectedVocab = [...vocabularyPairs]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairs)
    
    const gameCards: Card[] = []
    
    selectedVocab.forEach((pair, index) => {
      // Korean card
      gameCards.push({
        id: index * 2,
        content: pair.korean,
        type: "korean",
        matchId: index,
        isFlipped: false,
        isMatched: false
      })
      
      // Indonesian card
      gameCards.push({
        id: index * 2 + 1,
        content: pair.indonesian,
        type: "indonesian",
        matchId: index,
        isFlipped: false,
        isMatched: false
      })
    })
    
    // Shuffle cards
    setCards(gameCards.sort(() => Math.random() - 0.5))
  }, [pairs])
  
  // Game timer
  useEffect(() => {
    if (!gameActive) return
    
    let timeoutId: NodeJS.Timeout

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Schedule endGame to run after state update
          timeoutId = setTimeout(endGame, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      clearInterval(timer)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [gameActive, endGame])
  
  // Store final score for win condition
  const [finalScore, setFinalScore] = useState<number | null>(null)

  // Check for win condition
  useEffect(() => {
    if (matchedPairs === pairs && pairs > 0) {
      const timeBonus = Math.floor(timeRemaining * 0.5)
      const newFinalScore = score + timeBonus
      
      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      setGameActive(false)
      setFinalScore(newFinalScore)
    }
  }, [matchedPairs, pairs, score, timeRemaining])

  // Handle game end separately
  useEffect(() => {
    if (finalScore !== null) {
      const timer = setTimeout(() => {
        onGameEnd(finalScore)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [finalScore, onGameEnd])
  
  // Helper functions for card management
  const markAsMatched = (a: number, b: number) => {
    setCards(cs => cs.map(c =>
      (c.id === a || c.id === b)
        ? { ...c, isMatched: true, isFlipped: true }
        : c
    ))
    setMatchedPairs(prev => prev + 1)
    setScore(prev => prev + 10) // Award 10 points per match
  }

  const flipBack = (a: number, b: number) =>
    setCards(cs => cs.map(c =>
      (c.id === a || c.id === b)
        ? { ...c, isFlipped: false }
        : c
    ))

  const resetFlips = () =>
    setFlippedCards([])

  // Check for matches whenever flippedCards changes
  useEffect(() => {
    if (flippedCards.length !== 2) return
    
    const [a, b] = flippedCards
    const cardA = cards.find(c => c.id === a)!
    const cardB = cards.find(c => c.id === b)!
    
    if (cardA.matchId === cardB.matchId) {
      // matched!
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      setTimeout(() => {
        markAsMatched(a, b)
        resetFlips()
      }, 500)
    } else {
      // not a match: flip back
      setTimeout(() => {
        flipBack(a, b)
        resetFlips()
      }, 1000)
    }
  }, [flippedCards, cards])

  // Handle card click
  const handleCardClick = (id: number) => {
    if (!gameActive) return
    
    // Prevent clicking on already flipped or matched cards
    if (
      flippedCards.length >= 2 || 
      flippedCards.includes(id) || 
      cards.find(card => card.id === id)?.isMatched
    ) {
      return
    }
    
    // Flip the card
    setCards(prev => 
      prev.map(card => 
        card.id === id ? { ...card, isFlipped: true } : card
      )
    )
    
    // Add to flipped cards
    setFlippedCards(prev => [...prev, id])
  }
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }
  
  return (
    <div className="h-full flex flex-col p-6">
      {/* Game stats */}
      <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-muted/30 via-transparent to-muted/30 rounded-xl mb-8">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm font-medium mb-1.5">Waktu</p>
            <div className="flex items-center gap-3">
              <Progress 
                value={(timeRemaining / timeLimit) * 100} 
                className="w-36 h-2.5"
              />
              <span className="text-sm font-mono font-medium">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          
          <div className="border-l border-border/50 pl-6">
            <p className="text-sm font-medium mb-1.5">Progress</p>
            <p className="font-medium">
              <span className="text-primary">{matchedPairs}</span>
              <span className="text-muted-foreground">/{pairs}</span>
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-1.5">Skor</p>
          <p className="text-xl font-bold text-primary">{score}</p>
        </div>
      </div>
      
      {/* Game board */}
      <div className="flex-grow flex items-center justify-center px-2">
        <div className={`grid gap-3 md:gap-4 place-items-center ${ // Increased base gap from gap-2 to gap-3
          difficulty === "easy" 
            ? "grid-cols-4 max-w-[360px] md:max-w-[400px] grid-rows-5" 
            : difficulty === "medium" 
            ? "grid-cols-4 sm:grid-cols-6 max-w-[320px] md:max-w-[600px]" 
            : "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 max-w-[320px] md:max-w-[800px]"
        } mx-auto`}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "w-[84px] h-[102px] md:w-[72px] md:h-[88px] [perspective:1000px] group transition-all duration-200 ease-out",
              !card.isMatched && "cursor-pointer hover:-translate-y-1 hover:scale-[1.02]",
              card.isMatched && "cursor-default" // Change cursor for matched cards
            )}
            onClick={() => handleCardClick(card.id)}
            role="button"
            tabIndex={card.isMatched ? -1 : 0} // Remove from tab order when matched
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick(card.id)}
            aria-label={`Card: ${card.content}. Click to flip.`}
          >
            <div
              className={cn(
                "relative w-full h-full transition-all duration-300 ease-in-out [transform-style:preserve-3d]",
                card.isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
                // Removed: card.isMatched && "opacity-60"
              )}
            >
              {/* Front side (Question mark) */}
              <div
                className={cn(
                  "absolute w-full h-full [backface-visibility:hidden]",
                  "flex items-center justify-center text-center",
                  "rounded-lg shadow-md",
                  "border-2 border-primary/30 bg-gradient-to-br from-primary to-primary/90",
                  "group-hover:shadow-lg group-hover:shadow-primary/20 transition-all"
                )}
              >
                <div className="text-2xl font-bold text-primary-foreground">?</div>
              </div>

              {/* Back side (Content) */}
              <div
                className={cn(
                  "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]",
                  "flex items-center justify-center text-center p-2",
                  "rounded-lg shadow-md",
                  card.isMatched
                    ? "bg-primary/10 border-2 border-primary opacity-75" // Keep distinct style, maybe add slight opacity here?
                    : "bg-card border-2 border-border/50",
                  !card.isMatched && "group-hover:shadow-lg group-hover:shadow-accent/20 transition-all" // Disable hover shadow if matched
                )}
              >
                <p 
                  className={cn(
                    "text-sm leading-tight",
                    card.type === "korean" 
                      ? "font-medium text-primary" 
                      : "text-accent-foreground"
                  )}
                >
                  {card.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
    </div>
  )
}
