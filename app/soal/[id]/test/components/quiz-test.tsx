"use client"

import React, { useState, useEffect } from "react"

interface Opsi {
  id: number
  createdAt: Date
  updatedAt: Date
  soalId: number
  opsiText: string
  isCorrect: boolean
}

interface Question {
  id: number
  createdAt: Date
  updatedAt: Date
  pertanyaan: string
  attachmentUrl: string | null
  attachmentType: string | null
  explanation: string | null
  koleksiId: number
  authorId: string
  author: {
    name: string | null
    role: string
  }
  opsis: Opsi[]
}
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getKoleksiSoal } from "@/app/actions/soal-actions"

interface QuizTestProps {
  collectionId: number
}

export function QuizTest({ collectionId }: QuizTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const result = await getKoleksiSoal(collectionId)
        if (result.success && result.data) {
          const soals = result.data.soals.map(soal => ({
            ...soal,
            attachmentType: soal.attachmentType === "IMAGE" || soal.attachmentType === "AUDIO" 
              ? soal.attachmentType 
              : null
          }))
          setQuestions(soals)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load questions:", error)
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [collectionId])

  const handleAnswerClick = (selectedIndex: number) => {
    setSelectedOption(selectedIndex)
    
    setTimeout(() => {
      if (questions[currentQuestion].opsis[selectedIndex].isCorrect) {
        setScore(score + 1)
      }
      
      const nextQuestion = currentQuestion + 1
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion)
        setSelectedOption(null)
      } else {
        setShowResult(true)
      }
    }, 750)
  }

  const determineLevel = () => {
    const percentage = (score / questions.length) * 100
    if (percentage >= 80) return "Sangat Baik"
    if (percentage >= 60) return "Baik"
    return "Perlu Latihan Lagi"
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedOption(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Tidak ada soal yang tersedia</p>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl p-6">
      {showResult ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Hasil</h2>
          <p className="text-lg mb-2 text-foreground">
            Skor: {score} / {questions.length}
          </p>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-xl font-semibold text-foreground">Hasil Penilaian:</p>
            <p className="text-2xl font-bold text-primary mt-2">{determineLevel()}</p>
          </div>
          <Button
            onClick={restartQuiz}
            className="px-6 py-2"
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-muted-foreground">
              Pertanyaan {currentQuestion + 1}/{questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Skor: {score}
            </span>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              {questions[currentQuestion].pertanyaan}
            </h2>

            {questions[currentQuestion].attachmentUrl && (
              <div className="mb-4">
                {questions[currentQuestion].attachmentType === "IMAGE" ? (
                  <div className="relative h-[200px] w-full rounded-lg overflow-hidden">
                    <Image
                      src={questions[currentQuestion].attachmentUrl}
                      alt="Question attachment"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : questions[currentQuestion].attachmentType === "AUDIO" ? (
                  <audio
                    src={questions[currentQuestion].attachmentUrl}
                    controls
                    className="w-full"
                  />
                ) : null}
              </div>
            )}
            
            <div className="space-y-3">
              {questions[currentQuestion].opsis.map((option: Opsi, index: number) => (
                <button
                  key={index}
                  className={`w-full p-3 text-left rounded-md transition-colors ${
                    selectedOption === index
                      ? option.isCorrect
                        ? "bg-primary text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                      : "bg-muted hover:bg-accent text-foreground"
                  }`}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedOption !== null}
                >
                  {option.opsiText}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </>
      )}
    </Card>
  )
}
