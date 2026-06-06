import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'
import { PLAN_PRICES } from '@/lib/constants'
import type { Plan } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const validPlans: Plan[] = ['builder', 'founder_pro']
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const amount = PLAN_PRICES[plan as Plan] * 100

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `thinkior_${user.id.slice(0, 8)}_${Date.now()}`,
    notes: { plan, user_id: user.id },
  })

  return NextResponse.json({ orderId: order.id, amount, currency: 'INR' })
}
