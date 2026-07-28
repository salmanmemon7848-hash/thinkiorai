import type { Metadata } from 'next'
import LegalLayout from '@/components/marketing/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — Thinkior AI',
  description: 'How Thinkior AI collects, uses, and protects your information. DPDP Act 2023 aligned. Updated June 2026.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="We respect your privacy and are committed to protecting your personal data."
      lastUpdated="June 2026"
    >
      <Section title="1. Who We Are">
        <p>
          Thinkior AI (&ldquo;Thinkior&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is an
          AI-powered platform built for early-stage Indian founders, accessible at{' '}
          <strong>thinkiorai.com</strong> (the &ldquo;Platform&rdquo;). We provide tools for business
          validation, social marketing guidance, public lead research, idea generation, AI-assisted analysis,
          and investor-grade business reports.
        </p>
        <p>
          Thinkior AI is operated by an individual founder (Salman Memon, Gariyaband,
          Chhattisgarh, India). For the purposes of the Digital Personal Data Protection
          Act, 2023 (&ldquo;DPDP Act&rdquo;), we act as the <strong>Data Fiduciary</strong> for
          personal data you provide directly to us.
        </p>
        <p>
          This Privacy Policy explains what personal information we collect when you use our
          Platform, why we collect it, and how we use and protect it.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <SubHeading>2.1 Account Information</SubHeading>
        <p>
          When you sign up, we collect your email address, name (if you provide it), and
          avatar URL (if you sign in with Google or another OAuth provider). We store these
          in our user database to authenticate you and personalise your dashboard.
        </p>

        <SubHeading>2.2 Usage Data</SubHeading>
        <p>
          We collect information about how you use the Platform: features accessed, queries
          submitted, reports generated, and session activity. This data helps us improve the
          product, enforce plan limits, and prevent abuse.
        </p>

        <SubHeading>2.3 Payment Information</SubHeading>
        <p>
          Payments are processed by <strong>Razorpay</strong>. We do not store your card or
          bank details. We receive and store only a payment reference ID, the plan purchased,
          the amount paid (in INR), the order ID, and the payment signature — for the purpose
          of confirming and reconciling your subscription.
        </p>

        <SubHeading>2.4 AI Queries &amp; Outputs</SubHeading>
        <p>
          When you use any AI feature (Business Validator, Marketing Engine, Ideas Desk,
          Leads Finder, Co-founder Desk Chat, or Business Reports), your input prompt and
          the AI-generated output are sent to our AI inference providers
          (<strong>Groq</strong> and <strong>Cerebras</strong>) to generate a response.
        </p>
        <p>
          We store the query, the response, and metadata (feature used, model used, token
          count, response time) in our database so that:
        </p>
        <ul>
          <li>You can revisit past conversations and reports from your dashboard</li>
          <li>We can compute and enforce your daily usage limits</li>
          <li>We can debug and improve model quality</li>
        </ul>
        <p>
          Per our agreements with Groq and Cerebras, your prompts and outputs are{' '}
          <strong>not used to train their foundation models</strong>.
        </p>

        <SubHeading>2.5 Business Reports</SubHeading>
        <p>
          When you generate a Business Report, we store the full report (in JSONB form) in
          our database along with the input data you provided. Reports are tied to your
          account and remain accessible until you delete them or delete your account.
        </p>

        <SubHeading>2.6 Device &amp; Log Data</SubHeading>
        <p>
          We automatically collect browser type, IP address (truncated/anonymised in our
          logs), referring URLs, and timestamps for security monitoring, fraud detection,
          and diagnostics.
        </p>

        <SubHeading>2.7 Cookies &amp; Analytics</SubHeading>
        <p>
          We use the following:
        </p>
        <ul>
          <li>
            <strong>Essential cookies</strong> — for authentication sessions and security
            tokens. These cannot be disabled while you are signed in.
          </li>
          <li>
            <strong>Google Analytics</strong> — for anonymised, aggregated traffic analysis.
            We have IP anonymisation enabled. No personally identifiable information is sent
            to Google. You can opt out via your browser&apos;s Do Not Track setting or by
            using an ad blocker.
          </li>
        </ul>
        <p>
          We do not use advertising or cross-site tracking cookies. We do not use Facebook
          Pixel, LinkedIn Insight, or similar trackers.
        </p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use your information to:</p>
        <ul>
          <li>Operate and deliver the Thinkior AI Platform to you</li>
          <li>Enforce your plan&apos;s daily and lifetime usage limits</li>
          <li>Send transactional emails (account confirmation, payment receipts, important service notices)</li>
          <li>Improve AI accuracy and Platform features using aggregated, anonymised data</li>
          <li>Detect and prevent fraud, abuse, security incidents, and plan-limit circumvention</li>
          <li>Comply with applicable Indian laws and regulations</li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal data to third parties. We do{' '}
          <strong>not</strong> share your prompts or AI outputs with anyone except the AI
          providers strictly necessary to generate the response.
        </p>
      </Section>

      <Section title="4. Third-Party Services &amp; Infrastructure">
        <p>
          We rely on the following trusted third parties to operate. Each operates under
          their own privacy policy and data-processing terms.
        </p>
        <ul>
          <li>
            <strong>Supabase Inc.</strong> — authentication, database hosting, and row-level
            security (your data is stored in Supabase Postgres with RLS enabled so only you
            can access your records).
          </li>
          <li>
            <strong>Groq Inc.</strong> — AI inference (your prompts are processed by hosted
            Llama models; data is not used for training per their DPA).
          </li>
          <li>
            <strong>Cerebras Systems</strong> — AI inference fallback (same data handling
            guarantees as Groq).
          </li>
          <li>
            <strong>Razorpay</strong> — payment processing. PCI-DSS compliant. Governed by
            Razorpay&apos;s own privacy policy.
          </li>
          <li>
            <strong>SearXNG (self-hosted)</strong> — meta-search engine we use to gather
            public web data for lead research and reports. We host this ourselves; no
            third party sees your queries.
          </li>
          <li>
            <strong>Vercel Inc.</strong> — application hosting and edge network.
          </li>
          <li>
            <strong>Google Analytics</strong> — anonymised traffic analytics only.
          </li>
        </ul>
      </Section>

      <Section title="5. Data Retention">
        <ul>
          <li>
            <strong>Account data</strong> — retained for the lifetime of your account. On
            account deletion, we delete or irreversibly anonymise your personal data within{' '}
            <strong>30 days</strong>, except where retention is required by law (e.g. financial
            records under the Income Tax Act, 1961).
          </li>
          <li>
            <strong>AI query logs</strong> — retained for up to{' '}
            <strong>90 days</strong> for product improvement and abuse investigation, then
            auto-purged or anonymised.
          </li>
          <li>
            <strong>Business reports</strong> — retained until you delete them or delete
            your account.
          </li>
          <li>
            <strong>Payment records</strong> — retained for a minimum of{' '}
            <strong>8 years</strong> as required by Indian tax law.
          </li>
        </ul>
      </Section>

      <Section title="6. Your Rights (DPDP Act 2023)">
        <p>
          Under the Digital Personal Data Protection Act, 2023, you have the right to:
        </p>
        <ul>
          <li>
            <strong>Access</strong> a copy of the personal data we hold about you
          </li>
          <li>
            <strong>Correction</strong> of inaccurate or incomplete data
          </li>
          <li>
            <strong>Erasure</strong> — request deletion of your account and associated data
          </li>
          <li>
            <strong>Withdrawal of consent</strong> — withdraw consent for processing at any
            time (subject to legal obligations)
          </li>
          <li>
            <strong>Grievance redressal</strong> — file a complaint and have it addressed
          </li>
          <li>
            <strong>Nominate</strong> another individual to exercise your rights in the event
            of your death or incapacity
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <strong>hello@thinkior.com</strong>. We will acknowledge your request within{' '}
          <strong>72 hours</strong> and resolve it within{' '}
          <strong>15 days</strong> as required by the DPDP Act.
        </p>
      </Section>

      <Section title="7. Grievance Officer">
        <p>
          In compliance with the Information Technology Act, 2000 (Intermediary Guidelines
          and Digital Media Ethics Code Rules, 2021) and the DPDP Act, 2023, the contact
          details of our Grievance Officer are:
        </p>
        <ul>
          <li>
            <strong>Name:</strong> Salman Memon
          </li>
          <li>
            <strong>Email:</strong> <strong>hello@thinkior.com</strong>
          </li>
          <li>
            <strong>Response time:</strong> within 72 hours of receipt, resolution within 15
            days
          </li>
        </ul>
      </Section>

      <Section title="8. Children">
        <p>
          Thinkior AI is not directed at individuals under the age of 18. We do not knowingly
          collect data from minors. If you believe a minor has created an account, contact
          us at <strong>hello@thinkior.com</strong> and we will delete the account.
        </p>
      </Section>

      <Section title="9. International Data Transfers">
        <p>
          Some of our infrastructure providers (Supabase, Vercel, Groq, Cerebras, Google
          Analytics) may process your data on servers located outside India, including in
          the United States and European Union. We ensure that any such transfers are
          governed by adequate contractual safeguards consistent with the DPDP Act.
        </p>
      </Section>

      <Section title="10. Security">
        <p>
          We implement industry-standard measures including:
        </p>
        <ul>
          <li>HTTPS encryption for all data in transit</li>
          <li>Supabase Postgres with row-level security (RLS) on all user data tables</li>
          <li>Access controls and least-privilege principles for any operator access</li>
          <li>API key rotation and server-side enforcement of plan and rate limits</li>
        </ul>
        <p>
          No system is 100% secure; you use the Platform at your own risk.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          announced via email or a notice on the Platform at least 7 days before they take
          effect. The &ldquo;Last updated&rdquo; date at the top of this page reflects the
          current version. Continued use after the effective date constitutes acceptance.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          For privacy-related questions, data access requests, or to exercise your rights
          under the DPDP Act, email us at <strong>hello@thinkior.com</strong>.
        </p>
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
