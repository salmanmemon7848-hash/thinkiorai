import type { Metadata } from 'next'
import LegalLayout from '@/components/marketing/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Thinkior AI',
  description: 'Terms and conditions governing your use of Thinkior AI.',
}

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using Thinkior AI."
      lastUpdated="June 2025"
    >
      <Section title="1. Acceptance of Terms">
        <p>
          By creating an account or using the Thinkior AI platform (&ldquo;Service&rdquo;), you agree to be bound by these Terms &amp; Conditions (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service.
        </p>
        <p>
          These Terms constitute a binding agreement between you and Thinkior AI, accessible at <strong>thinkior.com</strong>.
        </p>
      </Section>

      <Section title="2. Description of Service">
        <p>
          Thinkior AI provides AI-powered tools for early-stage Indian founders, including:
        </p>
        <ul>
          <li>Business idea validation (GO / KILL / PIVOT verdicts)</li>
          <li>Competitor research and intelligence</li>
          <li>Pitch evaluation and feedback</li>
          <li>Idea generation sessions</li>
          <li>AI chat with business context</li>
          <li>Structured business reports with PDF export</li>
        </ul>
        <p>The Service is provided on a subscription basis with a free tier and paid plans.</p>
      </Section>

      <Section title="3. Eligibility">
        <p>You must be at least 18 years old and legally capable of entering contracts to use the Service. By using Thinkior AI, you represent that you meet these requirements.</p>
      </Section>

      <Section title="4. Account Responsibilities">
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activity that occurs under your account</li>
          <li>Providing accurate information when registering</li>
          <li>Notifying us immediately at <strong>hello@thinkior.com</strong> if you suspect unauthorized access</li>
        </ul>
        <p>You may not share your account with others or create multiple accounts to circumvent plan limits.</p>
      </Section>

      <Section title="5. Subscription Plans & Payments">
        <p>Thinkior AI offers the following plans (prices in INR, billed monthly):</p>
        <ul>
          <li><strong>Free</strong> — no payment required; limited daily usage</li>
          <li><strong>Builder</strong> — ₹299/month</li>
          <li><strong>Founder Pro</strong> — ₹599/month</li>
        </ul>
        <p>All payments are processed securely via <strong>Razorpay</strong>. By subscribing to a paid plan, you authorize us to charge your payment method for the applicable monthly fee.</p>
        <p>Prices are subject to change with 30 days&apos; prior notice to existing subscribers.</p>
      </Section>

      <Section title="6. No Refund Policy">
        <p>
          <strong>All payments made to Thinkior AI are final and non-refundable.</strong> By completing a payment, you acknowledge and agree that no refunds — full or partial — will be issued under any circumstances, including but not limited to:
        </p>
        <ul>
          <li>Unused portion of a subscription period</li>
          <li>Dissatisfaction with AI-generated outputs</li>
          <li>Accidental or duplicate purchases</li>
          <li>Account termination (voluntary or otherwise)</li>
        </ul>
        <p>We encourage you to use the Free tier to evaluate the Service before upgrading to a paid plan.</p>
      </Section>

      <Section title="7. Cancellation">
        <p>You may cancel your paid subscription at any time from your account settings. Upon cancellation, your plan remains active until the end of the current billing period, after which your account reverts to the Free tier. No refund is issued for the remaining period.</p>
      </Section>

      <Section title="8. Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to reverse-engineer, scrape, or abuse the API or AI models</li>
          <li>Submit harmful, misleading, or fraudulent content</li>
          <li>Circumvent rate limits or plan restrictions</li>
          <li>Use the Service to generate content that violates the rights of others</li>
        </ul>
        <p>We reserve the right to suspend or terminate any account that violates these rules without prior notice or refund.</p>
      </Section>

      <Section title="9. AI-Generated Content Disclaimer">
        <p>
          Thinkior AI provides AI-generated analysis, verdicts, and reports for <strong>informational purposes only</strong>. This content does not constitute financial, legal, or investment advice. You are solely responsible for any business decisions made based on outputs from the Service.
        </p>
        <p>AI outputs may be inaccurate, incomplete, or outdated. Always verify critical information from authoritative sources before acting on it.</p>
      </Section>

      <Section title="10. Intellectual Property">
        <p>The Thinkior AI platform, its design, code, branding, and AI systems are owned by Thinkior AI and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.</p>
        <p>You retain ownership of any content you input into the platform. By submitting content, you grant us a limited license to process it for delivering the Service.</p>
      </Section>

      <Section title="11. Limitation of Liability">
        <p>To the fullest extent permitted by law, Thinkior AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of (or inability to use) the Service, even if we have been advised of the possibility of such damages.</p>
        <p>Our total liability to you for any claim shall not exceed the amount you paid to us in the 30 days preceding the claim.</p>
      </Section>

      <Section title="12. Termination">
        <p>We may suspend or terminate your access to the Service at our sole discretion if you breach these Terms. You may terminate your account at any time via account settings. Upon termination, your data will be handled per our Privacy Policy.</p>
      </Section>

      <Section title="13. Governing Law">
        <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
      </Section>

      <Section title="14. Changes to These Terms">
        <p>We may update these Terms from time to time. Material changes will be communicated via email or an in-app notice. Continued use after the effective date constitutes acceptance of the revised Terms.</p>
      </Section>

      <Section title="15. Contact">
        <p>For questions about these Terms, contact us at <strong>hello@thinkior.com</strong>.</p>
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
