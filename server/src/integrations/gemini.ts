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
  const result = await model.generateContent(request);
  const response = result.response;

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
