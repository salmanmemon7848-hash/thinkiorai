export interface SearchResult {
  title: string
  url: string
  content: string
}

export async function searxSearch(query: string, count = 6): Promise<SearchResult[]> {
  const baseUrl = (process.env.SEARXNG_URL || '').trim()
  if (!baseUrl) return []

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      language: 'en',
      safesearch: '0',
      engines: 'google,bing,duckduckgo',
    })

    const res = await fetch(`${baseUrl}/search?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'ThinkiorAI/1.0' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return []

    const data = await res.json()
    return (data.results ?? [])
      .slice(0, count)
      .map((r: Record<string, string>) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.content ?? r.snippet ?? '',
      }))
      .filter((r: SearchResult) => r.title || r.content)
  } catch {
    return []
  }
}

export function formatSearchContext(results: SearchResult[]): string {
  if (results.length === 0) return ''
  return (
    '\n\n## Live Web Search Results (use these as real-world grounding)\n' +
    results
      .map((r, i) => `[${i + 1}] **${r.title}**\n${r.url}\n${r.content}`)
      .join('\n\n')
  )
}
