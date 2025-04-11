'use client'

import { useState, useEffect, useCallback } from "react"
import { submitTryoutAnswers } from "@/app/actions/tryout-actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Question {
  id: number
  pertanyaan: string
  attachmentUrl: string | null
  attachmentType: string | null
  opsis: {
    id: number
    opsiText: string
  }[]
}

interface TryoutQuizProps {
  tryoutId: number
  userId: string
  questions: Question[]
  duration: number // in minutes
}

export function TryoutQuiz({ tryoutId, userId, questions, duration }: TryoutQuizProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1))
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Initialize with duration in seconds
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const stored = localStorage.getItem(`tryout-${tryoutId}-time`)
    const parsedTime = stored ? parseInt(stored) : duration * 60
    return isNaN(parsedTime) ? duration * 60 : parsedTime
  })

const handleSubmit = useCallback(async () => {

    try {
      setIsSubmitting(true)
      await submitTryoutAnswers(tryoutId, userId, answers)
      router.push(`/tryout/${tryoutId}/leaderboard`)
    } catch (error) {
      alert("Gagal mengirim jawaban: " + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }, [answers, tryoutId, userId, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1
        
        if (newTime <= 0) {
          clearInterval(timer)
          handleSubmit()
          localStorage.removeItem(`tryout-${tryoutId}-time`)
          return 0
        }
        
        localStorage.setItem(`tryout-${tryoutId}-time`, newTime.toString())
        return newTime
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [tryoutId, handleSubmit])

  // Format remaining time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60)
    const secs = Math.max(0, seconds) % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerClick = (opsiId: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = opsiId
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-md space-y-6">
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question header */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          Soal {currentQuestion + 1}/{questions.length}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Waktu Tersisa:</span>
          <span className={`font-bold ${timeRemaining <= 300 ? 'text-red-500' : 'text-primary'}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          Terjawab: {answers.filter(a => a !== -1).length} dari {questions.length}
        </span>
      </div>
      
      {/* Question content */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          {questions[currentQuestion].pertanyaan}
        </h2>

        {/* Attachment handling */}
        {questions[currentQuestion].attachmentUrl && (
          <div className="my-4">
            {questions[currentQuestion].attachmentType?.toUpperCase() === "IMAGE" ? (
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                <Image
                  src={questions[currentQuestion].attachmentUrl || ''}
                  alt="Lampiran soal"
                  fill
                  className="object-contain border-2 border-muted rounded-lg"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : questions[currentQuestion].attachmentType?.toUpperCase() === "AUDIO" ? (
              <audio
                src={questions[currentQuestion].attachmentUrl || ''}
                controls
                className="w-full"
              />
            ) : (
              <a 
                href={questions[currentQuestion].attachmentUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline block"
              >
                Lihat Lampiran
              </a>
            )}
          </div>
        )}
        
        {/* Options */}
        <div className="space-y-3">
          {questions[currentQuestion].opsis.map((opsi, index) => (
            <button
              key={opsi.id}
              className={`w-full p-3 text-left rounded-md transition-colors flex items-center gap-3 ${
                answers[currentQuestion] === opsi.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-accent text-foreground"
              }`}
              onClick={() => handleAnswerClick(opsi.id)}
              disabled={isSubmitting}
            >
              <div className={`flex scale-75 items-center justify-center rounded-full border w-6 h-6 min-w-[24px] ${
                answers[currentQuestion] === opsi.id
                  ? "border-primary-foreground"
                  : "border-foreground"
              }`}>
                {index + 1}
              </div>
              {opsi.opsiText}
            </button>
          ))}
        </div>

        {/* Navigation and submit buttons */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || isSubmitting}
              variant="outline"
            >
              Sebelumnya
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1 || isSubmitting}
              variant="outline"
            >
              Selanjutnya
            </Button>
          </div>
          
          {/* Only show submit button if all questions are answered */}
          {!answers.includes(-1) && (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
