"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Loader2, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdvancedTranslateGame() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<"auto" | "id" | "ko">("auto");

  const handleTranslate = async () => {
    if (!text) return;

    setIsLoading(true);
    setError("");
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
      setError("Terjadi kesalahan saat menerjemahkan. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult("");
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
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={sourceLanguage} onValueChange={(value: "auto" | "id" | "ko") => setSourceLanguage(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bahasa sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="auto">Deteksi Otomatis</SelectItem>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {text && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-9"
              >
                Hapus
              </Button>
            )}
          </div>
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
            disabled={isLoading || !text}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menerjemahkan...
              </>
            ) : (
              "Terjemahkan"
            )}
          </Button>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          {result && (
            <div className="space-y-2 mt-6">
              <Label>Hasil Terjemahan</Label>
              <Card className="p-3 bg-muted/50 relative">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
