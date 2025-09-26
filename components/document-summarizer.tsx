"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileText,
  Copy,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  BarChart3,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SummaryResult {
  summary: string
  keyPoints: string[]
  extendedSummary?: string
  wordCount: {
    original: number
    summary: number
  }
}

export default function DocumentSummarizer() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please select a PDF, DOCX, or TXT file.')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        setError('File size too large. Maximum size is 10MB.')
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const getApiBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
    if (envUrl) {
      return envUrl.replace(/\/$/, "")
    }

    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin
    }

    return ""
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('length', length)

    try {
      const apiBaseUrl = getApiBaseUrl()
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/summarize` : '/api/summarize'
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to summarize document')
      }

      const data: SummaryResult = await response.json()
      setResult(data)

      toast({
        title: "Summary Generated",
        description: `Document summarized successfully (${data.wordCount.summary} words)`,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while processing the document'
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const downloadAsTxt = () => {
    if (!result) return

    const content = `
Document Summary
================

Summary:
${result.summary}

Key Points:
${result.keyPoints.map(point => `• ${point}`).join('\n')}

${result.extendedSummary ? `Extended Summary:\n${result.extendedSummary}\n\n` : ''}

Word Count: Original: ${result.wordCount.original}, Summary: ${result.wordCount.summary}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document-summary.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Summary downloaded as TXT file",
    })
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl grid place-items-center shadow-lg">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Document Summarizer
              </h1>
              <p className="text-muted-foreground text-balance">
                Upload documents and get AI-powered summaries with key insights
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Document
              </CardTitle>
              <CardDescription>
                Select a PDF, DOCX, or TXT file (max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {file ? file.name : 'Choose File'}
                </Button>
                <Select value={length} onValueChange={(value: string) => setLength(value)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short Summary</SelectItem>
                    <SelectItem value="medium">Medium Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="min-w-24"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Summarize
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={reset}>
                      Reset
                    </Button>
                  </div>
                </motion.div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    Processing document... This may take a few moments.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Summary Generated
                      </CardTitle>
                      <CardDescription>
                        AI-powered summary of your document
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(
                          `${result.summary}\n\n${result.keyPoints.map(p => `• ${p}`).join('\n')}`
                        )}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAsTxt}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="key-points">Key Points</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-base leading-relaxed">{result.summary}</p>
                        {result.extendedSummary && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Extended Summary</h4>
                            <p className="text-sm leading-relaxed">{result.extendedSummary}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="key-points" className="space-y-4">
                      <div className="space-y-3">
                        {result.keyPoints.map((point, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                          >
                            <Badge variant="secondary" className="mt-0.5">
                              {index + 1}
                            </Badge>
                            <p className="text-sm leading-relaxed flex-1">{point}</p>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Original: {result.wordCount.original} words</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Summary: {result.wordCount.summary} words</span>
                      </div>
                      <Badge variant="outline">
                        {Math.round((result.wordCount.summary / result.wordCount.original) * 100)}% compression
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}