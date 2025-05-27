import React from 'react';
import { Card, CardContent,} from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export function GameInstructions() {
  const instructions = [
    "Klik dan tarik untuk menggambar garis yang menghubungkan karakter Hangul yang berdekatan",
    "Garis harus lurus (horizontal, vertikal)",
    "Bentuk kata-kata Korea yang valid dan memiliki arti",
    "Klik tombol Hint jika kamu kesulitan (cooldown 5 detik)",
    "Ada 20 kata Korea yang tersembunyi dalam kotak!"
  ];

  return (
    <Card className="w-full bg-gradient-to-br from-muted/30 to-background">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <HelpCircle className="h-4 w-4" />
          <span className="font-medium">Cara Bermain</span>
        </div>
        <ol className="space-y-2 text-sm text-muted-foreground">
          {instructions.map((instruction, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-primary font-medium">{index + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
