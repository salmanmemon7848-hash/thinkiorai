import Groq from "groq-sdk";
import * as cheerio from "cheerio";

const SEARXNG = process.env.SEARXNG_URL || "http://localhost:8080";

const groqPrimary = new Groq({ apiKey: process.env.GROQ_API_KEY });
const groqFallback = new Groq({
  apiKey: process.env.GROQ_API_KEY_FALLBACK || process.env.GROQ_API_KEY,
});

const INDIA_PRIORITY_DOMAINS = [
  "inc42.com",
  "yourstory.com",
  "entrackr.com",
  "theken.in",
  "vccircle.com",
  "startupstorymedia.com",
  "economictimes.indiatimes.com",
  "moneycontrol.com",
  "livemint.com",
  "business-standard.com",
  "financialexpress.com",
  "nasscom.in",
  "ibef.org",
  "dpiit.gov.in",
  "rbi.org.in",
  "mospi.gov.in",
  "startupindia.gov.in",
  "statista.com",
  "crunchbase.com",
  "cbinsights.com",
];

const SKIP_DOMAINS = [
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "pinterest.com",
  "snapchat.com",
];

export interface DeepResearchResult {
  query: string;
  intent_type: string;
  india_relevance: string;
  sub_questions: string[];
  key_findings: string[];
  market_data: {
    india_market_size: string;
    growth_rate: string;
    key_players_india: string[];
    market_stage: string;
  };
  sources_used: {
    url: string;
    source_name: string;
    credibility: string;
    india_specific: boolean;
    key_data_extracted: string[];
  }[];
  data_points: string[];
  contradictions_or_gaps: string[];
  synthesis: string;
  india_opportunities: string[];
  india_risks: string[];
  confidence_score: string;
  data_freshness: string;
  follow_up_queries: string[];
  summary: string;
}

interface RawSearchResult {
  title: string;
  url: string;
  snippet: string;
  engine: string;
}

interface ScrapedPage {
  url: string;
  domain: string;
  title: string;
  text: string;
  isIndianSource: boolean;
  wordCount: number;
}

async function searchSearXNG(
  query: string,
  maxResults: number = 10
): Promise<RawSearchResult[]> {
  try {
    const indiaQuery =
      query.toLowerCase().includes("india") ||
      query.toLowerCase().includes("indian") ||
      query.toLowerCase().includes("₹") ||
      query.toLowerCase().includes("inr")
        ? query
        : `${query} India`;

    const params = new URLSearchParams({
      q: indiaQuery,
      format: "json",
      language: "en",
      safesearch: "0",
      categories: "general",
    });

    const res = await fetch(`${SEARXNG}/search?${params}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ThinkiorAI/1.0 (+https://thinkior.ai)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`SearXNG ${res.status}`);
    const data = await res.json();

    return (data.results || [])
      .slice(0, maxResults)
      .map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        snippet: r.content || r.snippet || "",
        engine: r.engine || "unknown",
      }))
      .filter(
        (r: RawSearchResult) =>
          r.url?.startsWith("http") &&
          !SKIP_DOMAINS.some((d) => r.url.includes(d))
      );
  } catch (err) {
    console.error("[ThinkiorAI] SearXNG error:", err);
    return [];
  }
}

async function scrapePage(url: string): Promise<ScrapedPage | null> {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    const isIndianSource = INDIA_PRIORITY_DOMAINS.some((d) =>
      domain.includes(d)
    );

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    $(
      "script, style, nav, footer, header, iframe, " +
        ".ads, .advertisement, .cookie-banner, .popup, " +
        ".newsletter, .sidebar, .related-posts, .comments, " +
        "[class*='ad-'], [id*='ad-'], [class*='banner']"
    ).remove();

    const title =
      $("h1").first().text().trim() || $("title").text().trim() || domain;

    let mainText = "";
    const contentSelectors = [
      "article",
      "main",
      ".article-body",
      ".post-content",
      ".entry-content",
      ".content-body",
      "#content",
      ".story-content",
      ".article-content",
      "[class*='article']",
      "[class*='content']",
    ];

    for (const sel of contentSelectors) {
      const text = $(sel).text().trim();
      if (text.length > 500) {
        mainText = text;
        break;
      }
    }

    if (!mainText || mainText.length < 200) {
      mainText = $("body").text().trim();
    }

    const tableData: string[] = [];
    $("table").each((_, el) => {
      const rows: string[] = [];
      $(el)
        .find("tr")
        .each((_, row) => {
          const cells = $(row)
            .find("td, th")
            .map((_, cell) => $(cell).text().trim())
            .get()
            .filter(Boolean);
          if (cells.length) rows.push(cells.join(" | "));
        });
      if (rows.length > 1) tableData.push(rows.join("\n"));
    });

    const indiaNumbers =
      mainText.match(
        /(?:₹|Rs\.?|INR|crore|lakh|billion|million)[\s\d,\.]+|[\d,\.]+\s*(?:crore|lakh|billion|million|%)/gi
      ) || [];

    const cleanText = mainText
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, 6000);

    let fullText = cleanText;
    if (tableData.length)
      fullText += `\n\n[TABLE DATA]\n${tableData.join("\n\n")}`;
    if (indiaNumbers.length) {
      const uniqueNumbers = Array.from(new Set(indiaNumbers)).slice(0, 20);
      fullText += `\n\n[KEY NUMBERS FOUND]\n${uniqueNumbers.join(", ")}`;
    }

    return {
      url,
      domain,
      title,
      text: fullText,
      isIndianSource,
      wordCount: cleanText.split(" ").length,
    };
  } catch {
    return null;
  }
}

async function scrapeWithIndiaPriority(
  results: RawSearchResult[],
  maxScrape: number = 6
): Promise<ScrapedPage[]> {
  const sorted = [...results].sort((a, b) => {
    const aIsIndia = INDIA_PRIORITY_DOMAINS.some((d) => a.url.includes(d))
      ? 1
      : 0;
    const bIsIndia = INDIA_PRIORITY_DOMAINS.some((d) => b.url.includes(d))
      ? 1
      : 0;
    return bIsIndia - aIsIndia;
  });

  const toScrape = sorted.slice(0, maxScrape);

  const scraped = await Promise.allSettled(
    toScrape.map((r) => scrapePage(r.url))
  );

  return scraped
    .filter(
      (r): r is PromiseFulfilledResult<ScrapedPage> =>
        r.status === "fulfilled" && r.value !== null && r.value.wordCount > 80
    )
    .map((r) => r.value);
}

function buildResearchContext(
  query: string,
  searchResults: RawSearchResult[],
  scrapedPages: ScrapedPage[]
): string {
  const indiaResults = searchResults.filter((r) =>
    INDIA_PRIORITY_DOMAINS.some((d) => r.url.includes(d))
  );
  const globalResults = searchResults.filter(
    (r) => !INDIA_PRIORITY_DOMAINS.some((d) => r.url.includes(d))
  );

  let context = `RESEARCH QUERY: ${query}\n\n`;

  if (indiaResults.length) {
    context += `=== INDIAN SOURCES (HIGH PRIORITY) ===\n`;
    indiaResults.forEach((r, i) => {
      context += `[IN-${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}\n\n`;
    });
  }

  if (globalResults.length) {
    context += `\n=== GLOBAL SOURCES (SUPPORTING) ===\n`;
    globalResults.slice(0, 5).forEach((r, i) => {
      context += `[GL-${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}\n\n`;
    });
  }

  context += `\n${"=".repeat(60)}\n=== FULL PAGE CONTENT ===\n`;

  const indianPages = scrapedPages.filter((p) => p.isIndianSource);
  const globalPages = scrapedPages.filter((p) => !p.isIndianSource);

  [...indianPages, ...globalPages].forEach((page, i) => {
    context += `\n[PAGE ${i + 1}] ${page.title}\n`;
    context += `URL: ${page.url}\n`;
    context += `Source Type: ${page.isIndianSource ? "INDIAN SOURCE" : "Global Source"}\n`;
    context += `Words: ${page.wordCount}\n`;
    context += `---\n${page.text.slice(0, 3000)}\n\n`;
  });

  return context;
}

const SYSTEM_PROMPT = `You are Thinkior AI's Deep Research Engine — an India-first, Perplexity-level research analyst built for Indian entrepreneurs.

You have been given a research query, SearXNG search results, and full scraped content from top websites.

Follow this exact pipeline:
STAGE 1 — INTENT CLASSIFICATION: Classify query type
STAGE 2 — INDIA-FIRST SOURCE RANKING: Prioritize Indian sources
STAGE 3 — DEEP DATA EXTRACTION: Extract India-specific data, INR values, Indian company names
STAGE 4 — CROSS-VERIFICATION: Verify stats across sources, flag conflicts
STAGE 5 — SYNTHESIS: Connect dots with India-first analytical lens

Return ONLY this exact JSON, nothing else:
{
  "query": "",
  "intent_type": "Market Research|Competitor Intel|Financial Analysis|Growth Strategy|Industry Trends|Business Validation|Regulatory|General Research",
  "india_relevance": "High|Medium|Low",
  "sub_questions": ["3-5 sub-questions this research answers"],
  "key_findings": ["7-10 specific India-first findings with data points and INR values"],
  "market_data": {
    "india_market_size": "in INR crore or USD with INR equivalent",
    "growth_rate": "CAGR with timeframe",
    "key_players_india": ["top Indian companies or startups"],
    "market_stage": "Nascent|Growing|Mature|Saturated"
  },
  "sources_used": [{"url": "","source_name": "","credibility": "High|Medium|Low","india_specific": true,"key_data_extracted": []}],
  "data_points": ["specific stats with source and date — prefer INR values"],
  "contradictions_or_gaps": ["conflicting data or missing India-specific info"],
  "synthesis": "3-4 paragraph deep analytical synthesis with India-first lens — written like a McKinsey India analyst",
  "india_opportunities": ["3-5 specific opportunities for Indian entrepreneurs"],
  "india_risks": ["3-5 specific risks in Indian market context"],
  "confidence_score": "High|Medium|Low",
  "data_freshness": "how recent the data is",
  "follow_up_queries": ["3 deeper India-specific queries"],
  "summary": "3 sentence executive summary — India-first, data-driven, actionable for Indian founders"
}

STRICT RULES:
1. ALWAYS prioritize Indian market data over global
2. ALWAYS express monetary values in INR first
3. NEVER fabricate Indian statistics — say clearly if not found
4. Consider India-specific factors: UPI, Jio effect, tier-2 cities, GST, price sensitivity
5. Think like an analyst who deeply knows India's startup ecosystem
6. Return ONLY the JSON — absolutely nothing else`;

async function synthesizeWithGroq(
  query: string,
  context: string,
  attempt: number = 1
): Promise<DeepResearchResult | null> {
  const client = attempt === 1 ? groqPrimary : groqFallback;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Research this for Indian entrepreneurs:\n\n${context}`,
        },
      ],
      temperature: 0.15,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(raw) as DeepResearchResult;
  } catch (err: any) {
    if (attempt === 1 && err?.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      return synthesizeWithGroq(query, context, 2);
    }
    console.error("[ThinkiorAI] Groq synthesis error:", err?.message);
    return null;
  }
}

export async function deepResearch(
  query: string,
  options: {
    depth?: "quick" | "standard" | "deep";
    forceIndia?: boolean;
  } = {}
): Promise<DeepResearchResult> {
  const { depth = "standard" } = options;

  const config = {
    quick: { searchResults: 5, scrapeCount: 3 },
    standard: { searchResults: 10, scrapeCount: 6 },
    deep: { searchResults: 15, scrapeCount: 10 },
  }[depth];

  const [mainResults, indiaResults] = await Promise.all([
    searchSearXNG(query, config.searchResults),
    searchSearXNG(`${query} India startup market 2024 2025`, 5),
  ]);

  const seen = new Set<string>();
  const allResults = [...mainResults, ...indiaResults].filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  const scrapedPages = await scrapeWithIndiaPriority(
    allResults,
    config.scrapeCount
  );

  const context = buildResearchContext(query, allResults, scrapedPages);

  const result = await synthesizeWithGroq(query, context);

  if (!result) {
    return {
      query,
      intent_type: "General Research",
      india_relevance: "Medium",
      sub_questions: [],
      key_findings: allResults
        .slice(0, 5)
        .map((r) => r.snippet)
        .filter(Boolean),
      market_data: {
        india_market_size: "Data unavailable",
        growth_rate: "Data unavailable",
        key_players_india: [],
        market_stage: "Unknown",
      },
      sources_used: allResults.slice(0, 5).map((r) => ({
        url: r.url,
        source_name: r.title,
        credibility: "Medium",
        india_specific: INDIA_PRIORITY_DOMAINS.some((d) => r.url.includes(d)),
        key_data_extracted: [r.snippet.slice(0, 100)],
      })),
      data_points: [],
      contradictions_or_gaps: [
        "AI synthesis temporarily unavailable — raw results provided",
      ],
      synthesis: allResults
        .slice(0, 3)
        .map((r) => r.snippet)
        .join(" "),
      india_opportunities: [],
      india_risks: [],
      confidence_score: "Low",
      data_freshness: "Unknown",
      follow_up_queries: [],
      summary: "Research synthesis failed. Please try again.",
    };
  }

  return result;
}

export async function searchWeb(query: string): Promise<string> {
  const result = await deepResearch(query, { depth: "quick" });
  return `${result.summary}\n\nKey Findings:\n${result.key_findings.join("\n")}\n\nData Points:\n${result.data_points.join("\n")}`;
}

export async function researchForReport(
  topics: string[]
): Promise<Record<string, DeepResearchResult>> {
  const results = await Promise.all(
    topics.map(async (topic) => [
      topic,
      await deepResearch(topic, { depth: "standard" }),
    ])
  );
  return Object.fromEntries(results);
}

export async function deepDiveResearch(
  query: string
): Promise<DeepResearchResult> {
  return deepResearch(query, { depth: "deep" });
}
