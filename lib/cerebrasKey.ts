// lib/cerebrasKey.ts
// Helper to retrieve Cerebras API key with fallback order.
// Primary key: CEREBRAS_API_KEY
// Fallbacks: CEREBRAS_FALLBACK_API_KEY_1, CEREBRAS_FALLBACK_API_KEY_2
// Returns the first defined key or undefined.

/** Returns the first available Cerebras API key according to priority. */
export function getCerebrasApiKey(): string | undefined {
  const candidates = [
    process.env.CEREBRAS_API_KEY,
    process.env.CEREBRAS_FALLBACK_API_KEY_1,
    process.env.CEREBRAS_FALLBACK_API_KEY_2,
  ];
  return candidates.find((k) => !!k);
}

/**
 * Performs a fetch request to a Cerebras endpoint, automatically retrying with the next
 * fallback key if the request fails with an authentication error (401/403).
 * @param url - Full URL to request (including path)
 * @param init - Optional fetch init options
 */
export async function fetchWithCerebrasKey(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const candidates = [
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
      if (response.ok) {
        return response;
      }
      if (response.status === 401 || response.status === 403) {
        lastError = new Error(`Cerebras auth failed with key ${key}: ${response.status}`);
        continue;
      }
      throw new Error(`Cerebras request failed: ${response.status} ${response.statusText}`);
    } catch (err: any) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('No Cerebras API key available');
}
