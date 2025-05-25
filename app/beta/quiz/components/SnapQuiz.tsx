"use client"

import { useEffect, useRef, useState } from "react"
import createScrollSnap from "scroll-snap"
import { QUESTIONS } from "../data/questions"
import { RiHeart3Fill, RiHeart3Line, RiMessage3Line, RiShareForwardLine } from "react-icons/ri"

// Create a list that's 3x the size for smooth infinite scroll
const DISPLAY_MULTIPLIER = 3
const displayList = Array.from({ length: DISPLAY_MULTIPLIER }, (_, i) =>
  QUESTIONS.map(q => ({
    ...q,
    // Ensure unique IDs across repeated sets
    id: q.id + (i * QUESTIONS.length)
  }))
).flat()

// Function to format numbers (e.g., 1234 -> 1.2k)
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

export function SnapQuiz() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, { answer: number; isCorrect: boolean }>>({})
  const [likedQuestions, setLikedQuestions] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const containerElement = containerRef.current; // Capture the ref value
    if (containerElement) {
      let isScrolling = false

      const { bind, unbind } = createScrollSnap(containerElement, {
        snapDestinationY: '100%',
        duration: 300,
        threshold: 0.3, // Increased threshold to ignore small drags
        enableKeyboard: true,
        easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      })

      // Handle scroll position for infinite loop
      const handleScroll = () => {
        if (isScrolling || !containerRef.current) return
        
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        const sectionHeight = scrollHeight / DISPLAY_MULTIPLIER
        const middleStart = sectionHeight
        const middleEnd = sectionHeight * 2

        // Only reset if we're well into the first or last section
        if (scrollTop > middleEnd + clientHeight) {
          isScrolling = true
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = middleStart + (scrollTop % sectionHeight)
            }
            isScrolling = false
          }, 50)
        } else if (scrollTop < middleStart - clientHeight) {
          isScrolling = true
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = middleEnd - (Math.abs(scrollTop - middleStart) % sectionHeight)
            }
            isScrolling = false
          }, 50)
        }
      }

      containerElement.addEventListener('scroll', handleScroll)
      bind()

      // Initialize to middle section
      const scrollHeight = containerElement.scrollHeight
      containerElement.scrollTop = scrollHeight / DISPLAY_MULTIPLIER

      return () => {
        unbind()
        // Use the captured variable in the cleanup
        containerElement?.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const handleAnswer = (questionId: number, optionIndex: number) => {
    // Map the display list ID back to the original question ID
    const originalId = questionId % QUESTIONS.length
    const isCorrect = optionIndex === QUESTIONS[originalId].correctAnswer

    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: { answer: optionIndex, isCorrect }
    }))
  }

  const handleLike = (questionId: number) => {
    setLikedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const handleShare = (_question: typeof QUESTIONS[0]) => {
    // In a real app, this would open a share dialog
    alert("Share functionality coming soon!")
  }

  const handleComment = (_question: typeof QUESTIONS[0]) => {
    // In a real app, this would open a comment dialog
    alert("Comment functionality coming soon!")
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-4rem)] w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none touch-pan-y"
    >
      {displayList.map((q, index) => (
        <div
          key={q.id}
          className="h-full snap-start snap-always flex items-center justify-center relative"
          style={{
            backgroundColor: `hsl(${(index % QUESTIONS.length) * 60}, ${
              typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '30%' : '70%'
            }, ${
              typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '20%' : '95%'
            })`,
          }}
        >
          {/* Main question content */}
          <div className="w-[350px] max-w-lg mx-auto bg-white/80 dark:bg-gray-800/90 backdrop-blur rounded-2xl p-4 space-y-4 shadow-lg">
            <h2 className="text-lg md:text-xl font-semibold text-center leading-tight text-gray-900 dark:text-white">{q.question}</h2>
            <div className="grid gap-3">
              {q.options.map((option, optionIndex) => (
                <button
                  type="button"
                  key={optionIndex}
                  onClick={() => handleAnswer(q.id, optionIndex)}
                  className={`p-3 md:p-4 rounded-lg text-left text-sm md:text-base transition ${
                    answeredQuestions[q.id]?.answer === optionIndex
                      ? answeredQuestions[q.id]?.isCorrect
                        ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300"
                      : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                  } border-2 dark:border-gray-600`}
                  aria-pressed={answeredQuestions[q.id]?.answer === optionIndex}
                >
                  {option}
                </button>
              ))}
            </div>
            {answeredQuestions[q.id] && (
              <div
                className={`text-center font-medium ${
                  answeredQuestions[q.id].isCorrect 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}
                aria-live="polite"
              >
                {answeredQuestions[q.id].isCorrect ? "Correct!" : "Try again!"}
              </div>
            )}
          </div>

          {/* Sidebar interactions */}
          <div className="absolute right-9 bottom-15 flex flex-col items-center gap-3">
            {/* Author info */}


            {/* Interaction buttons */}
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => handleLike(q.id)}
                className="flex flex-col items-center group"
              >
                {likedQuestions[q.id] ? (
                  <span className="transition-transform group-hover:scale-110">
                    <RiHeart3Fill 
                      className="h-7 w-7 text-red-500"
                    />
                  </span>
                ) : (
                  <span className="transition-transform group-hover:scale-110">
                    <RiHeart3Line 
                      className="h-7 w-7 text-gray-700 dark:text-white"
                    />
                  </span>
                )}
                <span className="mt-1 text-sm font-medium text-gray-700 dark:text-white">
                  {formatNumber(q.stats.likes + (likedQuestions[q.id] ? 1 : 0))}
                </span>
              </button>

              <button
                onClick={() => handleComment(q)}
                className="flex flex-col items-center group"
              >
                <span className="transition-transform group-hover:scale-110">
                  <RiMessage3Line 
                    className="h-7 w-7 text-gray-700 dark:text-white"
                  />
                </span>
                <span className="mt-1 text-sm font-medium text-gray-700 dark:text-white">
                  {formatNumber(q.stats.comments)}
                </span>
              </button>

              <button
                onClick={() => handleShare(q)}
                className="flex flex-col items-center group"
              >
                <span className="transition-transform group-hover:scale-110">
                  <RiShareForwardLine 
                    className="h-7 w-7 text-gray-700 dark:text-white"
                  />
                </span>
                <span className="mt-1 text-sm font-medium text-gray-700 dark:text-white">
                  {formatNumber(q.stats.shares)}
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
