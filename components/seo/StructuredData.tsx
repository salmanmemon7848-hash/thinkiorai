export default function StructuredData() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Thinkior AI',
    url: 'https://www.thinkiorai.com',
    logo: 'https://www.thinkiorai.com/icon.svg',
    description:
      'AI co-founder platform for global startup founders. Provides business validation, social marketing roadmaps, source-backed lead research, and practical business reports.',
    foundingDate: '2025',
    founder: {
      '@type': 'Person',
      name: 'Salman Memon',
      jobTitle: 'Founder',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gariyaband',
      addressRegion: 'Chhattisgarh',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@thinkior.com',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://instagram.com/thinkiorai',
      'https://linkedin.com/company/thinkiorai',
    ],
  }

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Thinkior AI',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Startup Intelligence Platform',
    operatingSystem: 'Web',
    url: 'https://www.thinkiorai.com',
    description:
      'AI co-founder for global startup founders. Validates ideas, builds practical social marketing roadmaps, finds source-backed leads, and generates practical business reports.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'INR',
        description: 'Lifetime taste-tier with limited usage',
      },
      {
        '@type': 'Offer',
        name: 'Builder',
        price: '299',
        priceCurrency: 'INR',
        description: '₹299/month — for founders actively building',
        category: 'subscription',
      },
      {
        '@type': 'Offer',
        name: 'Founder Pro',
        price: '599',
        priceCurrency: 'INR',
        description:
          '₹599/month — investor-grade Business Reports + highest daily limits',
        category: 'subscription',
      },
    ],
    featureList: [
      'Business Validation with GO / KILL / PIVOT verdicts',
      'Marketing Engine: social strategy and content packs',
      'Idea Generation Desk',
      'Leads Finder',
      'Co-founder Desk AI Chat (24/7)',
      'Investor-grade Business Reports (PDF export)',
      'Hindi, Hinglish, and English support',
    ],
    inLanguage: ['en-IN', 'hi-IN'],
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How is Thinkior different from ChatGPT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "ChatGPT doesn't know GST, doesn't know which Indian startups are your real competitors, and doesn't know why your ₹299/month price breaks at unit economics. Thinkior is built specifically for the Indian market — with deep context on Indian regulation, competitors, pricing, and investors.",
        },
      },
      {
        '@type': 'Question',
        name: 'What does GO / KILL / PIVOT mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "GO means the idea has real signal — pursue it with the specific actions Thinkior gives you. KILL means the market or economics make it unviable in its current form. PIVOT means the core pain is real but your approach needs to change — and Thinkior tells you exactly how.",
        },
      },
      {
        '@type': 'Question',
        name: 'Is my startup idea data safe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your conversations are private and tied to your account. We do not use your startup ideas to train AI models or share them with third parties. We use Supabase with row-level security so only you can access your data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer refunds?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All payments are final and non-refundable under our standard policy. We encourage you to use the Free tier to evaluate the Service before upgrading. For billing errors, contact hello@thinkior.com within 7 days.',
        },
      },
      {
        '@type': 'Question',
        name: 'What if I hit my daily limit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Paid plans reset at midnight IST every day. Upgrade from Free to Builder (₹299/mo) or Founder Pro (₹599/mo) for higher limits and Business Reports.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  )
}
