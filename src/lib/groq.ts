/** Groq chat completions — shared config for Assistant and AI meal plans. */

export const GROQ_CHAT_API = "https://api.groq.com/openai/v1/chat/completions";

/** Default after Groq retired `llama-3.3-70b-versatile` (Aug 2026). Override with GROQ_MODEL. */
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY?.trim();
  return key || null;
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey());
}

export function getGroqModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}
