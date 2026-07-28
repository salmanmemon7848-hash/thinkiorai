'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Feature } from '@/types'

interface UsageData {
  count: number
  limit: number
  remaining: number
  exceeded: boolean
  period?: 'daily' | 'lifetime'
}

export function useUsage(feature: Feature) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch(`/api/usage?feature=${feature}`)
      if (res.ok) {
        const data = await res.json()
        setUsage(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [feature])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return { usage, loading, refetch: fetchUsage }
}
