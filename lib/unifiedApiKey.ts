// lib/unifiedApiKey.ts
// Helper to retrieve an API key from multiple providers with a strict fallback order.
// Order:
// 1. GROQ primary keys (GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3)
// 2. GROQ fallback keys (GROQ_FALLBACK_API_KEY_1, GROQ_FALLBACK_API_KEY_2, GROQ_FALLBACK_API_KEY_3)
// 3. Cerebras keys (CEREBRAS_API_KEY, CEREBRAS_FALLBACK_API_KEY_1, CEREBRAS_FALLBACK_API_KEY_2)
// Returns the first defined key (string) or undefined if none exist.

/** Returns the first available API key according to the unified priority list. */
export function getUnifiedApiKey(): string | undefined {
  const candidates = [
    // Groq primary
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    // Groq fallbacks
    process.env.GROQ_FALLBACK_API_KEY_1,
    process.env.GROQ_FALLBACK_API_KEY_2,
    process.env.GROQ_FALLBACK_API_KEY_3,
    // Cerebras keys
    process.env.CEREBRAS_API_KEY,
    process.env.CEREBRAS_FALLBACK_API_KEY_1,
    process.env.CEREBRAS_FALLBACK_API_KEY_2,
  ];
  return candidates.find((k) => !!k);
}

/**
 * Generic fetch wrapper that uses the unified API key for authentication.
 * It will try the keys in the defined order, retrying on auth errors (401/403).
 */
export async function fetchWithUnifiedKey(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const candidates = [
    // Groq primary
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    // Groq fallbacks
    process.env.GROQ_FALLBACK_API_KEY_1,
    process.env.GROQ_FALLBACK_API_KEY_2,
    process.env.GROQ_FALLBACK_API_KEY_3,
    // Cerebras keys
    process.env.CEREBRAS_API_KEY,
    process.env.CEREBRAS_FALLBACK_API_KEY_1,
    process.env.CEREBRAS_FALLBACK_API_KEY_2,
  ].filter(Boolean) as string[];

  let lastError: any;
  for (const key of candidates) {
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${key}`);
    try {
      const response = await fetch(url, { ...init, headers });
      if (response.ok) return response;
      if (response.status === 401 || response.status === 403) {
        lastError = new Error(`Auth failed with key ${key}: ${response.status}`);
        continue; // try next key
      }
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    } catch (err: any) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('No API key available');
}
