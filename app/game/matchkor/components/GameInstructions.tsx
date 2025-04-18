"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function GameInstructions() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 bg-gradient-to-br from-muted/30 to-background shadow-sm border-border/50"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Instruksi Permainan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Cara Bermain MatchKor</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm">
          <ol className="list-decimal pl-5 space-y-2">
            <li>MatchKor adalah permainan memory di mana Anda harus mencocokkan kata bahasa Korea dengan artinya dalam bahasa Indonesia.</li>
            <li>Setiap kartu memiliki pasangannya. Satu kartu berisi kata dalam bahasa Korea, dan pasangannya berisi arti kata tersebut dalam bahasa Indonesia.</li>
            <li>Klik pada dua kartu untuk membaliknya. Jika kedua kartu cocok (kata dan artinya), kartu akan tetap terbuka.</li>
            <li>Jika kartu tidak cocok, keduanya akan tertutup kembali.</li>
            <li>Tujuan permainan adalah menemukan semua pasangan kartu dalam waktu yang ditentukan.</li>
            <li>Anda mendapatkan poin untuk setiap pasangan yang cocok, dan bonus poin jika menyelesaikan semua kartu.</li>
          </ol>
          
          <Separator className="my-4" />
          
          <h4 className="font-medium mb-2">Tingkat Kesulitan:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">Mudah:</span> 8 pasang (16 kartu) dengan kata-kata dasar</li>
            <li><span className="font-medium">Sedang:</span> 12 pasang (24 kartu) dengan kata-kata menengah</li>
            <li><span className="font-medium">Sulit:</span> 16 pasang (32 kartu) dengan kata-kata kompleks</li>
          </ul>
          
          <div className="mt-4 text-muted-foreground italic">
            Tip: Coba mengingat posisi kartu yang telah Anda buka sebelumnya untuk mempermudah menemukan pasangan.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
