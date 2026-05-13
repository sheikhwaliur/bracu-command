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

    // Get user's gsuite email (this is what's in auth.users)
    const { data: user } = await supabase
      .from('users')
      .select('gsuite_email, recovery_email')
      .eq('student_id', studentId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Auth user is always linked to gsuite_email
    const authEmail = user.gsuite_email

    // Find auth user by gsuite email
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(u => u.email === authEmail)

    if (!authUser) {
      return NextResponse.json({ error: 'Auth user not found' }, { status: 404 })
    }

    // Update password
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