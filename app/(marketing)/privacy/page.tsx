import type { Metadata } from 'next'
import LegalLayout from '@/components/marketing/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — Thinkior AI',
  description: 'How Thinkior AI collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="We respect your privacy and are committed to protecting your personal data."
      lastUpdated="June 2025"
    >
      <Section title="1. Who We Are">
        <p>
          Thinkior AI (&ldquo;Thinkior&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is an AI-powered platform built for early-stage Indian founders, accessible at <strong>thinkior.com</strong>. We provide tools for business validation, competitor research, pitch evaluation, idea generation, and AI-assisted analysis.
        </p>
        <p>
          This Privacy Policy explains what personal information we collect when you use our platform, why we collect it, and how we use and protect it.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <SubHeading>2.1 Account Information</SubHeading>
        <p>When you sign up, we collect your email address and any profile information you provide.</p>

        <SubHeading>2.2 Usage Data</SubHeading>
        <p>We collect information about how you use the platform: features accessed, queries submitted, reports generated, and session activity. This data helps us improve the product and enforce plan limits.</p>

        <SubHeading>2.3 Payment Information</SubHeading>
        <p>Payments are processed by <strong>Razorpay</strong>. We do not store your card details. We receive and store only a payment confirmation reference, the plan purchased, and the amount paid (in INR).</p>

        <SubHeading>2.4 AI Queries</SubHeading>
        <p>When you use any AI feature (Validator, Competitor, Ideas, Pitch, Chat, Reports), your input is sent to our AI inference provider (<strong>Groq</strong>) to generate a response. We may store the query and response for display in your dashboard and to compute usage limits.</p>

        <SubHeading>2.5 Device &amp; Log Data</SubHeading>
        <p>We automatically collect browser type, IP address, referring URLs, and timestamps for security monitoring and diagnostics.</p>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul>
          <li>To operate and deliver the Thinkior AI platform to you</li>
          <li>To enforce your plan&apos;s daily usage limits</li>
          <li>To send transactional emails (account confirmation, payment receipts)</li>
          <li>To improve AI accuracy and platform features using aggregated, anonymized data</li>
          <li>To detect and prevent fraud, abuse, or security incidents</li>
          <li>To comply with applicable Indian laws and regulations</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal data to third parties.</p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>We rely on the following trusted third parties to operate:</p>
        <ul>
          <li><strong>Supabase</strong> — authentication and database hosting</li>
          <li><strong>Groq</strong> — AI inference (your queries are processed here)</li>
          <li><strong>Razorpay</strong> — payment processing (governed by their own privacy policy)</li>
        </ul>
        <p>Each provider operates under their own privacy policy and data-processing agreements. We encourage you to review them.</p>
      </Section>

      <Section title="5. Data Retention">
        <p>We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law.</p>
        <p>AI query logs are retained for up to 90 days for product improvement and then purged or anonymized.</p>
      </Section>

      <Section title="6. Cookies">
        <p>We use essential cookies only — for authentication sessions and security tokens. We do not use advertising or tracking cookies.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Object to or restrict certain processing activities</li>
        </ul>
        <p>To exercise any of these rights, contact us at <strong>hello@thinkior.com</strong>.</p>
      </Section>

      <Section title="8. Security">
        <p>We implement industry-standard measures including encrypted connections (HTTPS), row-level security in our database, and access controls. No system is 100% secure; you use the platform at your own risk.</p>
      </Section>

      <Section title="9. Children">
        <p>Thinkior AI is not directed at individuals under the age of 18. We do not knowingly collect data from minors.</p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. Material changes will be announced via email or a notice on the platform. Continued use after the effective date constitutes acceptance.</p>
      </Section>

      <Section title="11. Contact">
        <p>For privacy-related questions or requests, email us at <strong>hello@thinkior.com</strong>. We aim to respond within 5 business days.</p>
      </Section>
    </LegalLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 pb-10 border-b border-line last:border-0 last:mb-0 last:pb-0">
      <h2 className="font-display font-semibold text-xl text-fg tracking-tight mb-4">{title}</h2>
      <div className="space-y-3 text-[15px] text-fg-dim leading-relaxed">{children}</div>
    </div>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-medium text-base text-fg tracking-tight mt-5 mb-2">{children}</h3>
  )
}
