import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { PLAN_PRICES } from '@/lib/constants'
import type { Plan } from '@/types'

const VALID_PLANS: Plan[] = ['builder', 'founder_pro']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json()

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 })
  }

  // 1. Verify the payment signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 2. Fetch the order from Razorpay to get plan from notes — never trust client
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  // The Razorpay SDK types incorrectly declare orders.fetch as Promise<void>
  // at runtime it returns the full order object — cast through unknown to access notes
  let order: { notes: Record<string, string> }
  try {
    order = await razorpay.orders.fetch(razorpay_order_id) as unknown as typeof order
  } catch {
    return NextResponse.json({ error: 'Could not verify order' }, { status: 500 })
  }

  const plan = order.notes?.plan
  if (!plan || !VALID_PLANS.includes(plan as Plan)) {
    return NextResponse.json({ error: 'Invalid plan in order' }, { status: 400 })
  }

  // 3. Confirm the order belongs to the authenticated user
  if (order.notes?.user_id !== user.id) {
    return NextResponse.json({ error: 'Order does not belong to this account' }, { status: 403 })
  }

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 1)

  await supabase
    .from('profiles')
    .update({ plan, plan_expires_at: expiresAt.toISOString() })
    .eq('id', user.id)

  await supabase.from('subscriptions').insert({
    user_id: user.id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    amount: PLAN_PRICES[plan as Plan] * 100,
    currency: 'INR',
    status: 'paid',
  })

  return NextResponse.json({ success: true })
}
