import React from "react"
import { ebooks, Ebook } from "@/data/ebooks"
import { EBookCard } from "@/components/card/ebook-card"

export default function EBookPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">E-Book</h1>
        <p className="text-muted-foreground">
          Baca buku digital bahasa Korea untuk meningkatkan pemahaman. Berikut adalah beberapa sumber yang tersedia:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {ebooks.map((ebook: Ebook, index: number) => (
          <EBookCard
            key={index}
            title={ebook.title}
            language={ebook.language}
            type={ebook.type}
            url={ebook.url}
          />
        ))}
      </div>
    </div>
  );
}
