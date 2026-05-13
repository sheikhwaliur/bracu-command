import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Store OTPs temporarily in memory (resets on redeploy — fine for short-lived OTPs)
const otpStore = new Map<string, { otp: string; expires: number; type: string }>()

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, studentId, type } = await req.json()

    if (!email || !studentId || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Validate G Suite email for signup
    if (type === 'signup' && !email.endsWith('@g.bracu.ac.bd')) {
      return NextResponse.json({ error: 'Must use @g.bracu.ac.bd email' }, { status: 400 })
    }

    const otp = generateOTP()
    const key = `${studentId}_${type}`
    
    // Store OTP with 10 min expiry
    otpStore.set(key, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      type,
    })

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: type === 'signup'
        ? 'BRACU Command — Verify Your Email'
        : 'BRACU Command — Password Reset OTP',
      html: `
        <div style="font-family: monospace; background: #0A0E1A; color: #E8F4FF; padding: 40px; max-width: 500px; margin: 0 auto;">
          <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin-bottom: 8px;">
            BRACU<span style="color: #00B4FF;">/</span>CMD
          </div>
          <div style="font-size: 10px; color: #4A7A9B; letter-spacing: 2px; margin-bottom: 32px; text-transform: uppercase;">
            ${type === 'signup' ? 'Email Verification' : 'Password Reset'}
          </div>
          <div style="font-size: 13px; color: #7AB8D4; margin-bottom: 24px; line-height: 1.8;">
            ${type === 'signup'
              ? `Your verification OTP for Student ID <strong style="color:#00B4FF">${studentId}</strong>:`
              : `Your password reset OTP for Student ID <strong style="color:#00B4FF">${studentId}</strong>:`
            }
          </div>
          <div style="background: #0D1221; border: 1px solid rgba(0,180,255,0.2); padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; font-weight: 700; letter-spacing: 12px; color: #00B4FF;">${otp}</div>
          </div>
          <div style="font-size: 11px; color: #4A7A9B; line-height: 1.8;">
            This OTP expires in <strong style="color:#E8F4FF">10 minutes</strong>.<br/>
            If you didn't request this, ignore this email.
          </div>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(0,180,255,0.1); font-size: 9px; color: #1A2A3A; letter-spacing: 2px; text-transform: uppercase;">
            BRAC University // Dhaka, Bangladesh
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Export store for verify route
export { otpStore }