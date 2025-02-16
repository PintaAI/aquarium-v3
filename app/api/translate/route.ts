import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `🔍 **Analisis Teks dan Terjemahan**

    📜 **Instruksi:**
    - Jika teks mengandung Hangul, terjemahkan ke Bahasa Indonesia 🇮🇩
    - Jika teks ditulis dalam Bahasa Indonesia, terjemahkan ke Bahasa Korea (Hangul) 🇰🇷 dengan gaya bahasa formal (hindari penggunaan banmal)
    - Pastikan terjemahan menggunakan bahasa sehari-hari yang umum dipakai, namun tetap mempertahankan kesopanan dan keformalan sesuai konteks

    📝 **Format Output (harap ikuti dengan tepat):**
    
    # Teks Asli
    ${text}
    
    ## Terjemahan
    [Terjemahan dalam bahasa target]
    
    ## Cara Baca
    [Romanisasi untuk teks Korea, jika diperlukan]
    
    ## Penjelasan Tata Bahasa
    [Jelaskan struktur kalimat, partikel, tata bahasa, tingkat kesopanan yang digunakan, serta kosa kata terkait]
    
    ## Konteks Budaya
    [Berikan penjelasan mengenai konteks budaya yang relevan, jika ada]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const formattedResult = response.text();

    return NextResponse.json({ result: formattedResult });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menerjemahkan" },
      { status: 500 }
    );
  }
}
