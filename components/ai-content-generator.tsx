"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { generateText } from "@/lib/ai"

export default function AIContentGenerator() {
  const [topic, setTopic] = useState("")
  const [audience, setAudience] = useState("student")
  const [length, setLength] = useState("short")
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState("")

  const onGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setOutput("")
    const prompt = `Generate ${length} educational content for a ${audience} about: ${topic}. Use clear, dyslexia-friendly language and bullet points where helpful.`
    const res = await generateText(prompt)
    setOutput(res || "No response. Check your API key or try again.")
    setLoading(false)
  }

  return (
    <Card className="container mx-auto px-4 py-6">
      <CardHeader>
        <CardTitle>Content Generator (AI)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <Input placeholder="Topic (e.g., Phonics: short vowels)" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <Input placeholder="Audience (e.g., grade 3 student)" value={audience} onChange={(e) => setAudience(e.target.value)} />
          <Input placeholder="Length (short/medium/long)" value={length} onChange={(e) => setLength(e.target.value)} />
        </div>
        <Button onClick={onGenerate} disabled={loading || !topic.trim()}>
          {loading ? "Generating..." : "Generate"}
        </Button>
        <div className="min-h-40 whitespace-pre-wrap rounded-md border p-3 text-sm">
          {output || "AI output will appear here."}
        </div>
      </CardContent>
    </Card>
  )
}