import { NextRequest, NextResponse } from 'next/server'

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
      return NextResponse.json({ error: 'Must use @g.bracu.ac.bd email' }, { status: 400 })
    }

    const otp = generateOTP()
    otpStore.set(`${studentId}_${type}`, { otp, expires: Date.now() + 10 * 60 * 1000 })

    // Send via Brevo API directly
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'BRACU Command', email: 'bracucommand@gmail.com' },
        to: [{ email }],
        subject: type === 'signup' ? 'BRACU Command — Verify Your Email' : 'BRACU Command — Password Reset OTP',
        htmlContent: `
          <div style="font-family:monospace;background:#0A0E1A;color:#E8F4FF;padding:40px;max-width:500px;margin:0 auto;">
            <div style="font-size:22px;font-weight:700;letter-spacing:4px;margin-bottom:8px;">BRACU<span style="color:#00B4FF;">/</span>CMD</div>
            <div style="font-size:10px;color:#4A7A9B;letter-spacing:2px;margin-bottom:32px;text-transform:uppercase;">${type === 'signup' ? 'Email Verification' : 'Password Reset'}</div>
            <div style="font-size:13px;color:#7AB8D4;margin-bottom:24px;">Your OTP for Student ID <strong style="color:#00B4FF">${studentId}</strong>:</div>
            <div style="background:#0D1221;border:1px solid rgba(0,180,255,0.2);padding:24px;text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;font-weight:700;letter-spacing:12px;color:#00B4FF;">${otp}</div>
            </div>
            <div style="font-size:11px;color:#4A7A9B;">Expires in <strong style="color:#E8F4FF">10 minutes</strong>.</div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('Brevo error:', err)
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export { otpStore }