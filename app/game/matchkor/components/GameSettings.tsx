"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface GameSettingsProps {
  onStart: (difficulty: "easy" | "medium" | "hard") => void
}

export default function GameSettings({ onStart }: GameSettingsProps) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")

  const difficultySettings = {
    easy: {
      pairs: 8,
      timeLimit: "2 menit",
      description: "8 pasang kartu dengan kata-kata sederhana"
    },
    medium: {
      pairs: 12,
      timeLimit: "3 menit",
      description: "12 pasang kartu dengan tingkat kesulitan menengah"
    },
    hard: {
      pairs: 16,
      timeLimit: "4 menit",
      description: "16 pasang kartu dengan kata-kata kompleks"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-4"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Pengaturan Permainan</h2>
        <p className="text-muted-foreground mt-2">Pilih tingkat kesulitan permainan</p>
      </div>

      <div className="max-w-md mx-auto">
        <RadioGroup 
          value={difficulty} 
          onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")} 
          className="space-y-4"
        >
          {Object.entries(difficultySettings).map(([key, value]) => (
            <div 
              key={key}
              className={`flex items-start space-x-3 border p-4 rounded-lg hover:bg-accent/50 transition-colors ${
                difficulty === key ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <RadioGroupItem value={key} id={key} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={key} className="text-base font-medium">
                  {key === "easy" ? "Mudah" : key === "medium" ? "Sedang" : "Sulit"}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Jumlah kartu:</span> {value.pairs * 2}
                  </div>
                  <div>
                    <span className="font-medium">Waktu:</span> {value.timeLimit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => onStart(difficulty)}
          size="lg"
          className="px-8"
        >
          Mulai Permainan
        </Button>
      </div>
    </motion.div>
  )
}