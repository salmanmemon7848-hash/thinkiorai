import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

const VALID_PLANS = ['builder', 'founder_pro'] as const
type ValidPlan = typeof VALID_PLANS[number]

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const userId = payment.notes?.user_id
    const plan = payment.notes?.plan

    if (userId && plan && VALID_PLANS.includes(plan as ValidPlan)) {
      const supabase = await createClient()
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await supabase
        .from('profiles')
        .update({ plan, plan_expires_at: expiresAt.toISOString() })
        .eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
