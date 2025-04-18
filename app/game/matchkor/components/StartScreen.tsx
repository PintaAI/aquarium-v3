"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { IoGameControllerOutline } from "react-icons/io5"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import GameInstructions from "./GameInstructions"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <Card className="w-full h-full flex flex-col shadow-lg bg-gradient-to-b from-muted/30 to-background">
      <CardHeader className="flex-shrink-0 pb-0 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <CardTitle className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              MatchKor
            </CardTitle>
            <Badge variant="outline" className="uppercase text-xs border-accent">
              Memory Game
            </Badge>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 animate-gradient" />
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center gap-12 pt-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="bg-primary/10 p-6 rounded-full">
            <IoGameControllerOutline className="h-24 w-24 text-primary" />
          </div>
        </motion.div>

        <div className="w-full max-w-sm mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-3">Mulai Bermain</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Permainan memory untuk mencocokkan kata Korea dengan artinya
            </p>

            <Button 
              onClick={onStart}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg mb-6"
            >
              Mulai Bermain
            </Button>
          </motion.div>

          <GameInstructions />
        </div>
      </CardContent>
    </Card>
  )
}
