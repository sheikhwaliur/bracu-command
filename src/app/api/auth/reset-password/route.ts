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

    const { data: user } = await supabase
      .from('users')
      .select('gsuite_email, recovery_email, auth_uid')
      .eq('student_id', studentId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let userId = user.auth_uid

    // If no auth_uid stored, find by email
    if (!userId) {
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000, page: 1 })
      const authUser = users?.find(u => u.email === user.gsuite_email || u.email === user.recovery_email)
      if (!authUser) {
        return NextResponse.json({ error: 'Auth user not found' }, { status: 404 })
      }
      userId = authUser.id
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
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