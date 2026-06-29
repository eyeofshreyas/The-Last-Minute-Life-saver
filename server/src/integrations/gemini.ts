import { GoogleGenerativeAI, GenerateContentRequest, Tool, Content } from '@google/generative-ai';
import { config } from '../config';

// VERIFY: check SDK version and API shape at https://ai.google.dev/gemini-api/docs
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export interface GeminiCallParams {
  model: string;
  systemInstruction?: string;
  messages: Content[];
  tools?: Tool[];
  responseSchema?: Record<string, unknown>;
  temperature?: number;
}

export interface GeminiResponse {
  text: string | null;
  functionCalls: Array<{ name: string; args: Record<string, unknown> }>;
  raw: unknown;
}

export async function callGemini(params: GeminiCallParams): Promise<GeminiResponse> {
  const model = genAI.getGenerativeModel({
    model: params.model,
    systemInstruction: params.systemInstruction,
    generationConfig: {
      temperature: params.temperature ?? 0.2,
      ...(params.responseSchema ? {
        responseMimeType: 'application/json',
        responseSchema: params.responseSchema as never,
      } : {}),
    },
    tools: params.tools,
  });

  const request: GenerateContentRequest = { contents: params.messages };

  // ponytail: 3 retries for 429 rate limits; respects retryDelay from API response
  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      result = await model.generateContent(request);
      break;
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status !== 429 || attempt === 2) throw err;
      const delay = ((err as { errorDetails?: Array<{ retryDelay?: string }> }).errorDetails
        ?.find(d => d.retryDelay)?.retryDelay ?? '5s')
        .replace('s', '');
      await new Promise(r => setTimeout(r, (parseInt(delay, 10) || 5) * 1000));
    }
  }
  const response = result!.response;

  const functionCalls = response.candidates?.[0]?.content?.parts
    ?.filter(p => p.functionCall)
    .map(p => ({
      name: p.functionCall!.name,
      args: p.functionCall!.args as Record<string, unknown>,
    })) ?? [];

  return {
    text: response.text() ?? null,
    functionCalls,
    raw: response,
  };
}
