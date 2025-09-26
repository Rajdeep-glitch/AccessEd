import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ text: 'Please provide text to generate content.' }, { status: 200 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ text: 'Server is missing GEMINI_API_KEY.' }, { status: 200 })
    }

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: 'You are AccessEd, a concise, friendly learning assistant for reading and dyslexia support. Answer clearly and helpfully.'
          }
        ]
      },
      {
        role: 'user',
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512
        }
      })
    })

    if (!response.ok) {
      let message = ''
      try {
        const body = await response.json()
        message = body?.error?.message || JSON.stringify(body)
      } catch {
        message = await response.text()
      }
      const statusInfo = `HTTP ${response.status}${response.statusText ? ' ' + response.statusText : ''}`
      return NextResponse.json({ text: `The AI service returned an error (${statusInfo}). Details: ${message}` }, { status: 200 })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() || ''

    if (!text) {
      return NextResponse.json({ text: 'The AI service responded without content.' }, { status: 200 })
    }

    return NextResponse.json({ text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ text: `There was a server error contacting the AI service. Details: ${message}` }, { status: 200 })
  }
}