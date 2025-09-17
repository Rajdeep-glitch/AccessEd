import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

// Lazy require to avoid build-time module resolution failures
let _pdfParse: any | null = null
let _mammoth: any | null = null
async function getPdfParse() {
  if (_pdfParse) return _pdfParse
  try {
    const mod: any = await import('pdf-parse')
    _pdfParse = mod?.default ?? mod
  } catch {}
  if (!_pdfParse) {
    try {
      // Fallback to require for CommonJS
      // @ts-ignore
      const req = (eval('require'))
      const mod = req('pdf-parse')
      _pdfParse = mod?.default ?? mod
    } catch {}
  }
  return _pdfParse
}
async function getMammoth() {
  if (_mammoth) return _mammoth
  try {
    const mod: any = await import('mammoth')
    _mammoth = mod?.default ?? mod
  } catch {}
  if (!_mammoth) {
    try {
      // @ts-ignore
      const req = (eval('require'))
      const mod = req('mammoth')
      _mammoth = mod?.default ?? mod
    } catch {}
  }
  return _mammoth
}

// Naive HTML -> text extraction
function stripHtml(html: string): string {
  if (!html) return ''
  // Remove script/style
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, '')
              .replace(/<style[\s\S]*?<\/style>/gi, '')
  // Replace breaks and block tags with newlines to preserve structure
  s = s.replace(/<(?:br|hr)\s*\/?>(?![^<]*>)/gi, '\n')
       .replace(/<\/(?:p|div|section|article|li|h[1-6]|header|footer|main)>/gi, '\n')
  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, ' ')
  // Decode a few common entities
  const entities: Record<string, string> = {
    '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  }
  s = s.replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (m) => entities[m] || m)
  // Collapse whitespace
  s = s.replace(/[\r\n]+/g, '\n').replace(/\t+/g, ' ').replace(/\s{2,}/g, ' ').trim()
  return s
}

// Simple extractive summarizer (paragraph + points)
function summarizeText(text: string, maxSentences = 6): string {
  const { points } = summarizeStructured(text, maxSentences)
  return points.join(' ')
}

function summarizeStructured(text: string, maxPoints = 6): { points: string[]; paragraph: string } {
  const clean = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!clean) return { points: [], paragraph: '' }
  const stopwords = new Set(['the','is','in','and','to','of','a','for','on','that','with','as','by','it','this','an','are','be','or','from','at','was','were','but','not','have','has','had','you','your','their','they','we','our','can','will','would','should','could'])
  const sentences = clean.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(s=>s.trim()).filter(Boolean)
  if (sentences.length <= maxPoints) {
    return { points: sentences, paragraph: sentences.join(' ') }
  }
  const wordFreq: Record<string, number> = {}
  const words = clean.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w && !stopwords.has(w))
  for (const w of words) wordFreq[w] = (wordFreq[w] || 0) + 1
  const scores = sentences.map((s, idx) => {
    const sw = s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
    let score = 0
    for (const w of sw) if (!stopwords.has(w)) score += (wordFreq[w] || 0)
    return { idx, score: score / Math.sqrt(Math.max(1, sw.length)) }
  })
  const top = [...scores].sort((a,b)=>b.score-a.score).slice(0, maxPoints).sort((a,b)=>a.idx-b.idx)
  const points = top.map(t => sentences[t.idx])
  const paragraph = points.join(' ')
  return { points, paragraph }
}

async function extractTextFromUpload(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const name = (file as any).name || 'upload'
  const type = file.type || ''
  const lowerName = name.toLowerCase()

  if (!buffer.length) {
    throw new Error('Uploaded file is empty or could not be read (possibly exceeded server limit).')
  }

  // Detect by extension or MIME first
  const isTxt = type.includes('text/plain') || /\.txt$/.test(lowerName)
  const isPdf = type.includes('pdf') || /\.pdf$/.test(lowerName)
  const isDocx = type.includes('officedocument.wordprocessingml.document') || /\.docx$/.test(lowerName)

  // If unknown, try magic bytes
  const header = buffer.subarray(0, 8)
  const hex = header.toString('hex')
  // PDF: 25 50 44 46 2D  ("%PDF-")
  const looksPdf = isPdf || hex.startsWith('255044462d')
  // DOCX: PK zip magic 50 4b 03 04
  const looksZip = hex.startsWith('504b0304')

  // TXT
  if (isTxt) {
    const text = buffer.toString('utf8').trim()
    if (!text) throw new Error('TXT appears empty.')
    return text
  }

  // PDF
  if (looksPdf) {
    const pdfParse = await getPdfParse()
    if (!pdfParse) {
      throw new Error('PDF support unavailable. Install pdf-parse in the app folder and restart the server.')
    }
    try {
      const res = await pdfParse(buffer)
      const text = (res?.text || '').trim()
      if (!text) throw new Error('No extractable text found in PDF (may be scanned images).')
      return text
    } catch (e: any) {
      throw new Error(`PDF parsing failed: ${e?.message || e}`)
    }
  }

  // DOCX
  if (isDocx || looksZip) {
    const mammoth = await getMammoth()
    if (!mammoth) {
      throw new Error('DOCX support unavailable. Install mammoth and restart the server.')
    }
    try {
      const res = await mammoth.extractRawText({ buffer })
      const text = (res?.value || '').trim()
      if (!text) throw new Error('No extractable text found in DOCX.')
      return text
    } catch (e: any) {
      throw new Error(`DOCX parsing failed: ${e?.message || e}`)
    }
  }

  // Attempt UTF-8 for unknown types
  const asText = buffer.toString('utf8').trim()
  if (!asText) throw new Error('Unsupported or unreadable file.')
  return asText
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // 1) Handle file uploads (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as unknown as File | null
      const maxSentences = Math.min(Math.max(1, Number(form.get('maxSentences')) || 6), 12)

      if (!file || typeof (file as any).arrayBuffer !== 'function') {
        return NextResponse.json({ error: 'No file provided.' }, { status: 200 })
      }

      let baseText = await extractTextFromUpload(file)
      if (!baseText) {
        return NextResponse.json({ error: 'Unsupported or unreadable file.' }, { status: 200 })
      }
      if (baseText.length > 300000) baseText = baseText.slice(0, 300000)

      const { points, paragraph } = summarizeStructured(baseText, maxSentences)
      return NextResponse.json({ summary: paragraph, points })
    }

    // 2) Handle JSON body (text or URL)
    const body = await req.json().catch(() => ({})) as { text?: string; url?: string; maxSentences?: number }
    const maxSentences = Math.min(Math.max(1, body?.maxSentences ?? 6), 12)

    let baseText = (body?.text || '').trim()

    // If URL provided, fetch the content on the server
    if (!baseText && typeof body?.url === 'string' && body.url.trim()) {
      const target = body.url.trim()
      try {
        const r = await fetch(target, { method: 'GET', headers: { 'User-Agent': 'AccessEd/1.0 (+summarizer)' } })
        if (r.ok) {
          const contentType = r.headers.get('content-type') || ''
          if (contentType.includes('pdf')) {
            const pdfParse = await getPdfParse()
            if (pdfParse) {
              const buf = Buffer.from(await r.arrayBuffer())
              const out = await pdfParse(buf)
              baseText = out?.text || ''
            }
          } else if (contentType.includes('officedocument.wordprocessingml.document')) {
            const mammoth = await getMammoth()
            if (mammoth) {
              const buf = Buffer.from(await r.arrayBuffer())
              const out = await mammoth.extractRawText({ buffer: buf })
              baseText = out?.value || ''
            }
          } else if (contentType.includes('text/plain')) {
            baseText = await r.text()
          } else if (contentType.includes('html')) {
            const html = await r.text()
            baseText = stripHtml(html)
          } else {
            // Unknown type: try text()
            baseText = await r.text().catch(async () => {
              const ab = await r.arrayBuffer()
              return Buffer.from(ab).toString('utf8')
            })
          }
        }
      } catch {
        // ignore network errors and fall through
      }
    }

    baseText = (baseText || '').trim()
    if (!baseText) {
      return NextResponse.json({ error: 'Provide a valid URL or text to summarize, or upload a file.' }, { status: 200 })
    }

    const { points, paragraph } = summarizeStructured(baseText, maxSentences)
    return NextResponse.json({ summary: paragraph, points })
  } catch (err: any) {
    const msg = typeof err?.message === 'string' ? err.message : String(err)
    return NextResponse.json({ error: `Summarizer encountered an issue. ${msg}` }, { status: 200 })
  }
}