import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { studentId, newPassword } = await req.json()

    if (!studentId || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user's gsuite or recovery email
    const { data: user } = await supabase
      .from('users')
      .select('gsuite_email, recovery_email')
      .eq('student_id', studentId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const email = user.gsuite_email || user.recovery_email

    // Find auth user by email
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(u => u.email === email)

    if (!authUser) {
      return NextResponse.json({ error: 'Auth user not found' }, { status: 404 })
    }

    // Update password using admin API
    const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: newPassword
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}