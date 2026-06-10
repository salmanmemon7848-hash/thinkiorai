// lib/groqKey.ts
// Utility to retrieve Groq API key with a defined fallback order.
// It checks the environment variables in the following priority:
// 1. GROQ_API_KEY
// 2. GROQ_API_KEY_2
// 3. GROQ_API_KEY_3
// 4. GROQ_FALLBACK_API_KEY_1
// 5. GROQ_FALLBACK_API_KEY_2
// 6. GROQ_FALLBACK_API_KEY_3
// Returns the first defined key or undefined if none are set.

/** Returns the first available Groq API key according to the fallback priority. */
export function getGroqApiKey(): string | undefined {
  const candidates = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_FALLBACK_API_KEY_1,
    process.env.GROQ_FALLBACK_API_KEY_2,
    process.env.GROQ_FALLBACK_API_KEY_3,
  ];
  return candidates.find((key) => !!key);
}

/**
 * Performs a fetch request to a Groq endpoint, automatically retrying with the next
 * API key in the fallback list if the request fails with an authentication error.
 *
 * @param url - The full URL to request.
 * @param init - Optional fetch init options (method, headers, body, etc.).
 * @returns The fetch Response object of the successful request.
 * @throws The last encountered error if all keys fail.
 */
export async function fetchWithGroqKey(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const candidates = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_FALLBACK_API_KEY_1,
    process.env.GROQ_FALLBACK_API_KEY_2,
    process.env.GROQ_FALLBACK_API_KEY_3,
  ].filter(Boolean) as string[];

  let lastError: any;
  for (const key of candidates) {
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${key}`);
    try {
      const response = await fetch(url, { ...init, headers });
      if (response.ok) {
        return response;
      }
      // If the response indicates an auth problem, try next key.
      if (response.status === 401 || response.status === 403) {
        lastError = new Error(`Auth failed with key ${key}: ${response.status}`);
        continue;
      }
      // For other HTTP errors, throw immediately.
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    } catch (err: any) {
      lastError = err;
      // Network or other error – try next key.
    }
  }
  // If we exit the loop, all keys failed.
  throw lastError ?? new Error('No Groq API key available');
}
