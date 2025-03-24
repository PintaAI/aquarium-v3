'use client'

import { useState } from "react"
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
}

export function TryoutQuiz({ tryoutId, userId, questions }: TryoutQuizProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1))
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async () => {
    // Filter out unanswered questions (-1)
    const answeredQuestions = answers.filter(answer => answer !== -1)
    
    if (!answeredQuestions.length) {
      alert("Please answer at least one question before submitting")
      return
    }

    if (answers.includes(-1)) {
      const confirmed = window.confirm("You have unanswered questions. Do you want to submit anyway?")
      if (!confirmed) return
    }

    try {
      setIsSubmitting(true)
      await submitTryoutAnswers(tryoutId, userId, answers)
      router.push(`/tryout/${tryoutId}/leaderboard`)
    } catch (error) {
      alert("Failed to submit answers: " + (error as Error).message)
    } finally {
      setIsSubmitting(false)
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
          Question {currentQuestion + 1}/{questions.length}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          Answered: {answers.filter(a => a !== -1).length} of {questions.length}
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
                  alt="Question attachment"
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
                View attachment
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
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1 || isSubmitting}
              variant="outline"
            >
              Next
            </Button>
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Answers"}
          </Button>
        </div>
      </div>
    </div>
  )
}
