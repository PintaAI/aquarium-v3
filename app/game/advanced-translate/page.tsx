"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';

export default function AdvancedTranslateGame() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.result);
    } catch (error) {
      console.error("Translation error:", error);
      alert("Terjadi kesalahan saat menerjemahkan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-6">
      <Card className="max-w-3xl w-full p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            한국어 번역기 (Penerjemah Korea)
          </h1>
          <p className="text-muted-foreground">
            Masukkan teks dalam bahasa Indonesia atau Korea untuk diterjemahkan
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Teks yang ingin diterjemahkan</Label>
            <Textarea
              id="text"
              placeholder="Masukkan teks dalam bahasa Indonesia atau Korea..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            className="w-full"
            onClick={handleTranslate}
            disabled={isLoading || !text}
          >
            {isLoading ? "Menerjemahkan..." : "Terjemahkan"}
          </Button>

          {result && (
            <div className="space-y-2 mt-6">
              <Label>Hasil Terjemahan</Label>
              <Card className="p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
