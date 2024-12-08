import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analisis teks berikut dan berikan terjemahan yang sesuai:
    - Jika teks mengandung Hangul, terjemahkan ke Bahasa Indonesia
    - Jika teks dalam Bahasa Indonesia, terjemahkan ke Bahasa Korea (Hangul)
    - pastikan terjemahan menggunakan bhasa sehari hari yang di gunakan indonesia atau korea

    Berikan output dalam format markdown:

    # Teks Asli
    ${text}

    ## Terjemahan
    [Terjemahan dalam bahasa target]

    ## Cara Baca
    [Romanisasi untuk teks Korea]

    ## Penjelasan Tata Bahasa
    [Jelaskan struktur kalimat, partikel, grammar dan level kesopanan yang digunakan serta kosa kata terkait]

    ## Konteks Budaya
    [Jika ada konteks budaya yang relevan]`;

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
