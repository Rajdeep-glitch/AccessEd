import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const TEXT_CHARACTER_LIMIT = 150_000
const DEFAULT_PROMPT = `You are AccessEd, a concise, student-friendly learning coach. Summarize the provided material and respond in JSON with this shape: {"summary": string, "keyPoints": string[], "extendedSummary": string | null}. Keep summaries grounded in the input.`

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL
  || process.env.NEXT_PUBLIC_APP_URL
  || process.env.NEXT_PUBLIC_API_URL
  || '*'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function applyCors(response: NextResponse) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value)
  }
  if (ALLOWED_ORIGIN !== '*') {
    response.headers.set('Vary', 'Origin')
  }
  return response
}

function errorResponse(message: string, status = 400) {
  return applyCors(NextResponse.json({ error: message }, { status }))
}

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

async function readFileAsText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (!buffer.length) {
    throw new Error('Uploaded file is empty or unreadable.')
  }

  const text = buffer.toString('utf8').trim()
  if (!text) {
    throw new Error('No readable text found in the uploaded file. Please upload a TXT file.')
  }
  return text
}

function parseGeminiJsonResponse(rawOutput: string) {
  const trimmedOutput = rawOutput.trim()

  const codeBlockMatch = trimmedOutput.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  const content = codeBlockMatch ? codeBlockMatch[1].trim() : trimmedOutput

  try {
    return JSON.parse(content)
  } catch {
    const firstBrace = content.indexOf('{')
    const lastBrace = content.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const slicedJson = content.slice(firstBrace, lastBrace + 1)
      try {
        return JSON.parse(slicedJson)
      } catch {
        // fall through to error below
      }
    }
    throw new Error('Gemini response was not valid JSON.')
  }
}

async function callGemini(promptPayload: unknown) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Server is missing GEMINI_API_KEY.')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: DEFAULT_PROMPT }]
        },
        {
          role: 'user',
          parts: [{ text: JSON.stringify(promptPayload) }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 768,
      }
    })
  })

  if (!response.ok) {
    let message: string
    try {
      const data = await response.json()
      message = data?.error?.message || JSON.stringify(data)
    } catch {
      message = await response.text()
    }
    throw new Error(`Gemini request failed (${response.status}): ${message}`)
  }

  const data = await response.json()
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof output !== 'string' || !output.trim()) {
    throw new Error('Gemini returned an empty response.')
  }

  return parseGeminiJsonResponse(output)
}

async function extractFromForm(form: FormData) {
  const file = form.get('file')
  const lengthEntry = form.get('length')
  const length = typeof lengthEntry === 'string' ? lengthEntry : null

  if (!(file instanceof File)) {
    throw new Error('Upload a TXT file to summarize.')
  }

  const text = await readFileAsText(file)
  return { text, length }
}

async function extractFromJson(body: Record<string, unknown>) {
  const length = typeof body.length === 'string' ? body.length : null
  const text = typeof body.text === 'string' ? body.text.trim() : ''

  if (!text) {
    throw new Error('Provide text to summarize.')
  }

  return { text, length }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    let payload: { text: string; length: string | null }

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      payload = await extractFromForm(form)
    } else {
      const body = await req.json().catch(() => ({}))
      payload = await extractFromJson(body)
    }

    let { text } = payload
    const { length } = payload

    if (text.length > TEXT_CHARACTER_LIMIT) {
      text = text.slice(0, TEXT_CHARACTER_LIMIT)
    }

    const originalWordCount = countWords(text)
    const geminiResponse = await callGemini({ text, length })

    const summaryText = typeof geminiResponse.summary === 'string' ? geminiResponse.summary : ''
    const keyPoints = Array.isArray(geminiResponse.keyPoints) ? geminiResponse.keyPoints : []
    const extendedSummary = typeof geminiResponse.extendedSummary === 'string'
      ? geminiResponse.extendedSummary
      : undefined

    return applyCors(NextResponse.json({
      summary: summaryText,
      keyPoints,
      wordCount: {
        original: originalWordCount,
        summary: countWords(summaryText),
      },
      extendedSummary,
    }))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return errorResponse(message)
  }
}

export async function OPTIONS() {
  return applyCors(new NextResponse(null, { status: 204 }))
}