import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const otpStore = new Map<string, { otp: string; expires: number }>()

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, studentId, type } = await req.json()

    if (!email || !studentId || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (type === 'signup' && !email.endsWith('@g.bracu.ac.bd')) {
      return NextResponse.json({ error: 'Must use your BRACU G Suite email (@g.bracu.ac.bd)' }, { status: 400 })
    }

    const otp = generateOTP()
    const key = `${studentId}_${type}`
    otpStore.set(key, { otp, expires: Date.now() + 10 * 60 * 1000 })

    // Use Supabase admin with Brevo SMTP to send email
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        data: { otp, studentId, purpose: type }
      }
    })

    if (error) {
      console.error('Supabase email error:', error)
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export { otpStore }