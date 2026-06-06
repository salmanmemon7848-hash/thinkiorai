import Groq from 'groq-sdk'

export async function call(
  prompt: string,
  systemPrompt: string,
  complexity: 'simple' | 'complex',
  apiKey?: string
): Promise<string> {
  const groq = new Groq({ apiKey: apiKey || process.env.GROQ_API_KEY })
  const model =
    complexity === 'simple' ? 'llama-3.1-8b-instant' : 'llama-3.3-70b-versatile'

  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    max_tokens: complexity === 'simple' ? 1024 : 4096,
    temperature: 0.7,
  })

  return response.choices[0]?.message?.content ?? ''
}
