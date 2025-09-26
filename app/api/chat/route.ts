import { NextRequest, NextResponse } from 'next/server'


const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ text: 'No messages provided.' }, { status: 200 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ text: 'Server is missing GEMINI_API_KEY.' }, { status: 200 })
    }

    // Convert our simplified history to Gemini format
    const contents = messages.map((m: { role: 'user' | 'model'; content: string }) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }))

    // Add brief instruction
    contents.unshift({
      role: 'user',
      parts: [{
        text: 'You are AccessEd, a concise, friendly learning assistant for reading and dyslexia support. Answer clearly and helpfully.'
      }],
    })

    const resp = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      }),
    })

    if (!resp.ok) {
      let message = ''
      try {
        const j = await resp.json()
        message = j?.error?.message || JSON.stringify(j)
      } catch {
        message = await resp.text()
      }
      const statusInfo = `HTTP ${resp.status}${resp.statusText ? ' ' + resp.statusText : ''}`
      return NextResponse.json({ text: `The AI service returned an error (${statusInfo}). Details: ${message}` }, { status: 200 })
    }

    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() || ''

    if (!text) {
      return NextResponse.json({ text: 'The AI service responded without content.' }, { status: 200 })
    }

    return NextResponse.json({ text })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ text: `There was a server error contacting the AI service. Details: ${msg}` }, { status: 200 })
  }
}