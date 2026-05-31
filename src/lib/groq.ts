export const CHAT_MODEL = 'llama-3.3-70b-versatile';
export const EXTRACTION_MODEL = 'llama-3.1-8b-instant'; // used in Phase 3

const GROQ_BASE = 'https://api.groq.com/openai/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const REQUEST_TIMEOUT_MS = 15_000;

export async function chat(
  messages: ChatMessage[],
  model: string = CHAT_MODEL,
  responseFormat?: { type: 'json_object' }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('VITE_GROQ_API_KEY is not set. Add your key to .env.local — get one free at console.groq.com');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        ...(responseFormat && { response_format: responseFormat }),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out — Groq did not respond within 15 seconds. Check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq ${res.status}: ${body || res.statusText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}
