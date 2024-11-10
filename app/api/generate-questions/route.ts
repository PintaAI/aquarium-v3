import { openai } from "@ai-sdk/openai"
import { generateObject } from 'ai';
import { z } from 'zod';

const QuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string()
});

const QuestionsSchema = z.object({
  questions: z.array(QuestionSchema)
});

export async function POST() {
  console.log('Starting question generation...');

  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: QuestionsSchema,
      messages: [
        {
          role: 'system',
          content: 'You are an expert Korean language teacher specializing in EPS-TOPIK exam preparation. Generate questions in valid JSON format.'
        },
        {
          role: 'user',
          content: 'Buat 10 soal ujian bahasa Korea yang cocok untuk tes EPS-TOPIK. Setiap soal harus menguji pengetahuan dasar bahasa Korea, termasuk kosakata, tata bahasa, dan pemahaman budaya, khususnya dalam konteks bekerja di pabrik. Buat soal-soal dengan tingkat kesulitan yang semakin meningkat dan sertakan kosakata serta situasi yang sering ditemui di lingkungan pabrik.'
        }
      ]
    });

    console.log('Generated questions:', result);
    
    // Return just the questions object from the result
    return Response.json(result.object);
  } catch (error) {
    console.error('Error generating questions:', error);
    return Response.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
