"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Mic, Pause, RotateCcw, Volume2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

// Simple Levenshtein distance for accuracy estimation
function levenshtein(a: string[], b: string[]) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[a.length][b.length]
}

// Normalize text -> tokens
function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

const PASSAGES = {
  beginner:
    `The cat sits on the mat. It likes the sun. The cat purrs softly and blinks.
It watches a red bird hop by. The cat stretches and yawns.`,
  intermediate:
    `When the little fox found the bright blue feather, it wondered who it belonged to.
It sniffed the wind, listened to the trees, and followed tiny footprints across the soft ground.
With every careful step, the fox grew braver.`,
  advanced:
    `Under a sky mottled with passing clouds, the curious fox examined the delicate feather's spine and barbs.
It traced faint trails in the loam, untangling clues with patient focus and steady breath.
Each discovery sharpened its resolve to uncover the feather's winding story.`,
} as const

type Level = keyof typeof PASSAGES

export default function AIReadingCoachPro() {
  const [isListening, setIsListening] = useState(false)
  const [isModelReading, setIsModelReading] = useState(false)
  const [transcript, setTranscript] = useState<string>("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [highlightIndex, setHighlightIndex] = useState(0) // word-based highlight for passage
  const [level, setLevel] = useState<Level>("intermediate")
  const [autoAdapt, setAutoAdapt] = useState<boolean>(true)
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true)
  const [adaptMessage, setAdaptMessage] = useState<string>("")
  const [lastAdaptAt, setLastAdaptAt] = useState<number>(0)

  // Derived data
  const passage = PASSAGES[level]
  const passageTokens = useMemo(() => tokenize(passage), [passage])
  const transcriptTokens = useMemo(() => tokenize(transcript), [transcript])

  const distance = useMemo(
    () => levenshtein(passageTokens.slice(0, transcriptTokens.length), transcriptTokens),
    [passageTokens, transcriptTokens]
  )
  const accuracy = useMemo(() => {
    const readCount = Math.max(1, transcriptTokens.length)
    const correct = Math.max(0, readCount - distance)
    return Math.max(0, Math.min(100, Math.round((correct / readCount) * 100)))
  }, [transcriptTokens.length, distance])

  const wpm = useMemo(() => {
    if (!startTime) return 0
    const minutes = (Date.now() - startTime) / 60000
    if (minutes <= 0) return 0
    return Math.round(transcriptTokens.length / minutes)
  }, [startTime, transcriptTokens.length])

  // Approximate alignment for highlight progression
  useEffect(() => {
    let idx = 0
    for (const word of transcriptTokens) {
      while (idx < passageTokens.length && passageTokens[idx] !== word) {
        idx++
      }
      if (idx < passageTokens.length && passageTokens[idx] === word) {
        idx++
      }
    }
    setHighlightIndex(idx)
  }, [transcriptTokens, passageTokens])

  // Build mispronunciation heatmap via simple greedy alignment
  const alignment = useMemo(() => {
    const n = passageTokens.length
    const matched = new Array<boolean>(n).fill(false)
    const errors = new Array<number>(n).fill(0)
    let i = 0 // passage index
    let j = 0 // transcript index
    while (i < n && j < transcriptTokens.length) {
      if (passageTokens[i] === transcriptTokens[j]) {
        matched[i] = true
        i++; j++
      } else {
        // lookahead for small deletions (skip up to 2 passage tokens)
        const lookahead = Math.min(3, n - i)
        let found = -1
        for (let k = 0; k < lookahead; k++) {
          if (passageTokens[i + k] === transcriptTokens[j]) { found = k; break }
        }
        if (found > 0) {
          // mark skipped passage tokens as errors (deletions)
          for (let k = 0; k < found; k++) errors[i + k]++
          i += found
          matched[i] = true
          i++; j++
        } else {
          // substitution or insertion: count error on current passage token, advance both
          errors[i]++
          i++; j++
        }
      }
    }
    // remaining passage tokens considered missed
    while (i < n) { errors[i]++; i++ }
    return { matched, errors }
  }, [passageTokens, transcriptTokens])

  // STT (Web Speech API)
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
      let interim = ""
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) final += res[0].transcript
        else interim += res[0].transcript
      }
      setTranscript((prev) => (final ? (prev ? prev + " " : "") + final.trim() : prev))
    }

    rec.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = rec
  }, [])

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.")
      return
    }
    setTranscript("")
    setStartTime(Date.now())
    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  // TTS model reading with karaoke-style highlight
  const ttsTimerRef = useRef<NodeJS.Timeout | null>(null)
  const playModelReading = () => {
    if (isModelReading) {
      window.speechSynthesis.cancel()
      setIsModelReading(false)
      if (ttsTimerRef.current) clearInterval(ttsTimerRef.current)
      return
    }
    if (!("speechSynthesis" in window)) return

    const utterance = new SpeechSynthesisUtterance(passage)
    const rateByLevel: Record<Level, number> = { beginner: 0.85, intermediate: 1.0, advanced: 1.1 }
    utterance.rate = rateByLevel[level]
    utterance.pitch = 1
    utterance.volume = 1
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find((v) => /female|google/i.test(v.name))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setIsModelReading(true)
    utterance.onend = () => {
      setIsModelReading(false)
      if (ttsTimerRef.current) clearInterval(ttsTimerRef.current)
      setHighlightIndex(passageTokens.length)
    }

    const words = passageTokens
    let i = 0
    const totalMs = Math.max(6000, words.length * (level === "beginner" ? 450 : level === "intermediate" ? 350 : 300))
    const step = Math.floor(totalMs / Math.max(1, words.length))
    setHighlightIndex(0)
    ttsTimerRef.current = setInterval(() => {
      i++
      setHighlightIndex(Math.min(i, words.length))
      if (i >= words.length) {
        if (ttsTimerRef.current) clearInterval(ttsTimerRef.current)
      }
    }, step)

    window.speechSynthesis.speak(utterance)
  }

  const reset = () => {
    stopListening()
    window.speechSynthesis.cancel()
    setTranscript("")
    setStartTime(null)
    setHighlightIndex(0)
  }

  // Adaptive difficulty: auto adjust level based on WPM and accuracy with cooldown
  useEffect(() => {
    if (!autoAdapt) return
    if (!startTime) return
    // run small evaluator every ~6s while listening
    const now = Date.now()
    if (now - lastAdaptAt < 6000) return

    const promote = wpm >= 120 && accuracy >= 90
    const demote = (wpm > 0 && wpm <= 70) || accuracy <= 75

    let next: Level | null = null
    if (promote && level !== "advanced") next = level === "beginner" ? "intermediate" : "advanced"
    else if (demote && level !== "beginner") next = level === "advanced" ? "intermediate" : "beginner"

    if (next) {
      setLevel(next)
      setAdaptMessage(`Adapted to ${next} (WPM ${wpm}, Acc ${accuracy}%)`)
      setLastAdaptAt(now)
      // fade message
      setTimeout(() => setAdaptMessage(""), 3000)
    }
  }, [autoAdapt, startTime, wpm, accuracy, level, lastAdaptAt])

  // Render helpers
  const renderPassage = () => {
    const tokens = passageTokens
    return (
      <p className="text-lg leading-8">
        {tokens.map((t, i) => {
          const isDone = i < highlightIndex
          const isCurrent = i === highlightIndex
          // Heat intensity from errors
          const err = alignment.errors[i] || 0
          const maxErr = 3
          const alpha = Math.max(0, Math.min(1, err / maxErr))
          const heat = showHeatmap && err > 0 ? `rgba(255, 0, 0, ${0.18 + 0.22 * alpha})` : undefined
          const baseClass = isDone
            ? "rounded px-1"
            : isCurrent
            ? "rounded px-1"
            : ""
          const bgClass = isDone
            ? "bg-green-200/60 text-foreground"
            : isCurrent
            ? "bg-yellow-200/60 text-foreground"
            : ""

          return (
            <span
              key={i}
              className={`${baseClass} ${bgClass}`}
              style={{ backgroundColor: !isDone && !isCurrent && heat ? heat : undefined }}
            >
              {t}
              {" "}
            </span>
          )
        })}
      </p>
    )
  }

  const progress = Math.min(100, Math.round((highlightIndex / Math.max(1, passageTokens.length)) * 100))

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl grid place-items-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">AI Reading Coach Pro</h1>
            <p className="text-muted-foreground text-balance">
              Real-time speech-aligned guidance with karaoke highlighting, WPM, accuracy, adaptive difficulty, and a per-word heatmap.
            </p>
          </div>
        </div>
      </div>

      {adaptMessage && (
        <div className="mb-4 text-sm py-2 px-3 rounded bg-primary/10 border border-primary/20">{adaptMessage}</div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-balance">Read This Passage</CardTitle>
          <CardDescription className="text-balance">
            Click the mic and read at your own pace. Watch live highlighting and metrics update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="capitalize">{level}</Badge>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-muted-foreground">Auto Adapt</span>
              <Switch checked={autoAdapt} onCheckedChange={setAutoAdapt} />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">Heatmap</span>
              <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant={isModelReading ? "secondary" : "outline"} onClick={playModelReading}>
                <Volume2 className="w-4 h-4 mr-2" /> {isModelReading ? "Stop Model Reading" : "Play Model Reading"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setLevel("beginner")}>Beginner</Button>
              <Button size="sm" variant="outline" onClick={() => setLevel("intermediate")}>Intermediate</Button>
              <Button size="sm" variant="outline" onClick={() => setLevel("advanced")}>Advanced</Button>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-muted/30 mb-4">{renderPassage()}</div>

          {showHeatmap && (
            <div className="text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <span>Heatmap Legend:</span>
                <span className="inline-block w-4 h-4 rounded" style={{ background: "rgba(255,0,0,0.18)" }} />
                <span>slight</span>
                <span className="inline-block w-4 h-4 rounded" style={{ background: "rgba(255,0,0,0.28)" }} />
                <span>moderate</span>
                <span className="inline-block w-4 h-4 rounded" style={{ background: "rgba(255,0,0,0.40)" }} />
                <span>high</span>
              </div>
              <Separator className="mt-2" />
            </div>
          )}

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

          <div className="flex items-center gap-3">
            {!isListening ? (
              <Button onClick={startListening}>
                <Mic className="w-4 h-4 mr-2" /> Start Mic
              </Button>
            ) : (
              <Button variant="secondary" onClick={stopListening}>
                <Pause className="w-4 h-4 mr-2" /> Stop Mic
              </Button>
            )}
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Live Transcript</CardTitle>
          <CardDescription>We only store data locally in this demo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm p-3 rounded border bg-background min-h-[80px] whitespace-pre-wrap">{transcript || "(Start the mic to capture your reading...)"}</div>
        </CardContent>
      </Card>
    </div>
  )
}