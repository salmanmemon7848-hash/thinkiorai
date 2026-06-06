export function sanitizeString(input: unknown, maxLength = 2000): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
}

export function sanitizeMessages(
  messages: unknown
): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(messages)) return []
  return messages
    .filter(
      (m): m is { role: string; content: string } =>
        typeof m === 'object' &&
        m !== null &&
        typeof (m as Record<string, unknown>).role === 'string' &&
        typeof (m as Record<string, unknown>).content === 'string'
    )
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: sanitizeString(m.content, 4000),
    }))
    .slice(-20)
}

export function sanitizeFeature(feature: unknown): string {
  const valid = ['validator', 'competitor', 'ideas', 'pitch', 'chat']
  if (typeof feature !== 'string') return ''
  return valid.includes(feature) ? feature : ''
}
