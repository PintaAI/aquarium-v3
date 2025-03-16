"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { UseCurrentUser } from "@/hooks/use-current-user"
import { getKoleksiSoal } from "@/app/actions/soal-actions"


type EditParams = {
  id: string
}

interface EditSoalPageProps {
  params: Promise<EditParams>
}

export default function EditSoalPage({ params }: EditSoalPageProps) {
  const router = useRouter()
  const currentUser = UseCurrentUser()
  const unwrappedParams = use(params) as EditParams

  useEffect(() => {
    const checkAuthorization = async () => {
      const result = await getKoleksiSoal(parseInt(unwrappedParams.id))

      if (!result.success || !result.data) {
        return router.push("/soal")
      }

      // Only author can edit
      const authorId = result.data.soals[0]?.authorId
      if (!authorId || authorId !== currentUser?.id) {
        return router.push("/soal")
      }

      // If authorized, redirect to create page with id param
      router.push(`/soal/create?id=${unwrappedParams.id}`)
    }

    checkAuthorization()
  }, [unwrappedParams.id, router, currentUser])

  return null
}
