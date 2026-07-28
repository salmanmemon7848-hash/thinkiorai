'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage, Feature, ResearchSource } from '@/types'

/**
 * A message in the chat, optionally carrying a parsed structured
 * card payload (Validator scorecard, Competitor map, etc).
 */
export interface ChatMessageWithCard extends ChatMessage {
  card?: unknown | null
  cardKind?: 'validator' | 'preview' | 'competitor' | 'ideas' | null
}

export function useChat(feature: Feature) {
  const [messages, setMessages] = useState<ChatMessageWithCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || loading) return

      const userMessage: ChatMessageWithCard = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feature,
            messages: [...messages, userMessage].map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          if (res.status === 429) {
            setError('daily_limit')
          } else {
            setError(err.error || 'Something went wrong')
          }
          return
        }

        const data = await res.json()
        const assistantMessage: ChatMessageWithCard = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
          card: data.card ?? null,
          cardKind: data.cardKind ?? null,
          sources: (data.sources ?? []) as ResearchSource[],
        }
        setMessages((prev) => [...prev, assistantMessage])
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [feature, messages, loading]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, loading, error, sendMessage, clearMessages }
}
