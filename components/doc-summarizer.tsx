"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// Removed Textarea (no text-paste mode)
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

// Simple client-side summarizer (fallback if server route not used)
function summarizeText(text: string, maxSentences = 5): string {
  const clean = text
    .replace(/\s+/g, " ")
    .replace(/[\r\n]+/g, " ")
    .trim()
  if (!clean) return ""

  const stopwords = new Set([
    "the","is","in","and","to","of","a","for","on","that","with","as","by","it","this","an","are","be","or","from","at","was","were","but","not","have","has","had","you","your","their","they","we","our","can","will","would","should","could",
  ])

  const sentences = clean
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(s => s.trim())
    .filter(Boolean)

  if (sentences.length <= maxSentences) return sentences.join(" ")

  const wordFreq: Record<string, number> = {}
  const words = clean
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w && !stopwords.has(w))
  for (const w of words) wordFreq[w] = (wordFreq[w] || 0) + 1

  const scores = sentences.map((s, idx) => {
    const sw = s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean)
    if (!sw.length) return { idx, score: 0 }
    let score = 0
    for (const w of sw) if (!stopwords.has(w)) score += (wordFreq[w] || 0)
    // Normalize by sentence length to reduce bias
    score = score / Math.sqrt(sw.length)
    return { idx, score }
  })

  const top = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx)

  return top.map(t => sentences[t.idx]).join(" ")
}

export default function DocSummarizer() {

  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [points, setPoints] = useState<string[]>([])

  const uploadAndSummarize = async () => {
    if (!file) return
    setError("")
    setSummary("")
    setPoints([])
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('maxSentences', String(6))
      const res = await fetch('/api/summarize', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({} as any))
      if (typeof data?.summary === 'string' && data.summary) {
        setSummary(data.summary)
        setPoints(Array.isArray(data?.points) ? data.points : [])
      } else {
        setError(typeof data?.error === 'string' && data.error ? data.error : 'Could not summarize the uploaded file.')
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong during upload.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUrlAndSummarize = async () => {
    setError("")
    setSummary("")
    setPoints([])
    setLoading(true)
    try {
      const cleanUrl = url.trim()
      if (!cleanUrl) {
        setError("Enter a URL to fetch.")
        return
      }
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, maxSentences: 6 }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (typeof data?.summary === 'string' && data.summary) {
        setSummary(data.summary)
        setPoints(Array.isArray(data?.points) ? data.points : [])
      } else {
        setError('Could not summarize the fetched content.')
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong while fetching URL.')
    } finally {
      setLoading(false)
    }
  }

  // Removed text-paste summarization per request

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Doc Summarizer</CardTitle>
          <CardDescription>Upload a file or enter a URL. Summarization runs on the server without external AI.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Upload a file (PDF, DOCX, TXT)</label>
            <div className="flex gap-2 items-center">
              <Input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Button onClick={uploadAndSummarize} disabled={loading || !file}>
                {loading ? "Summarizing..." : "Upload & Summarize"}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid gap-2">
            <label className="text-sm font-medium">Or fetch from URL</label>
            <div className="flex gap-2 items-center">
              <Input
                type="url"
                placeholder="https://example.com/my.pdf or https://blog/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button variant="secondary" onClick={fetchUrlAndSummarize} disabled={loading}>
                {loading ? "Fetching..." : "Fetch & Summarize"}
              </Button>
            </div>
            <Button variant="outline" onClick={() => { setUrl(""); setSummary(""); setError(""); setFile(null) }}>Clear</Button>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          {(summary || points.length) && (
            <div className="grid gap-3">
              <Separator className="my-2" />
              <h3 className="text-base font-semibold">Summary</h3>
              {summary && (
                <p className="text-[15px] leading-7 whitespace-pre-wrap text-foreground/90">{summary}</p>
              )}
              {points.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Key points</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm leading-6 text-foreground/90">
                    {points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}