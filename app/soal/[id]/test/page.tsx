"use client"

import { useParams } from "next/navigation"
import { QuizTest } from "./components/quiz-test"

export default function TestPage() {
  const params = useParams()
  const collectionId = parseInt(params.id as string)

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6 flex justify-center">
      <QuizTest collectionId={collectionId} />
    </div>
  )
}
