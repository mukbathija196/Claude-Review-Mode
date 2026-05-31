import { chat, EXTRACTION_MODEL } from './groq';
import { EXTRACTION_SYSTEM_PROMPT } from './prompts';
import type { ReviewMetadata } from '../types';

export async function extractReviewMetadata(
  userPrompt: string,
  assistantResponse: string
): Promise<ReviewMetadata> {
  const userContent = `USER QUESTION:\n${userPrompt}\n\nASSISTANT RESPONSE:\n${assistantResponse}`;

  const raw = await chat(
    [
      { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    EXTRACTION_MODEL,
    { type: 'json_object' }
  );

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Extraction returned invalid JSON');
  }

  if (!Array.isArray(parsed.claims) || !Array.isArray(parsed.assumptions) || !Array.isArray(parsed.missing_items)) {
    throw new Error('Extraction response is missing required fields');
  }

  return {
    ...(parsed as unknown as ReviewMetadata),
    response_id: crypto.randomUUID(),
    extraction_timestamp: Date.now(),
  };
}
