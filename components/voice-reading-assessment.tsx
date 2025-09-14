"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Pause, RotateCcw, Volume2, CheckCircle, AlertCircle, Star, Trophy, BookOpen } from "lucide-react"

interface ReadingPassage {
  id: string
  title: string
  level: "beginner" | "intermediate" | "advanced"
  text: string
  targetWords: string[]
  focusAreas: string[]
}

interface ReadingResult {
  accuracy: number
  fluency: number
  pronunciation: number
  wordsPerMinute: number
  feedback: string[]
  strengths: string[]
  improvements: string[]
}

// --- Utilities borrowed from Coach Pro ---
function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

function levenshtein(a: string[], b: string[]) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[a.length][b.length]
}

const readingPassages: ReadingPassage[] = [
  {
    id: "simple-cat",
    title: "The Cat and the Hat",
    level: "beginner",
    text: "The cat sat on the mat. The cat wore a big red hat. The hat was very pretty. The cat liked the hat very much.",
    targetWords: ["cat", "sat", "mat", "hat", "red", "pretty"],
    focusAreas: ["Short vowel sounds", "Simple consonants", "Basic sight words"],
  },
  {
    id: "garden-story",
    title: "In the Garden",
    level: "intermediate",
    text: "Sarah walked through the beautiful garden. She saw colorful flowers blooming everywhere. The butterflies danced from flower to flower. Sarah smiled as she picked some roses for her mother.",
    targetWords: ["beautiful", "colorful", "blooming", "butterflies", "danced", "flower"],
    focusAreas: ["Multi-syllable words", "Vowel combinations", "Reading fluency"],
  },
  {
    id: "adventure",
    title: "The Great Adventure",
    level: "advanced",
    text: "The courageous explorer ventured into the mysterious forest. Ancient trees towered above, their branches creating intricate patterns against the sky. Every step revealed new wonders and challenges.",
    targetWords: ["courageous", "explorer", "mysterious", "ancient", "intricate", "challenges"],
    focusAreas: ["Complex vocabulary", "Advanced phonics", "Expression and intonation"],
  },
]

export default function VoiceReadingAssessment() {
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage | null>(null)

  // Existing recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [readingStarted, setReadingStarted] = useState(false);

  // New: live transcript + metrics
  const [transcript, setTranscript] = useState("")
  const [startTime, setStartTime] = useState(null as number | null)
  const [highlightIndex, setHighlightIndex] = useState(0)

  const passageTokens = useMemo(() => tokenize(selectedPassage?.text || ""), [selectedPassage?.text])
  const transcriptTokens = useMemo(() => tokenize(transcript), [transcript])

  const distance = useMemo(
    () => levenshtein(passageTokens.slice(0, transcriptTokens.length), transcriptTokens),
    [passageTokens, transcriptTokens]
  )
  const accuracy = useMemo(() => {
    if (transcriptTokens.length === 0) return 0
    const readCount = Math.max(1, transcriptTokens.length)
    const correct = Math.max(0, readCount - distance)
    return Math.max(0, Math.min(100, Math.round((correct / readCount) * 100)))
  }, [transcriptTokens.length, distance])

  const wpm = useMemo(() => {
    if (!startTime || transcriptTokens.length === 0) return 0
    const minutes = (Date.now() - startTime) / 60000
    if (minutes <= 0) return 0
    return Math.round(transcriptTokens.length / minutes)
  }, [startTime, transcriptTokens.length])

  // Greedy highlight advance based on recognized tokens
  useEffect(() => {
    let idx = 0
    for (const word of transcriptTokens) {
      while (idx < passageTokens.length && passageTokens[idx] !== word) idx++
      if (idx < passageTokens.length && passageTokens[idx] === word) idx++
    }
    setHighlightIndex(idx)
  }, [transcriptTokens, passageTokens])

  // Mispronunciation heatmap alignment (greedy)
  const alignment = useMemo(() => {
    const n = passageTokens.length
    const matched = new Array<boolean>(n).fill(false)
    const errors = new Array<number>(n).fill(0)
    let i = 0
    let j = 0
    while (i < n && j < transcriptTokens.length) {
      if (passageTokens[i] === transcriptTokens[j]) { matched[i] = true; i++; j++; }
      else {
        const lookahead = Math.min(3, n - i)
        let found = -1
        for (let k = 0; k < lookahead; k++) {
          if (passageTokens[i + k] === transcriptTokens[j]) { found = k; break }
        }
        if (found > 0) { for (let k = 0; k < found; k++) errors[i + k]++; i += found; matched[i] = true; i++; j++; }
        else { errors[i]++; i++; j++; }
      }
    }
    while (i < n) { errors[i]++; i++; }
    return { matched, errors }
  }, [passageTokens, transcriptTokens])

  // MediaRecorder for raw audio (kept for demo parity)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording && recordingTime < 120) {
      // Max 2 minutes
      timerRef.current = setTimeout(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isRecording, recordingTime])

  // Web Speech API recognition (from Coach Pro)
  const recognitionRef = useRef<any>(null)
  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = "en-US"

    rec.onresult = (event: any) => {
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) final += res[0].transcript
      }
      if (final) setTranscript((prev) => (prev ? prev + " " : "") + final.trim())
    }

    rec.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = rec
  }, [])

  const startRecording = async () => {
    try {
      // Start MediaRecorder (optional)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        // audioBlob could be uploaded to a server later
        setHasRecorded(true)
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorder.start()

      // Start STT recognition
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.")
      } else {
        setTranscript("")
        setStartTime(Date.now())
        recognitionRef.current.start()
      }

      setIsRecording(true)
      setRecordingTime(0)
      setReadingStarted(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Please allow microphone access to use voice reading assessment.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    setIsRecording(false)
  }

  const playModelReading = () => {
    if (!selectedPassage) return

    if (window.speechSynthesis) {
      if (isPlaying) {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
        return
      }

      const utterance = new SpeechSynthesisUtterance(selectedPassage.text)
      utterance.rate = selectedPassage.level === "beginner" ? 0.85 : selectedPassage.level === "intermediate" ? 1.0 : 1.1
      utterance.pitch = 1.05
      utterance.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find((voice) => /Female|Google/i.test(voice.name))
      if (preferredVoice) utterance.voice = preferredVoice

      // Simple timed highlight while model reads
      const words = passageTokens
      let i = 0
      const totalMs = Math.max(6000, words.length * (selectedPassage.level === "beginner" ? 450 : selectedPassage.level === "intermediate" ? 350 : 300))
      const step = Math.max(50, Math.floor(totalMs / Math.max(1, words.length)))
      setHighlightIndex(0)
      const interval = setInterval(() => {
        i++
        setHighlightIndex(Math.min(i, words.length))
        if (i >= words.length) clearInterval(interval)
      }, step)

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => {
        setIsPlaying(false)
        clearInterval(interval)
        setHighlightIndex(words.length)
      }
      utterance.onerror = () => {
        setIsPlaying(false)
        clearInterval(interval)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const analyzeReading = () => {
    // Simulated analysis for the results screen (kept from original)
    setTimeout(() => {
      setShowResults(true)
    }, 1000)
  }

  const resetAssessment = () => {
    setSelectedPassage(null)
    setIsRecording(false)
    setIsPlaying(false)
    setRecordingTime(0)
    setHasRecorded(false)
    setShowResults(false)
    setReadingStarted(false)
    setTranscript("")
    setStartTime(null)
    setHighlightIndex(0)
    if (recognitionRef.current) try { recognitionRef.current.stop() } catch {}
    window.speechSynthesis.cancel()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Simulated results (unchanged)
  const [results] = useState<ReadingResult>({
    accuracy: 87,
    fluency: 82,
    pronunciation: 90,
    wordsPerMinute: 45,
    feedback: [
      "Great job with clear pronunciation!",
      "Try to read a bit more smoothly between words",
      "Excellent work on the difficult words",
    ],
    strengths: ["Clear consonant sounds", "Good pace and rhythm", "Confident reading voice"],
    improvements: [
      "Practice blending vowel sounds",
      "Work on reading without pauses",
      "Try reading with more expression",
    ],
  })

  if (showResults && selectedPassage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">Reading Assessment Results</h1>
              <p className="text-muted-foreground">Great job reading "{selectedPassage.title}"!</p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-balance">Overall Reading Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-chart-2 mb-2">
                {Math.round((results.accuracy + results.fluency + results.pronunciation) / 3)}%
              </div>
              <div className="text-lg text-muted-foreground">Excellent Progress!</div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{results.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{results.fluency}%</div>
                <div className="text-sm text-muted-foreground">Fluency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{results.pronunciation}%</div>
                <div className="text-sm text-muted-foreground">Pronunciation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">{results.wordsPerMinute}</div>
                <div className="text-sm text-muted-foreground">Words/Min</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-balance">
                <Star className="w-5 h-5 text-green-600" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-balance">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-balance">
                <AlertCircle className="w-5 h-5 text-secondary" />
                Practice Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/20">
                    <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span className="text-sm text-balance">{improvement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-balance">Personalized Feedback</CardTitle>
            <CardDescription>Here's what our AI coach noticed about your reading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.feedback.map((feedback, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-balance">{feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-8">
          <Button onClick={() => setSelectedPassage(null)} className="bg-chart-2 text-white hover:bg-chart-2/90">
            Try Another Passage
          </Button>
          <Button variant="outline" onClick={resetAssessment}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  if (selectedPassage) {
    const progress = Math.min(100, Math.round((highlightIndex / Math.max(1, passageTokens.length)) * 100))

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedPassage(null)}>
              ← Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-chart-2" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">{selectedPassage.title}</h1>
                <p className="text-sm text-muted-foreground capitalize">{selectedPassage.level} Level • Voice Reading Practice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Passage with karaoke highlighting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-balance">Read This Passage Aloud</CardTitle>
            <CardDescription className="text-center">Click the microphone to start, then read clearly at your pace</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <div className="text-lg leading-8 text-center max-w-2xl mx-auto mb-6">
              <p>
                {passageTokens.map((t, i) => {
                  const isDone = i < highlightIndex
                  const isCurrent = i === highlightIndex
                  const err = alignment.errors[i] || 0
                  const maxErr = 3
                  const alpha = Math.max(0, Math.min(1, err / maxErr))
                  const heat = err > 0 && !isDone && !isCurrent ? `rgba(255, 0, 0, ${0.18 + 0.22 * alpha})` : undefined
                  return (
                    <span
                      key={i}
                      className={
                        isDone
                          ? "bg-green-200/60 text-foreground rounded px-1"
                          : isCurrent
                          ? "bg-yellow-200/60 text-foreground rounded px-1"
                          : "rounded px-1"
                      }
                      style={{ backgroundColor: !isDone && !isCurrent ? heat : undefined }}
                    >
                      {t}{" "}
                    </span>
                  )
                })}
              </p>
            </div>

            {/* Focus Areas */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {selectedPassage.focusAreas.map((area, index) => (
                <Badge key={index} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>

            {/* Live metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{wpm}</div>
                <div className="text-xs text-muted-foreground">Words / Min</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2">{accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{transcriptTokens.length}</div>
                <div className="text-xs text-muted-foreground">Words Read</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{progress}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
            <Progress value={progress} className="h-2 mb-4" />

            {/* Controls */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={playModelReading} disabled={isRecording}>
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Stop" : "Listen First"}
                </Button>

                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`${isRecording ? "bg-red-600 hover:bg-red-700 text-white" : "bg-chart-2 hover:bg-chart-2/90 text-white"}`}
                  disabled={isPlaying}
                >
                  {isRecording ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                  {isRecording ? "Stop Recording" : "Start Reading"}
                </Button>
              </div>

              {isRecording && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">{formatTime(recordingTime)}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    Recording... Speak clearly and take your time
                  </div>
                </div>
              )}

              {hasRecorded && !isRecording && (
                <div className="text-center">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span>Recording complete! Ready for analysis.</span>
                  </div>
                  <Button onClick={analyzeReading} className="bg-chart-2 text-white hover:bg-chart-2/90">
                    Analyze My Reading
                  </Button>
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-balance">Live Transcript</CardTitle>
                  <CardDescription>Captured locally in your browser</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm p-3 rounded border bg-background min-h-[80px] whitespace-pre-wrap">
                    {transcript || (isRecording ? "(Listening...)" : "(Click Start Reading to capture your voice)")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-balance">Reading Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Read at a comfortable pace</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Pronounce each word clearly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Don't worry about mistakes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-chart-2" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">Voice Reading Assessment</h1>
            <p className="text-muted-foreground">Practice reading aloud with live transcript, WPM and accuracy metrics</p>
          </div>
        </div>
      </div>

      {/* Passage Selection */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-balance">Choose a Reading Passage</h2>

        <div className="grid gap-6">
          {readingPassages.map((passage) => (
            <Card key={passage.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPassage(passage)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-balance">{passage.title}</CardTitle>
                    <CardDescription>Perfect for practicing {passage.focusAreas.join(", ").toLowerCase()}</CardDescription>
                  </div>
                  <Badge
                    variant={passage.level === "beginner" ? "secondary" : passage.level === "intermediate" ? "default" : "outline"}
                    className="capitalize"
                  >
                    {passage.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 text-balance">{passage.text}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {passage.focusAreas.slice(0, 2).map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" className="bg-chart-2 text-white hover:bg-chart-2/90">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Reading
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-balance">How Voice Reading Assessment Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2 text-balance">1. Choose & Listen</h3>
              <p className="text-sm text-muted-foreground text-balance">Select a passage and listen to the model reading first</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-medium mb-2 text-balance">2. Read Aloud</h3>
              <p className="text-sm text-muted-foreground text-balance">Click Start to record and get a live transcript</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-medium mb-2 text-balance">3. See Metrics</h3>
              <p className="text-sm text-muted-foreground text-balance">View WPM, accuracy, and progress instantly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
