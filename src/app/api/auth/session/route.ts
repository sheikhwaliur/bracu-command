import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { studentId } = await req.json()

  if (!studentId) {
    return NextResponse.json({ error: 'No student ID' }, { status: 400 })
  }

  const response = NextResponse.json({ success: true })

  // HttpOnly — JS cannot read — used for auth
  response.cookies.set('bracu_session', studentId, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  // Non-HttpOnly — JS can read — used only for display
  response.cookies.set('bracu_display_id', studentId, {
    httpOnly: false,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('bracu_session')
  response.cookies.delete('bracu_display_id')
  return response
}