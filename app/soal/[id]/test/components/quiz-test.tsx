"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Opsi {
  id: number
  createdAt: Date
  updatedAt: Date
  soalId: number
  opsiText: string
  attachmentUrl: string | null
  attachmentType: string | null
  isCorrect: boolean
}

interface KoleksiSoal {
  id: number
  nama: string
  deskripsi?: string | null
  soals: {
    author: {
      name: string | null
      role: string
    }
  }[]
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

interface UserAnswer {
  questionId: number
  selectedOption: number
  isCorrect: boolean
}

interface QuizTestProps {
  collectionId: number
}

export function QuizTest({ collectionId }: QuizTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [koleksi, setKoleksi] = useState<KoleksiSoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const { data: session } = useSession()

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const result = await getKoleksiSoal(collectionId)
        if (result.success && result.data) {
          const soals = result.data.soals.map(soal => ({
            ...soal,
            attachmentType: soal.attachmentType?.toUpperCase() === "IMAGE" || soal.attachmentType?.toUpperCase() === "AUDIO" 
              ? soal.attachmentType.toUpperCase()
              : null
          }))
          setQuestions(soals)
          setKoleksi({
            id: result.data.id,
            nama: result.data.nama,
            deskripsi: result.data.deskripsi,
            soals: result.data.soals
          })
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
    const isCorrect = questions[currentQuestion].opsis[selectedIndex].isCorrect
    
    setUserAnswers([...userAnswers, {
      questionId: questions[currentQuestion].id,
      selectedOption: selectedIndex,
      isCorrect
    }])
    
    setTimeout(() => {
      if (isCorrect) {
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

  const navigateReview = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && reviewIndex > 0) {
      setReviewIndex(reviewIndex - 1)
    } else if (direction === 'next' && reviewIndex < userAnswers.length - 1) {
      setReviewIndex(reviewIndex + 1)
    }
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
    setUserAnswers([])
    setReviewMode(false)
    setReviewIndex(0)
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
    <Card className="w-full max-w-2xl p-6 space-y-6">
      {koleksi && (
        <div>
          <h1 className="text-xl font-bold text-foreground">{koleksi.nama}</h1>
          <div className="text-sm text-muted-foreground space-y-1">
            
            <p>by, {koleksi.soals[0]?.author?.name || "Unknown"}</p>
          </div>
        </div>
      )}
      {showResult ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Hasil</h2>
            <p className="text-base mb-2 text-muted-foreground">
              Nama: {session?.user?.name || "Anonymous"}
            </p>
            <p className="text-lg mb-2 text-foreground">
              Skor: {score} / {questions.length}
            </p>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-xl font-semibold text-foreground">Hasil Penilaian:</p>
              <p className="text-2xl font-bold text-primary mt-2">{determineLevel()}</p>
            </div>
            {!reviewMode && (
              <Button
                onClick={() => setReviewMode(true)}
                className="px-6 py-2 mb-4"
              >
                Review Jawaban
              </Button>
            )}
            <Button
              onClick={restartQuiz}
              className="px-6 py-2 ml-4"
              variant={reviewMode ? "secondary" : "default"}
            >
              Coba Lagi
            </Button>
          </div>

          {reviewMode && (
            <div className="mt-8 text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Review Soal {reviewIndex + 1}/{userAnswers.length}
                </h3>
                <div className="space-x-2">
                  <Button
                    onClick={() => navigateReview('prev')}
                    disabled={reviewIndex === 0}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => navigateReview('next')}
                    disabled={reviewIndex === userAnswers.length - 1}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-4">{reviewIndex + 1}. {questions[reviewIndex].pertanyaan}</p>
                
                {questions[reviewIndex].attachmentUrl && (
                  <div className="mb-4">
                  {questions[reviewIndex].attachmentType === "IMAGE" || questions[reviewIndex].attachmentType?.toUpperCase() === "IMAGE" ? (
                      <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                        <Image
                          src={questions[reviewIndex].attachmentUrl}
                          alt="Question attachment"
                          fill
                          className="object-contain border-2 border-muted rounded-lg"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : questions[reviewIndex].attachmentType === "AUDIO" || questions[reviewIndex].attachmentType?.toUpperCase() === "AUDIO" ? (
                      <audio
                        src={questions[reviewIndex].attachmentUrl}
                        controls
                        className="w-full"
                      />
                    ) : null}
                  </div>
                )}

                <div className="space-y-3">
                  {questions[reviewIndex].opsis.map((option: Opsi, index: number) => {
                    const isSelected = userAnswers[reviewIndex].selectedOption === index;
                    const isCorrect = option.isCorrect;
                    let buttonClass = "w-full p-3 text-left rounded-md transition-colors flex items-center gap-3 ";
                    
                    if (isSelected) {
                      buttonClass += isCorrect ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground";
                    } else if (isCorrect) {
                      buttonClass += "bg-primary/20 text-primary";
                    } else {
                      buttonClass += "bg-muted text-foreground";
                    }

                    return (
                      <div key={index} className={buttonClass}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`flex scale-75 items-center justify-center rounded-full border w-6 h-6 min-w-[24px] ${
                            isSelected
                              ? isCorrect
                                ? "border-primary-foreground"
                                : "border-destructive-foreground"
                              : isCorrect
                                ? "border-primary"
                                : "border-foreground"
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                      <div>{option.opsiText || (option.attachmentUrl ? "[Lampiran]" : "[Opsi kosong]")}</div>
                            {option.attachmentUrl && (
                              <div className="mt-2">
                                {option.attachmentType === "IMAGE" || option.attachmentType?.toUpperCase() === "IMAGE" ? (
                                  <div className="relative h-[120px] w-[120px] rounded-lg overflow-hidden">
                                    <Image
                                      src={option.attachmentUrl}
                                      alt="Option attachment"
                                      fill
                                      className="object-contain border border-muted rounded-lg"
                                      loading="lazy"
                                      sizes="120px"
                                    />
                                  </div>
                                ) : option.attachmentType === "AUDIO" || option.attachmentType?.toUpperCase() === "AUDIO" ? (
                                  <audio
                                    src={option.attachmentUrl}
                                    controls
                                    className="w-full max-w-[200px]"
                                  />
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {questions[reviewIndex].explanation && !userAnswers[reviewIndex].isCorrect && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="font-semibold mb-2">Penjelasan:</p>
                    <p className="text-muted-foreground">{questions[reviewIndex].explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="w-full bg-muted rounded-full h-1.5 mb-6">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-muted-foreground">
              Soal {currentQuestion + 1}/{questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Skor: {score}
            </span>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              {currentQuestion + 1}. {questions[currentQuestion].pertanyaan}
            </h2>

            {questions[currentQuestion].attachmentUrl && (
              <div className="mb-4">
                {questions[currentQuestion].attachmentType === "IMAGE" || questions[currentQuestion].attachmentType?.toUpperCase() === "IMAGE" ? (
                      <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                        <Image
                          src={questions[currentQuestion].attachmentUrl}
                          alt="Question attachment"
                          fill
                          className="object-contain border-2 border-muted rounded-lg"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                ) : questions[currentQuestion].attachmentType === "AUDIO" || questions[currentQuestion].attachmentType?.toUpperCase() === "AUDIO" ? (
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
                  className={`w-full p-3 text-left rounded-md transition-colors flex items-center gap-3 ${
                    selectedOption === index
                      ? option.isCorrect
                        ? "bg-primary text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                      : "bg-muted hover:bg-accent text-foreground"
                  }`}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedOption !== null}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`flex scale-75 items-center justify-center rounded-full border w-6 h-6 min-w-[24px] ${
                      selectedOption === index
                        ? option.isCorrect
                          ? "border-primary-foreground"
                          : "border-destructive-foreground" 
                        : "border-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div>{option.opsiText || (option.attachmentUrl ? "[Lampiran]" : "[Opsi kosong]")}</div>
                      {option.attachmentUrl && (
                        <div className="mt-2">
                          {option.attachmentType === "IMAGE" || option.attachmentType?.toUpperCase() === "IMAGE" ? (
                            <div className="relative h-[120px] w-[120px] rounded-lg overflow-hidden">
                              <Image
                                src={option.attachmentUrl}
                                alt="Option attachment"
                                fill
                                className="object-contain border border-muted rounded-lg"
                                loading="lazy"
                                sizes="120px"
                              />
                            </div>
                          ) : option.attachmentType === "AUDIO" || option.attachmentType?.toUpperCase() === "AUDIO" ? (
                            <audio
                              src={option.attachmentUrl}
                              controls
                              className="w-full max-w-[200px]"
                            />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
