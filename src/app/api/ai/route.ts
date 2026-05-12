import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `You are BRACU Command AI — an academic assistant for BRAC University students in Dhaka, Bangladesh.

You help with:
- BRACU course topics (CSE, EEE, BBA, MAT, PHY, ENG departments)
- Past paper patterns and exam preparation
- Assignment help and concept explanation
- Routine building with USIS seat data
- Career advice for BD tech market
- Faculty and course recommendations

Be concise, practical, and student-friendly. Use → for bullet points. Format answers clearly.`

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContent(message)
    const response = result.response.text()

    return NextResponse.json({ response })

  } catch (error: any) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}