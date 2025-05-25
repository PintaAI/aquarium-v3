import { translate } from '@/lib/translate';

export async function POST(req: Request) {
  const json = await req.json();
  const { prompt } = json;
  
  if (!prompt) {
    return Response.json(
      { error: "No prompt provided" },
      { status: 400 }
    );
  }

  const stream = await translate(prompt);
  return stream.toDataStreamResponse();
}
