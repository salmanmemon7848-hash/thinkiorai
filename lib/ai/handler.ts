import * as groq from './providers/groq'

export type TaskComplexity = 'simple' | 'complex'

interface HandlerInput {
  prompt: string
  systemPrompt: string
  feature: string
  complexity: TaskComplexity
}

interface HandlerOutput {
  result: string
  provider: string
  fallbackTriggered: boolean
}

function getRotatedGroqKey(): string {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean) as string[]

  if (keys.length === 0) return ''
  return keys[Math.floor(Date.now() / 60000) % keys.length]
}

export async function aiHandler(input: HandlerInput): Promise<HandlerOutput> {
  const { prompt, systemPrompt, complexity } = input

  const apiKey = getRotatedGroqKey()

  try {
    const result = await Promise.race([
      groq.call(prompt, systemPrompt, complexity, apiKey),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 25000)
      ),
    ])

    if (!result?.trim()) throw new Error('Empty response')

    return { result: result.trim(), provider: 'groq', fallbackTriggered: false }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[AI] groq failed:', msg)
  }

  return {
    result: 'Thinkior is temporarily unavailable. Please try again in a moment.',
    provider: 'none',
    fallbackTriggered: true,
  }
}
