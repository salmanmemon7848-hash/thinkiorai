import type { Metadata } from 'next'
import LegalLayout from '@/components/marketing/LegalLayout'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Thinkior AI',
  description: 'Thinkior AI refund and cancellation policy for paid subscriptions.',
}

export default function RefundPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Refund & Cancellation Policy"
      subtitle="Please read this policy carefully before purchasing a paid plan."
      lastUpdated="June 2025"
    >
      <Section title="1. No Refund Policy">
        <p>
          <strong>All payments made to Thinkior AI are final and non-refundable.</strong>
        </p>
        <p>
          Once a subscription payment is processed, we do not issue refunds — full or partial — under any circumstances. This applies to all paid plans:
        </p>
        <ul>
          <li><strong>Builder</strong> — ₹299/month</li>
          <li><strong>Founder Pro</strong> — ₹599/month</li>
        </ul>
        <p>
          By completing your payment, you explicitly acknowledge and accept this no-refund policy.
        </p>
      </Section>

      <Section title="2. Non-Refundable Scenarios">
        <p>Refunds will not be issued for, but not limited to, the following situations:</p>
        <ul>
          <li>You did not use the Service during the billing period</li>
          <li>You are dissatisfied with AI-generated outputs or analysis</li>
          <li>You accidentally purchased or chose the wrong plan</li>
          <li>Your account was suspended or terminated due to a policy violation</li>
          <li>You forgot to cancel before the next billing cycle</li>
          <li>Technical issues on your end (device, browser, internet connectivity)</li>
        </ul>
      </Section>

      <Section title="3. Free Tier — Try Before You Pay">
        <p>
          Thinkior AI offers a <strong>Free tier</strong> with no payment required. We strongly encourage you to use the Free plan to evaluate all core features of the platform before upgrading. This ensures you are confident in the value before committing to a paid subscription.
        </p>
      </Section>

      <Section title="4. Cancellation">
        <p>You may cancel your paid subscription at any time:</p>
        <ul>
          <li>Go to <strong>Settings → Billing</strong> in your Thinkior AI dashboard</li>
          <li>Click <strong>Cancel Subscription</strong> and follow the prompts</li>
        </ul>
        <p>
          Upon cancellation:
        </p>
        <ul>
          <li>Your paid plan remains active until the <strong>end of the current billing period</strong></li>
          <li>You will not be charged again after cancellation</li>
          <li>Your account automatically reverts to the Free tier once the period ends</li>
          <li><strong>No refund is issued</strong> for the unused portion of the billing period</li>
        </ul>
      </Section>

      <Section title="5. Billing Errors">
        <p>
          If you believe you were charged incorrectly (e.g., a duplicate charge or a charge for a plan you did not subscribe to), please contact us immediately at <strong>hello@thinkior.com</strong> with your payment reference number.
        </p>
        <p>
          We will investigate and, if a billing error on our part is confirmed, take corrective action. This is the only scenario in which a payment adjustment may be considered and is at our sole discretion.
        </p>
      </Section>

      <Section title="6. Failed or Disputed Payments">
        <p>
          If your payment fails, your subscription will not be activated or renewed. If you initiate a chargeback or payment dispute with your bank or card provider without contacting us first, we reserve the right to permanently suspend your account.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          For billing-related questions, reach out to us at <strong>hello@thinkior.com</strong>. Please include your registered email address and payment reference in your message.
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
