import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const studentId = body.studentId

    if (!studentId) {
      return NextResponse.json({ error: 'No student ID' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('bracu_session', String(studentId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.set('bracu_display_id', String(studentId), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response

  } catch (err) {
    console.error('Session error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('bracu_session')
  response.cookies.delete('bracu_display_id')
  return response
}