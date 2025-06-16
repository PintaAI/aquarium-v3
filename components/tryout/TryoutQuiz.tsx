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
  type: 'LISTENING' | 'READING'
  opsis: {
    id: number
    opsiText: string
  }[]
}

interface KoleksiSoal {
  audioUrl: string | null
}

interface TryoutQuizProps {
  tryoutId: number
  userId: string
  questions: Question[]
  koleksiSoal: KoleksiSoal
  duration: number // in minutes
}

export function TryoutQuiz({ tryoutId, userId, questions, koleksiSoal, duration }: TryoutQuizProps) {
  const router = useRouter()
  
  // Separate questions by type
  const listeningQuestions = questions.filter(q => q.type === 'LISTENING')
  const readingQuestions = questions.filter(q => q.type === 'READING')
  
  // Quiz state management
  const [currentSection, setCurrentSection] = useState<'LISTENING' | 'READING'>(
    readingQuestions.length > 0 ? 'READING' : 'LISTENING'
  )
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1))
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Audio state for listening section
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioEnded, setAudioEnded] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  
  // Store start time for accurate duration calculation
  const [startTime, setStartTime] = useState<number | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Initialize with duration in seconds
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const stored = localStorage.getItem(`tryout-${tryoutId}-time`)
    const parsedTime = stored ? parseInt(stored) : duration * 60
    return isNaN(parsedTime) ? duration * 60 : parsedTime
  })
  
  // Get current section questions
  const currentSectionQuestions = currentSection === 'LISTENING' ? listeningQuestions : readingQuestions

  // Set start time when user first interacts
  useEffect(() => {
    if (!hasInteracted && !startTime) {
      const stored = localStorage.getItem(`tryout-${tryoutId}-startTime`)
      if (stored) {
        setStartTime(parseInt(stored))
      }
    }
  }, [hasInteracted, startTime, tryoutId])

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)
      // Calculate actual time taken based on duration
      const timeTakenSeconds = Math.min(
        duration * 60,
        startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
      )
      await submitTryoutAnswers(tryoutId, userId, answers, timeTakenSeconds)
      router.push(`/tryout/${tryoutId}/leaderboard`)
    } catch (error) {
      alert("Gagal mengirim jawaban: " + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }, [answers, tryoutId, userId, router, duration, startTime])

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
    // Start timer on first interaction
    if (!hasInteracted) {
      const now = Date.now()
      setStartTime(now)
      setHasInteracted(true)
      localStorage.setItem(`tryout-${tryoutId}-startTime`, now.toString())
    }
    
    // Get the actual question index in the full questions array
    const actualQuestionIndex = getCurrentQuestionIndex()
    const newAnswers = [...answers]
    newAnswers[actualQuestionIndex] = opsiId
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < currentSectionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else if (currentSection === 'READING' && listeningQuestions.length > 0) {
      // Move to listening section
      setCurrentSection('LISTENING')
      setCurrentQuestion(0)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (currentSection === 'LISTENING' && readingQuestions.length > 0) {
      // Move back to reading section
      setCurrentSection('READING')
      setCurrentQuestion(readingQuestions.length - 1)
    }
  }

  // Audio event handlers
  const handleAudioPlay = () => setAudioPlaying(true)
  const handleAudioPause = () => setAudioPlaying(false)
  const handleAudioEnded = () => {
    setAudioPlaying(false)
    setAudioEnded(true)
  }
  const handleAudioTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.target as HTMLAudioElement
    setAudioCurrentTime(audio.currentTime)
  }
  const handleAudioLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.target as HTMLAudioElement
    setAudioDuration(audio.duration)
  }

  // Get the actual question index in the full questions array
  const getCurrentQuestionIndex = () => {
    if (currentSection === 'READING') {
      return currentQuestion
    } else {
      return readingQuestions.length + currentQuestion
    }
  }

  // Format audio time
  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Check if user can proceed to reading section (only if audio ended or no audio)
  const canProceedToReading = currentSection === 'LISTENING' && (!koleksiSoal.audioUrl || audioEnded)

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-md space-y-6">
      {/* Section indicator */}
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">
          {currentSection === 'LISTENING' ? '듣기 (Listening)' : '읽기 (Reading)'}
        </h2>
        {currentSection === 'LISTENING' && koleksiSoal.audioUrl && (
          <p className="text-sm text-muted-foreground">
            {audioEnded ? 'Audio telah selesai. Anda dapat melanjutkan ke bagian Reading.' : 'Dengarkan audio dengan saksama'}
          </p>
        )}
      </div>

      {/* Audio player for listening section */}
      {currentSection === 'LISTENING' && koleksiSoal.audioUrl && (
        <div className="bg-muted p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Audio Listening</span>
              {audioPlaying && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
                  Playing
                </span>
              )}
              {audioEnded && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                  Completed
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
            </span>
          </div>
          <audio
            src={koleksiSoal.audioUrl}
            controls
            className="w-full"
            onPlay={handleAudioPlay}
            onPause={handleAudioPause}
            onEnded={handleAudioEnded}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
          />
          {!audioEnded && (
            <p className="text-xs text-muted-foreground">
              {audioPlaying
                ? "Audio sedang diputar. Dengarkan sampai selesai untuk melanjutkan ke Reading."
                : "Audio harus diputar sampai selesai sebelum dapat melanjutkan ke bagian Reading"
              }
            </p>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((getCurrentQuestionIndex() + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress: {getCurrentQuestionIndex() + 1}/{questions.length}</span>
          <span>{currentSection}: {currentQuestion + 1}/{currentSectionQuestions.length}</span>
        </div>
      </div>

      {/* Question header */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          {currentSection} {currentQuestion + 1}/{currentSectionQuestions.length}
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
          {currentSectionQuestions[currentQuestion].pertanyaan}
        </h2>

        {/* Attachment handling */}
        {currentSectionQuestions[currentQuestion].attachmentUrl && (
          <div className="my-4">
            {currentSectionQuestions[currentQuestion].attachmentType?.toUpperCase() === "IMAGE" ? (
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                <Image
                  src={currentSectionQuestions[currentQuestion].attachmentUrl || ''}
                  alt="Lampiran soal"
                  fill
                  className="object-contain border-2 border-muted rounded-lg"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : currentSectionQuestions[currentQuestion].attachmentType?.toUpperCase() === "AUDIO" ? (
              <audio
                src={currentSectionQuestions[currentQuestion].attachmentUrl || ''}
                controls
                className="w-full"
              />
            ) : (
              <a
                href={currentSectionQuestions[currentQuestion].attachmentUrl || '#'}
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
          {currentSectionQuestions[currentQuestion].opsis.map((opsi, index) => (
            <button
              key={opsi.id}
              className={`w-full p-3 text-left rounded-md transition-colors flex items-center gap-3 ${
                answers[getCurrentQuestionIndex()] === opsi.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-accent text-foreground"
              }`}
              onClick={() => handleAnswerClick(opsi.id)}
              disabled={isSubmitting}
            >
              <div className={`flex scale-75 items-center justify-center rounded-full border w-6 h-6 min-w-[24px] ${
                answers[getCurrentQuestionIndex()] === opsi.id
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
              disabled={(currentQuestion === 0 && currentSection === 'READING') || isSubmitting}
              variant="outline"
            >
              Sebelumnya
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                isSubmitting ||
                (currentQuestion === currentSectionQuestions.length - 1 &&
                 currentSection === 'LISTENING') ||
                (currentSection === 'LISTENING' &&
                 currentQuestion === currentSectionQuestions.length - 1 &&
                 !canProceedToReading)
              }
              variant="outline"
            >
              {currentSection === 'READING' &&
               currentQuestion === currentSectionQuestions.length - 1 &&
               listeningQuestions.length > 0 ?
               'Lanjut ke Listening' : 'Selanjutnya'}
            </Button>
          </div>
          
          {/* Show section navigation info */}
          {currentSection === 'LISTENING' && readingQuestions.length > 0 && !canProceedToReading && (
            <div className="text-center text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              {!audioEnded ?
                'Dengarkan audio sampai selesai untuk melanjutkan ke bagian Reading' :
                'Selesaikan semua soal Listening untuk melanjutkan ke Reading'
              }
            </div>
          )}
          
          {/* Only show submit button if all questions are answered and on last section */}
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
