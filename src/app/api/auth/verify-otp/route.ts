import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { otp, studentId, type } = await req.json()

    if (!otp || !studentId || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('otp_store')
      .select('*')
      .eq('student_id', studentId)
      .eq('type', type)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'OTP expired or not found. Request a new one.' }, { status: 400 })
    }

    if (new Date(data.expires_at) < new Date()) {
      await supabase.from('otp_store').delete().eq('student_id', studentId).eq('type', type)
      return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 })
    }

    if (data.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })
    }

    // Delete used OTP
    await supabase.from('otp_store').delete().eq('student_id', studentId).eq('type', type)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}