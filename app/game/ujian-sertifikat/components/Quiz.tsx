import React, { useState } from "react"
import { questions } from "../data"

export function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))

  const handleAnswerClick = (selectedIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedIndex
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

  const handleSubmit = () => {
    let totalScore = 0
    answers.forEach((answer, index) => {
      if (answer !== null && answer === questions[index].correctAnswer) {
        totalScore += 1
      }
    })
    setScore(totalScore)
    setShowResult(true)
  }

  const determineLevel = () => {
    const percentage = (score / questions.length) * 100
    if (percentage >= 80) return "TOPIK 5-6 (고급)"
    if (percentage >= 60) return "TOPIK 3-4 (중급)"
    return "TOPIK 1-2 (초급)"
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setAnswers(new Array(questions.length).fill(null))
  }

  return (
    <div className="w-full max-w-md p-6 bg-background rounded-lg shadow-md">
      {showResult ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">결과</h2>
          <p className="text-lg mb-2 text-foreground">
            총점: {score} / {questions.length}
          </p>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-xl font-semibold text-foreground">예상 TOPIK 레벨:</p>
            <p className="text-2xl font-bold text-primary mt-2">{determineLevel()}</p>
          </div>
          <button
            onClick={restartQuiz}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-secondary transition-colors"
          >
            다시 시작
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-muted-foreground">
              문제 {currentQuestion + 1}/{questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              점수: {score}
            </span>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              {questions[currentQuestion].question}
            </h2>
            
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full p-3 text-left rounded-md transition-colors ${
                    answers[currentQuestion] === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-accent text-foreground"
                  }`}
                  onClick={() => handleAnswerClick(index)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-accent disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length - 1}
                  className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-accent disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Submit Quiz
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Answered: {answers.filter(a => a !== null).length} of {questions.length}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
