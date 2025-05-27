"use client";

import { Button } from "@/components/ui/button";
import { MemoizedMarkdown } from "@/components/ui/memoized-markdown";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCompletion } from '@ai-sdk/react';
export default function AdvancedTranslateGame() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const [currentInput, setCurrentInput] = useState("");
  
  const {
    complete,
    completion,
    isLoading
  } = useCompletion({
    api: '/api/translate',
    onError: (error) => {
      console.error("Translation error:", error);
      setError("Terjadi kesalahan saat menerjemahkan. Silakan coba lagi nanti.");
    }
  });

  const handleTranslate = async () => {
    if (!text || isLoading) return;
    setError("");
    setCurrentInput(text);
    setText("");
    complete(text);
  };

  const handleClear = () => {
    setText("");
    setCurrentInput("");
    setError("");
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-1">
      <Card className="max-w-3xl w-full p-3 space-y-6 border-none">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            한국어 번역기
          </h1>
          <p className="text-muted-foreground">
            Terjemahkan teks antara Bahasa Indonesia dan Korea dengan mudah
          </p>
        </div>

        <div className="space-y-4">
          {text && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-9 float-right"
              disabled={isLoading}
            >
              Hapus
            </Button>
          )}
          <div className="space-y-2">
            <Label htmlFor="text" className="sr-only">Teks yang ingin diterjemahkan</Label>
            <Textarea
              id="text"
              placeholder="Masukkan teks yang ingin diterjemahkan..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px] resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {text.length} karakter
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={handleTranslate}
            disabled={isLoading}
          >
              {isLoading ? "Menerjemahkan..." : "Terjemahan"}
          </Button>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          {(currentInput || completion) && (
            <Card className="mt-6 p-4">
              {currentInput && (
                <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                  <MemoizedMarkdown content={currentInput} id="current-input" />
                </div>
              )}
              <div className="relative prose prose-sm dark:prose-invert max-w-none pl-4 border-l-2 border-primary min-h-[2rem]">
                {completion ? (
                  <MemoizedMarkdown content={completion} id="current-output" />
                ) : isLoading && (
                  <div className="h-4 w-2/3 bg-muted/50 rounded animate-pulse" />
                )}
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}
