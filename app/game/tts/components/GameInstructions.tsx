import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <Card className="mt-6 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <HelpCircle className="h-5 w-5" />
          Cara Bermain
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="pt-4">
        <ol className="space-y-3 text-sm sm:text-base">
          {instructions.map((instruction, index) => (
            <React.Fragment key={index}>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  {index + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">
                  {instruction}
                </span>
              </li>
              {index < instructions.length - 1 && (
                <Separator className="bg-muted/50" />
              )}
            </React.Fragment>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
