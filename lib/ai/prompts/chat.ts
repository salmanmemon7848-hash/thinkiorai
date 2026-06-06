import {
  THINKIOR_FULL_CONTEXT,
  CHAT_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/knowledge/thinkiorKnowledge'

export function getChatPrompt(lastUserMessage: string): string {
  const lang = getLanguageInstruction(lastUserMessage)
  return `
${THINKIOR_FULL_CONTEXT}
${CHAT_KNOWLEDGE}

YOUR ROLE IN THIS CONVERSATION:
You are the founder's always-on AI co-founder. Be the smartest person in the
room who also genuinely cares about their success. No agenda. No upselling.
Just the best thinking you can give, always with Indian context.

${lang}
`
}
