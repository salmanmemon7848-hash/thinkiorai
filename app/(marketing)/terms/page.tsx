import type { Metadata } from 'next'
import LegalLayout from '@/components/marketing/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Thinkior AI',
  description: 'Terms and conditions governing your use of Thinkior AI. Updated June 2026.',
}

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using Thinkior AI."
      lastUpdated="June 2026"
    >
      <Section title="1. Acceptance of Terms">
        <p>
          By creating an account or using the Thinkior AI platform (the &ldquo;Service&rdquo;),
          accessible at <strong>thinkiorai.com</strong>, you agree to be bound by these
          Terms &amp; Conditions (&ldquo;Terms&rdquo;). If you do not agree, do not use the
          Service.
        </p>
        <p>
          These Terms constitute a binding agreement between you and Thinkior AI. Thinkior
          AI is operated by Salman Memon, Gariyaband, Chhattisgarh, India.
        </p>
      </Section>

      <Section title="2. Description of Service">
        <p>
          Thinkior AI provides AI-powered tools for early-stage Indian founders, including:
        </p>
        <ul>
          <li>Business idea validation (GO / KILL / PIVOT verdicts)</li>
          <li>Competitor research and intelligence (Builder plan and above)</li>
          <li>Pitch evaluation and feedback</li>
          <li>Idea generation sessions</li>
          <li>AI chat with business context (Co-founder Desk)</li>
          <li>Structured business reports with PDF export (Founder Pro plan only)</li>
        </ul>
        <p>
          The Service is provided on a subscription basis with a free tier and paid monthly
          plans.
        </p>
      </Section>

      <Section title="3. Eligibility">
        <p>
          You must be at least 18 years old and legally capable of entering into a binding
          contract under the Indian Contract Act, 1872 to use the Service. By using Thinkior
          AI, you represent and warrant that you meet these requirements.
        </p>
      </Section>

      <Section title="4. Account Responsibilities">
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activity that occurs under your account</li>
          <li>Providing accurate and current information when registering</li>
          <li>
            Notifying us immediately at <strong>hello@thinkior.com</strong> if you suspect
            any unauthorized access to your account
          </li>
        </ul>
        <p>
          You may not share your account with others, create multiple accounts to
          circumvent plan limits, or resell access to the Service.
        </p>
      </Section>

      <Section title="5. Subscription Plans &amp; Payments">
        <p>Thinkior AI offers the following plans (prices in INR, billed monthly):</p>
        <ul>
          <li><strong>Free</strong> — no payment required; limited lifetime usage</li>
          <li><strong>Builder</strong> — ₹299/month</li>
          <li><strong>Founder Pro</strong> — ₹599/month</li>
        </ul>
        <p>
          All payments are processed securely via <strong>Razorpay</strong>. By subscribing
          to a paid plan, you authorise us to charge your chosen payment method for the
          applicable monthly fee until you cancel.
        </p>
        <p>
          Prices are subject to change with <strong>30 days&apos; prior written notice</strong>{' '}
          to existing subscribers. Price changes apply at the start of the next billing
          period following the notice.
        </p>
        <p>
          All fees are exclusive of GST. GST will be charged as applicable under Indian tax
          law at the time of payment.
        </p>
      </Section>

      <Section title="6. No Refund Policy">
        <p>
          <strong>All payments made to Thinkior AI are final and non-refundable.</strong> By
          completing a payment, you acknowledge and agree that no refunds — full or partial
          — will be issued under any circumstances, including but not limited to:
        </p>
        <ul>
          <li>Unused portion of a subscription period</li>
          <li>Dissatisfaction with AI-generated outputs</li>
          <li>Accidental or duplicate purchases</li>
          <li>Account suspension or termination (voluntary or otherwise) under Section 12</li>
        </ul>
        <p>
          We encourage you to use the Free tier to evaluate the Service before upgrading to
          a paid plan.
        </p>
        <p>
          The above is without prejudice to your statutory rights under the Consumer
          Protection Act, 2019. If you believe a payment was processed in error (e.g. a
          duplicate charge or a charge for a plan you did not authorise), contact us at{' '}
          <strong>hello@thinkior.com</strong> within 7 days with your payment reference and
          we will investigate in good faith.
        </p>
      </Section>

      <Section title="7. Cancellation">
        <p>
          You may cancel your paid subscription at any time from{' '}
          <strong>Settings → Billing</strong> in your dashboard. Upon cancellation, your
          paid plan remains active until the end of the current billing period, after which
          your account reverts to the Free tier. No refund is issued for the remaining
          period.
        </p>
      </Section>

      <Section title="8. Service Availability">
        <p>
          We target <strong>99% monthly uptime</strong> but do not guarantee uninterrupted
          or error-free access to the Service. The Service may be temporarily unavailable
          due to maintenance, infrastructure issues, AI provider outages, or factors beyond
          our reasonable control. Planned maintenance will be announced in advance where
          possible.
        </p>
      </Section>

      <Section title="9. Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
          <li>Attempt to reverse-engineer, decompile, scrape, or abuse the API or AI models</li>
          <li>Submit harmful, misleading, defamatory, or fraudulent content</li>
          <li>Circumvent rate limits, plan restrictions, or any technical access controls</li>
          <li>Use the Service to generate content that violates the intellectual property, privacy, or other rights of any third party</li>
          <li>Use the Service to compete with Thinkior AI or to train competing AI products</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate any account that violates these
          rules without prior notice and without refund.
        </p>
      </Section>

      <Section title="10. AI-Generated Content Disclaimer">
        <p>
          Thinkior AI provides AI-generated analysis, verdicts, and reports for{' '}
          <strong>informational purposes only</strong>. This content does not constitute
          financial, legal, tax, regulatory, or investment advice. You are solely
          responsible for any business decisions made based on outputs from the Service.
        </p>
        <p>
          AI outputs may be inaccurate, incomplete, biased, or outdated due to limitations
          of the underlying models and the public data sources we reference. Always verify
          critical information — including market sizes, regulatory requirements, and
          competitor data — from authoritative primary sources before acting on it.
        </p>
        <p>
          You retain ownership of the AI outputs you generate through the Service. We
          retain ownership of the platform, design, code, branding, and underlying AI
          systems.
        </p>
      </Section>

      <Section title="11. Intellectual Property">
        <p>
          The Thinkior AI platform, its design, code, branding, prompts, and AI systems are
          owned by Thinkior AI and protected by applicable intellectual property laws. You
          may not reproduce, distribute, or create derivative works without our written
          permission.
        </p>
        <p>
          You retain ownership of any content you input into the platform (&ldquo;User
          Content&rdquo;). By submitting User Content, you grant us a limited, worldwide,
          non-exclusive licence to process it for the sole purpose of delivering the
          Service to you.
        </p>
      </Section>

      <Section title="12. Termination">
        <p>
          We may suspend or terminate your access to the Service at our sole discretion if
          you breach these Terms, engage in fraudulent activity, or pose a security risk.
          You may terminate your account at any time via account settings. Upon
          termination, your data will be handled per our Privacy Policy.
        </p>
      </Section>

      <Section title="13. Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless Thinkior AI and its operator
          from and against any claims, liabilities, damages, losses, and expenses (including
          reasonable legal fees) arising out of or in any way connected with your misuse of
          the Service, your violation of these Terms, or your violation of any third
          party&apos;s rights.
        </p>
      </Section>

      <Section title="14. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, Thinkior AI shall not be
          liable for any indirect, incidental, special, consequential, exemplary, or
          punitive damages arising from your use of (or inability to use) the Service,
          even if we have been advised of the possibility of such damages.
        </p>
        <p>
          Our total aggregate liability to you for any and all claims arising out of or
          related to the Service shall not exceed the amount you actually paid to us in
          the <strong>3 months</strong> immediately preceding the event giving rise to the
          claim, or INR 1,000, whichever is greater.
        </p>
        <p>
          Nothing in these Terms shall limit or exclude liability that cannot be limited
          or excluded under applicable law, including liability for fraud, death, or
          personal injury caused by negligence.
        </p>
      </Section>

      <Section title="15. Governing Law &amp; Dispute Resolution">
        <p>
          These Terms are governed by the laws of the Republic of India. Any disputes
          arising out of or in connection with these Terms shall first be attempted to be
          resolved amicably by contacting us at <strong>hello@thinkior.com</strong>. If a
          dispute is not resolved within 30 days of written notice, it shall be subject to
          the exclusive jurisdiction of the competent courts at Raipur, Chhattisgarh,
          India.
        </p>
        <p>
          Nothing in this clause prevents either party from seeking interim or injunctive
          relief from a competent court.
        </p>
      </Section>

      <Section title="16. Severability">
        <p>
          If any provision of these Terms is held to be invalid, illegal, or unenforceable,
          the remaining provisions shall continue in full force and effect.
        </p>
      </Section>

      <Section title="17. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Material changes will be
          communicated via email or an in-app notice at least 7 days before they take
          effect. The &ldquo;Last updated&rdquo; date at the top of this page reflects the
          current version. Continued use after the effective date constitutes acceptance
          of the revised Terms.
        </p>
      </Section>

      <Section title="18. Contact">
        <p>
          For questions about these Terms, contact us at{' '}
          <strong>hello@thinkior.com</strong>.
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
