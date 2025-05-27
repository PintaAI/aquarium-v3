'use client'

import { Button } from "@/components/ui/button"
import { CreateTryoutForm } from "@/components/tryout/create-tryout-form"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { KoleksiSoal } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  koleksiSoalId: number
  startTime: Date
  endTime: Date
  duration: number
}

interface CreateTryoutDialogProps {
  koleksiSoals: KoleksiSoal[]
}

export function CreateTryoutDialog({ koleksiSoals }: CreateTryoutDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Tryout</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] p-4">
        <DialogTitle className="text-xl font-semibold">Buat Jadwal Tryout</DialogTitle>
        <CreateTryoutForm
          koleksiSoals={koleksiSoals}
          onSubmit={async (data: FormData) => {
            try {
              const response = await fetch('/api/tryouts', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
              })

              if (!response.ok) {
                const error = await response.text()
                throw new Error(error || 'Failed to create tryout')
              }

              toast({
                title: "Success",
                description: "Tryout created successfully"
              })
              
              setOpen(false)
              window.location.reload()
            } catch (error) {
              console.error("Error creating tryout:", error)
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
