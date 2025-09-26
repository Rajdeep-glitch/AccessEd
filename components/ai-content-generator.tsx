"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { fadeInUp, MotionContainer, MotionCard } from "@/components/shared/motion"
import { generateText } from "@/lib/ai"
import { Copy, Download, Zap } from "lucide-react"

export default function AIContentGenerator() {
  const [topic, setTopic] = useState("")
  const [audience, setAudience] = useState("student")
  const [length, setLength] = useState("short")
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState("")
  const [activeTab, setActiveTab] = useState("text")

  const onGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setOutput("")
    const prompt = `Generate ${length} educational content for a ${audience} about: ${topic}. Use clear, dyslexia-friendly language and bullet points where helpful.`
    const res = await generateText(prompt)
    setOutput(res || "No response. Check your API key or try again.")
    setLoading(false)
  }

  const copyToClipboard = async () => {
    if (!output) return
    try { await navigator.clipboard.writeText(output) } catch {}
  }

  const downloadTxt = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated-${new Date().toISOString().slice(0,10)}.txt`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <MotionContainer className="space-y-6">
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl grid place-items-center shadow-lg">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI Content Generator</h1>
              <p className="text-muted-foreground">Create dyslexia-friendly content with one click</p>
            </div>
          </div>
        </motion.div>

        <MotionCard>
          <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <Input placeholder="Topic (e.g., Phonics: short vowels)" value={topic} onChange={(e) => setTopic(e.target.value)} />
                <Input placeholder="Audience (e.g., grade 3 student)" value={audience} onChange={(e) => setAudience(e.target.value)} />
                <Input placeholder="Length (short/medium/long)" value={length} onChange={(e) => setLength(e.target.value)} />
              </div>
              <Button onClick={onGenerate} disabled={loading || !topic.trim()} className="min-w-32">
                {loading ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span> Generating
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" /> Generate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </MotionCard>

        <MotionCard>
          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="text">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!output}>
                        <Copy className="w-4 h-4 mr-2" /> Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadTxt} disabled={!output}>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                    </div>
                    <Textarea value={output} readOnly className="min-h-[260px] leading-relaxed text-[1.05rem]" placeholder="AI output will appear here." />
                  </div>
                </TabsContent>

                <TabsContent value="notes">
                  <div className="rounded-md border p-3 text-sm text-muted-foreground">
                    Tip: Use short sentences, clear headings, and bullet points. Prefer Lexend/OpenDyslexic fonts and extra spacing for readability.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </MotionCard>
      </MotionContainer>
    </div>
  )
}