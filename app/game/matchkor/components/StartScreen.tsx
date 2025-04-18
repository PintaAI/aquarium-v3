"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { IoGameControllerOutline } from "react-icons/io5"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
              className="relative inline-flex items-center justify-center px-8 py-6 text-lg mb-6 overflow-hidden font-medium text-primary-foreground transition duration-300 ease-out border-transparent rounded-lg shadow-md group bg-gradient-to-br from-primary to-secondary hover:from-secondary hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" // Removed border-2 border-primary, kept border-transparent
            >
              {/* Running Border Spans */}
              <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent animate-running-border-top"></span>
              <span className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-accent to-transparent animate-running-border-right"></span>
              <span className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-accent to-transparent animate-running-border-bottom"></span>
              <span className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-transparent via-accent to-transparent animate-running-border-left"></span>
              
              {/* Shake effect on hover/focus */}
              <motion.span 
                className="relative z-10" // Ensure text is above the border spans
                whileHover={{ 
                  rotate: [0, -2, 2, -2, 2, 0], 
                  transition: { duration: 0.3 } 
                }}
                whileTap={{ scale: 0.95 }}
              >
                START
              </motion.span>
            </Button>
          </motion.div>

          <GameInstructions />
        </div>
      </CardContent>
    </Card>
  )
}
