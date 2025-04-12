'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent,} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toUTC, formatForInput, getCurrentLocalTime } from "@/lib/date-utils"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PRESET_DURATIONS = [
  { value: 30, label: "30 Menit" },
  { value: 45, label: "45 Menit" },
  { value: 60, label: "1 jam" },
  { value: 90, label: "1.5 jam" },
  { value: 120, label: "2 jam" },
  { value: "custom", label: "input manual ..." }
]

interface CreateTryoutFormProps {
  koleksiSoals: {
    id: number
    nama: string
  }[]
  onSubmit: (data: {
    koleksiSoalId: number
    startTime: Date
    endTime: Date
    duration: number
  }) => void
}

export function CreateTryoutForm({ koleksiSoals, onSubmit }: CreateTryoutFormProps) {
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  
  // Get default dates
  const now = getCurrentLocalTime()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const defaultStartTime = formatForInput(now)
  const defaultEndTime = formatForInput(tomorrow)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const koleksiSoalId = parseInt(formData.get("koleksiSoalId") as string)
    const startTime = toUTC(formData.get("startTime") as string)
    const endTime = toUTC(formData.get("endTime") as string)
    const durationType = formData.get("durationType") as string
    const duration = durationType === "custom" 
      ? parseInt(formData.get("customDuration") as string)
      : parseInt(durationType)

    onSubmit({
      koleksiSoalId,
      startTime,
      endTime,
      duration
    })
  }

  return (
    <Card className="border-none">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="koleksiSoalId">Pilih Soal</Label>
            <Select name="koleksiSoalId" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Soal" />
              </SelectTrigger>
              <SelectContent>
                {koleksiSoals.map((koleksi) => (
                  <SelectItem key={koleksi.id} value={koleksi.id.toString()}>
                    {koleksi.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Periode Mulai</Label>
            <Input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
              defaultValue={defaultStartTime}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">Periode Selesai</Label>
            <Input
              id="endTime"
              name="endTime"
              type="datetime-local"
              required
              defaultValue={defaultEndTime}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationType">Durasi</Label>
            <Select 
              name="durationType" 
              required
              onValueChange={(value) => setShowCustomDuration(value === "custom")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tentukan Durasi" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_DURATIONS.map((preset) => (
                  <SelectItem 
                    key={preset.value} 
                    value={preset.value.toString()}
                  >
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showCustomDuration && (
              <Input
                id="customDuration"
                name="customDuration"
                type="number"
                min="1"
                placeholder="Enter duration in minutes"
                className="mt-2"
              />
            )}
          </div>

          <Button type="submit" className="w-full">Buat Tryout</Button>
        </form>
      </CardContent>
    </Card>
  )
}
