"use client"

import { useEffect, useRef, useState } from "react"
import createScrollSnap from "scroll-snap"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

const demoQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital of South Korea?",
    options: ["Busan", "Seoul", "Incheon", "Daegu"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Which of these is a Korean alphabet?",
    options: ["汉字", "ひらがな", "한글", "注音"],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "What is Kimchi?",
    options: ["A type of soup", "Fermented vegetables", "A dessert", "A noodle dish"],
    correctAnswer: 1
  }
]

export function SnapQuiz() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      const { bind, unbind } = createScrollSnap(containerRef.current, {
        snapDestinationY: "100%",
        duration: 300,
        threshold: 0.1,
        enableKeyboard: true,
        easing: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      })

      bind()
      return () => unbind()
    }
  }, [])

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
    setIsCorrect(optionIndex === demoQuestions[currentQuestion].correctAnswer)
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-4rem)] w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none touch-pan-y"
    >
      {demoQuestions.map((q, index) => (
        <div
          key={q.id}
          className="h-full snap-start snap-always flex flex-col items-center justify-center p-4 relative"
          style={{
            backgroundColor: `hsl(${index * 60}, 70%, 95%)`,
          }}
        >
          <div className="w-11/12 max-w-lg mx-auto bg-white/80 backdrop-blur rounded-2xl p-4 space-y-4 shadow-lg">
            <h2 className="text-lg md:text-xl font-semibold text-center leading-tight">{q.question}</h2>
            <div className="grid gap-3">
              {q.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => handleAnswer(optionIndex)}
                  className={`p-3 md:p-4 rounded-lg text-left text-sm md:text-base transition ${
                    selectedAnswer === optionIndex
                      ? isCorrect
                        ? "bg-green-100 border-green-500"
                        : "bg-red-100 border-red-500"
                      : "bg-white hover:bg-gray-50"
                  } border-2`}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer !== null && (
              <div
                className={`text-center font-medium ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCorrect ? "Correct!" : "Try again!"}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
