import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { cache } from 'react';

// A helper to generate translation prompt
function getTranslationPrompt(text: string) {
  return `🔍 **Analisis Teks dan Terjemahan**

    📜 **Instruksi:**
    - Jika teks dalam Bahasa Indonesia, terjemahkan ke Bahasa Korea (Hangul) dengan gaya sopan 
    - Jika teks dalam Bahasa Korea, terjemahkan ke Bahasa Indonesia
    - Gunakan bahasa sehari-hari yang umum dipakai, namun tetap sopan dan formal sesuai konteks

    📝 **Format Output:**
    
    ## Teks Asli 
    #${text}
    
    ## Terjemahan
    #[Terjemahan dalam bahasa target]
    
    ## Cara Baca
    #[Romanisasi jika hasil terjemahan dalam Hangul]
    
    ## Penjelasan Tata Bahasa
    [Jelaskan struktur kalimat, partikel, tata bahasa, tingkat kesopanan yang digunakan, serta kosa kata terkait]
    
    ## Konteks Budaya
    [Berikan penjelasan mengenai konteks budaya yang relevan, jika ada]`;
}

export const translate = cache(async (text: string) => {
  const prompt = getTranslationPrompt(text);

  return streamText({
    system: "You are an expert Korean-Indonesian translator and language educator. Provide comprehensive translations with explanations of grammar, cultural context, and proper pronunciation. Format your responses in markdown for clear structure and readability. Always maintain formal language levels in Korean translations unless explicitly requested otherwise.",
    model: google('gemini-2.0-flash-exp'),
    messages: [{ role: "user", content: prompt }],
  });
});
