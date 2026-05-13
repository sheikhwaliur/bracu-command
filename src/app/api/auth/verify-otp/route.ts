import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory OTP store (shared via module-level map)
const otpStore = new Map<string, { otp: string; expires: number; type: string }>()

export { otpStore }

export async function POST(req: NextRequest) {
  try {
    const { email, otp, studentId, type } = await req.json()

    if (!otp || !studentId || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const key = `${studentId}_${type}`
    const stored = otpStore.get(key)

    if (!stored) {
      return NextResponse.json({ error: 'OTP expired or not found. Request a new one.' }, { status: 400 })
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(key)
      return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 })
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })
    }

    // OTP valid — delete it so it can't be reused
    otpStore.delete(key)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}