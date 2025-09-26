"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Mic, MicOff, Pause, RotateCcw, Volume2, CheckCircle, AlertCircle, Star, Trophy, BookOpen,
  Download, Copy, Languages, Zap, Eye, EyeOff, Settings
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

interface PronunciationFeedback {
  word: string
  score: number
  suggestion?: string
  phoneme?: string
}

interface LiveAnalysis {
  accuracy: number
  wpm: number
  pronunciationScore: number
  feedback: PronunciationFeedback[]
  confidence: number
}

interface VoiceSettings {
  language: string
  showAnalysis: boolean
  showWaveform: boolean
  continuousMode: boolean
}

// Language configurations for better cross-browser support
const LANGUAGE_OPTIONS = [
  { code: 'en-US', name: 'English (US)', accent: 'American' },
  { code: 'en-GB', name: 'English (UK)', accent: 'British' },
  { code: 'en-AU', name: 'English (AU)', accent: 'Australian' },
  { code: 'en-IN', name: 'English (IN)', accent: 'Indian' },
  { code: 'en-CA', name: 'English (CA)', accent: 'Canadian' },
]

// Enhanced tokenize with better punctuation handling
function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.replace(/['-]+$/, ''))
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

// Enhanced pronunciation analysis with phoneme-level feedback
function analyzePronunciation(spokenWords: string[], targetWords: string[]): PronunciationFeedback[] {
  const feedback: PronunciationFeedback[] = []

  spokenWords.forEach((spoken, index) => {
    if (index >= targetWords.length) return

    const target = targetWords[index]
    const distance = levenshtein(tokenize(spoken), tokenize(target))

    // Simple phoneme-based scoring (can be enhanced with actual phoneme libraries)
    let score = Math.max(0, 100 - (distance * 25))
    let suggestion = ''

    // Basic phonetic analysis patterns
    if (score < 70) {
      if (spoken.includes('th') && !target.includes('th')) {
        suggestion = 'Try pronouncing "th" more clearly'
      } else if (spoken.length > target.length + 2) {
        suggestion = 'You may have added extra sounds'
      } else if (spoken.length < target.length - 1) {
        suggestion = 'Try pronouncing all sounds in the word'
      } else {
        suggestion = 'Listen carefully and repeat'
      }
    }

    feedback.push({
      word: spoken,
      score,
      suggestion: score < 80 ? suggestion : undefined,
      phoneme: score < 60 ? target : undefined
    })
  })

  return feedback
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

export default function VoiceReadingAssessment({ onPlan }: { onPlan?: () => void }) {
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage | null>(null)

  // Enhanced recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [readingStarted, setReadingStarted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Enhanced live transcript and analysis
  const [transcript, setTranscript] = useState("")
  const [liveTranscript, setLiveTranscript] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [liveAnalysis, setLiveAnalysis] = useState<LiveAnalysis | null>(null)

  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: 'en-US',
    showAnalysis: true,
    showWaveform: true,
    continuousMode: true
  })

  // Audio visualization
  const [audioData, setAudioData] = useState<number[]>([])
  const [isMicPermissionGranted, setIsMicPermissionGranted] = useState(false)

  // Refs
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  // In the browser, setTimeout returns a number; this type works in both DOM and Node typings
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

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

  // Enhanced live analysis with pronunciation feedback
  const liveAnalysisData = useMemo(() => {
    if (!transcript || !selectedPassage) return null

    const feedback = analyzePronunciation(transcriptTokens, passageTokens.slice(0, transcriptTokens.length))
    const avgPronunciationScore = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.score, 0) / feedback.length
      : 0

    const confidence = transcriptTokens.length > 0 ? Math.min(100, transcriptTokens.length * 10) : 0

    return {
      accuracy,
      wpm,
      pronunciationScore: Math.round(avgPronunciationScore),
      feedback,
      confidence
    }
  }, [transcript, selectedPassage, accuracy, wpm, transcriptTokens, passageTokens])

  // Update live analysis state
  useEffect(() => {
    setLiveAnalysis(liveAnalysisData)
  }, [liveAnalysisData])

  // Audio visualization functions
  const startAudioVisualization = useCallback(async (stream: MediaStream) => {
    if (!voiceSettings.showWaveform) return

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateVisualization = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
        const normalizedData = Array.from(dataArray).map(value => value / 255)
        setAudioData(normalizedData.slice(0, 32)) // Use first 32 frequency bins

        animationFrameRef.current = requestAnimationFrame(updateVisualization)
      }

      updateVisualization()
    } catch (error) {
      console.warn('Audio visualization not supported:', error)
    }
  }, [voiceSettings.showWaveform])

  const stopAudioVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setAudioData([])
  }, [])

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
  // (refs already declared above)

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

  // Enhanced Web Speech API recognition with better error handling
  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser')
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = voiceSettings.continuousMode
    rec.interimResults = true
    rec.lang = voiceSettings.language
    rec.maxAlternatives = 1

    rec.onstart = () => {
      setIsProcessing(false)
    }

    rec.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""
      let lastSegment = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const segment = result[0].transcript
        lastSegment = segment

        if (result.isFinal) {
          finalTranscript += segment
        } else {
          interimTranscript += segment
        }
      }

      if (finalTranscript) {
        setTranscript(prev => (prev ? prev + " " : "") + finalTranscript.trim())
      }

      // Combine existing saved transcript with any new final and interim text
      setLiveTranscript(`${(transcript ? transcript + " " : "")}${finalTranscript.trim()} ${interimTranscript || lastSegment}`.trim())
    }

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsProcessing(false)

      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access and try again.')
        setIsMicPermissionGranted(false)
      } else if (event.error === 'no-speech') {
        toast.warning('No speech detected. Please speak clearly.')
      } else {
        toast.error(`Speech recognition error: ${event.error}`)
      }
    }

    rec.onend = () => {
      setIsProcessing(false)
      if (isRecording && voiceSettings.continuousMode) {
        // Restart recognition for continuous mode
        try {
          rec.start()
        } catch (error) {
          console.warn('Failed to restart recognition:', error)
        }
      }
    }

    recognitionRef.current = rec
  }, [voiceSettings.language, voiceSettings.continuousMode, isRecording])

  const startRecording = async () => {
    try {
      setIsProcessing(true)
      toast.info('Requesting microphone access...')

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      setIsMicPermissionGranted(true)
      toast.success('Microphone access granted!')

      // Start audio visualization
      await startAudioVisualization(stream)

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType })
        setHasRecorded(true)
        stream.getTracks().forEach((track) => track.stop())
        stopAudioVisualization()
      }

      mediaRecorder.start(1000) // Collect data every second

      // Start speech recognition
      if (!recognitionRef.current) {
        toast.error('Speech recognition is not supported in this browser.')
        setIsProcessing(false)
        return
      }

      setTranscript("")
      setLiveTranscript("")
      setStartTime(Date.now())
      setHighlightIndex(0)

      recognitionRef.current.start()

      setIsRecording(true)
      setRecordingTime(0)
      setReadingStarted(true)
      setIsProcessing(false)

    } catch (error) {
      console.error("Error accessing microphone:", error)
      setIsProcessing(false)
      setIsMicPermissionGranted(false)

      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error('Microphone access denied. Please allow microphone access in your browser settings.')
        } else if (error.name === 'NotFoundError') {
          toast.error('No microphone found. Please check your audio devices.')
        } else {
          toast.error(`Audio error: ${error.message}`)
        }
      } else {
        toast.error('Failed to start recording. Please try again.')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }

    stopAudioVisualization()
    setIsRecording(false)
    setLiveTranscript(transcript)
    setIsProcessing(false)

    if (transcript) {
      toast.success('Recording completed! Analysis ready.')
    }
  }

  // Utility functions for transcript actions
  const downloadTranscript = () => {
    if (!transcript) {
      toast.error('No transcript available to download')
      return
    }

    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reading-transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Transcript downloaded!')
  }

  const copyTranscriptToClipboard = async () => {
    if (!transcript) {
      toast.error('No transcript available to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(transcript)
      toast.success('Transcript copied to clipboard!')
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = transcript
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Transcript copied to clipboard!')
    }
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
    // Stop all ongoing processes
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    stopAudioVisualization()
    window.speechSynthesis.cancel()

    // Reset all state
    setSelectedPassage(null)
    setIsRecording(false)
    setIsPlaying(false)
    setRecordingTime(0)
    setHasRecorded(false)
    setShowResults(false)
    setReadingStarted(false)
    setIsProcessing(false)
    setTranscript("")
    setLiveTranscript("")
    setStartTime(null)
    setHighlightIndex(0)
    setLiveAnalysis(null)
    setAudioData([])
    setIsMicPermissionGranted(false)
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
          <Button
            onClick={() => {
              try {
                const plan = {
                  recommended: (results.accuracy < 85 || results.wordsPerMinute < 60) ? "sound-match" : "story-scramble",
                  reasons: [
                    results.accuracy < 85 ? "Accuracy below target — practice phoneme discrimination." : "Sequencing practice to build comprehension.",
                    `WPM: ${results.wordsPerMinute}, Accuracy: ${results.accuracy}%`,
                  ],
                  focus: selectedPassage?.focusAreas || [],
                  timestamp: Date.now(),
                }
                localStorage.setItem("ai.learningPlan", JSON.stringify(plan))
              } catch {}
              if (onPlan) onPlan()
            }}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Generate Plan
          </Button>
          <Button variant="outline" onClick={resetAssessment}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  // Audio Waveform Visualization Component
  const AudioWaveform = () => {
    if (!voiceSettings.showWaveform || !isRecording || audioData.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-1 h-16 mb-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border"
      >
        {audioData.map((value, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-t from-primary to-accent rounded-full min-w-[3px]"
            animate={{
              height: `${Math.max(4, value * 60)}px`,
              opacity: value > 0.1 ? 1 : 0.3
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </motion.div>
    )
  }

  // Live Analysis Display Component
  const LiveAnalysisDisplay = () => {
    if (!voiceSettings.showAnalysis || !liveAnalysis) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{liveAnalysis.accuracy}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-chart-2">{liveAnalysis.wpm}</div>
            <div className="text-xs text-muted-foreground">WPM</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-secondary">{liveAnalysis.pronunciationScore}%</div>
            <div className="text-xs text-muted-foreground">Pronunciation</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-accent">{liveAnalysis.confidence}%</div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Voice Settings Component
  const VoiceSettingsPanel = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5" />
          Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Language/Accent</label>
          <Select
            value={voiceSettings.language}
            onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, language: value }))}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name} ({lang.accent})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Show Live Analysis</label>
          <Switch
            checked={voiceSettings.showAnalysis}
            onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, showAnalysis: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Show Waveform</label>
          <Switch
            checked={voiceSettings.showWaveform}
            onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, showWaveform: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Continuous Mode</label>
          <Switch
            checked={voiceSettings.continuousMode}
            onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, continuousMode: checked }))}
          />
        </div>
      </CardContent>
    </Card>
  )

  if (selectedPassage) {
    const progress = Math.min(100, Math.round((highlightIndex / Math.max(1, passageTokens.length)) * 100))

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedPassage(null)}>
              ← Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">{selectedPassage.title}</h1>
                <p className="text-sm text-muted-foreground capitalize">{selectedPassage.level} Level • Voice Reading Practice</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voice Settings */}
        <VoiceSettingsPanel />

        {/* Live Analysis */}
        <LiveAnalysisDisplay />

        {/* Reading Passage with enhanced highlighting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-balance">Read This Passage Aloud</CardTitle>
            <CardDescription className="text-center">
              Click the microphone to start recording, then read clearly at your natural pace
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            {/* Audio Waveform */}
            <AudioWaveform />

            {/* Reading Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="text-lg leading-8 text-center max-w-2xl mx-auto mb-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={highlightIndex}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className="transition-all duration-300"
                >
                  {passageTokens.map((t, i) => {
                    const isDone = i < highlightIndex
                    const isCurrent = i === highlightIndex
                    const err = alignment.errors[i] || 0
                    const maxErr = 3
                    const alpha = Math.max(0, Math.min(1, err / maxErr))

                    return (
                      <motion.span
                        key={i}
                        className={`rounded px-1 transition-all duration-300 ${
                          isDone
                            ? "bg-green-200/60 text-foreground"
                            : isCurrent
                            ? "bg-yellow-200/60 text-foreground shadow-lg"
                            : err > 0
                            ? "bg-red-100/60 text-foreground"
                            : ""
                        }`}
                        animate={{
                          scale: isCurrent ? 1.05 : 1,
                          backgroundColor: err > 0 && !isDone && !isCurrent
                            ? `rgba(255, 0, 0, ${0.18 + 0.22 * alpha})`
                            : undefined
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {t}{" "}
                      </motion.span>
                    )
                  })}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Focus Areas */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {selectedPassage.focusAreas.map((area, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>

            {/* Enhanced Controls */}
            <div className="flex flex-col items-center gap-6">
              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={playModelReading}
                  disabled={isRecording || isProcessing}
                  className="hover:bg-primary/5"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Stop Listening" : "Listen First"}
                </Button>
              </div>

              {/* Enhanced Mic Button */}
              <motion.div
                whileHover={!isProcessing ? { scale: 1.05 } : {}}
                whileTap={!isProcessing ? { scale: 0.95 } : {}}
              >
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing || isPlaying}
                  className={`relative overflow-hidden px-8 py-4 text-lg font-semibold transition-all duration-300 ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
                      : isProcessing
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  <motion.div
                    animate={isRecording ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: isRecording ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                    className="flex items-center gap-3"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                    <span>
                      {isProcessing
                        ? "Initializing..."
                        : isRecording
                        ? "Stop Recording"
                        : "Start Reading"
                      }
                    </span>
                  </motion.div>

                  {/* Recording Pulse Effect */}
                  {isRecording && (
                    <motion.div
                      className="absolute inset-0 bg-red-600 rounded-md"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0, 0.3]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </Button>
              </motion.div>

              {/* Recording Status */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-red-600 mb-2 font-mono">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <motion.div
                        className="w-3 h-3 bg-red-600 rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      Recording... Speak clearly and take your time
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recording Complete */}
              <AnimatePresence>
                {hasRecorded && !isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2 text-green-600 mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold">Recording complete! Ready for analysis.</span>
                    </motion.div>
                    <Button
                      onClick={analyzeReading}
                      className="bg-gradient-to-r from-chart-2 to-chart-2/80 hover:from-chart-2/90 hover:to-chart-2 text-white px-6 py-2"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze My Reading
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Transcript Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-balance flex items-center gap-2">
                        {isRecording ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Mic className="w-5 h-5 text-red-600" />
                          </motion.div>
                        ) : (
                          <Languages className="w-5 h-5" />
                        )}
                        {isRecording ? "Live Transcript" : "Your Transcript"}
                      </CardTitle>
                      <CardDescription>
                        {isRecording
                          ? "Real-time speech-to-text with live analysis"
                          : "Your recorded speech converted to text"
                        }
                      </CardDescription>
                    </div>
                    {transcript && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyTranscriptToClipboard}
                          className="hover:bg-primary/5"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadTranscript}
                          className="hover:bg-primary/5"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32 w-full rounded-md border p-4">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      <AnimatePresence mode="wait">
                        {liveTranscript ? (
                          <motion.div
                            key="transcript"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {isRecording && (
                              <span className="inline-block w-2 h-4 bg-red-600 ml-1 animate-pulse mr-1" />
                            )}
                            {liveTranscript}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-muted-foreground italic"
                          >
                            {isRecording
                              ? "🎤 Listening... Start speaking to see your words appear here"
                              : "📝 Click 'Start Reading' to begin recording your voice"
                            }
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>

                  {/* Live Pronunciation Feedback */}
                  {voiceSettings.showAnalysis && liveAnalysis && liveAnalysis.feedback.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t"
                    >
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        Pronunciation Tips
                      </h4>
                      <div className="space-y-2">
                        {liveAnalysis.feedback.slice(0, 3).map((feedback, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`text-xs p-2 rounded flex items-center gap-2 ${
                              feedback.score >= 80
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : feedback.score >= 60
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {feedback.score >= 80 ? (
                              <CheckCircle className="w-3 h-3 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            )}
                            <span>
                              <strong>"{feedback.word}"</strong>: {feedback.suggestion || "Good pronunciation!"}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </CardContent>
        </Card>

        {/* Enhanced Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm text-balance flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Reading Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <motion.div
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-primary/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span>Read at a comfortable pace</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-secondary/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                  <span>Pronounce each word clearly</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-accent/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                  <span>Don't worry about mistakes</span>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Voice Reading Assessment
            </h1>
            <p className="text-muted-foreground text-lg">
              Practice reading aloud with AI-powered live transcript and pronunciation analysis
            </p>
          </div>
        </div>

        {/* Browser Compatibility Notice */}
        {!isMicPermissionGranted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Browser Compatibility</h3>
                <p className="text-sm text-blue-700">
                  This feature works best in Chrome, Edge, or Safari. Click "Start Reading" to grant microphone access.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Passage Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-balance mb-2">Choose Your Reading Challenge</h2>
          <p className="text-muted-foreground">Select a passage that matches your reading level and goals</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readingPassages.map((passage, index) => (
            <motion.div
              key={passage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 group"
                onClick={() => setSelectedPassage(passage)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-balance group-hover:text-primary transition-colors">
                          {passage.title}
                        </CardTitle>
                        <Badge
                          variant={passage.level === "beginner" ? "secondary" : passage.level === "intermediate" ? "default" : "outline"}
                          className="capitalize mt-1"
                        >
                          {passage.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    Perfect for practicing {passage.focusAreas.join(", ").toLowerCase()}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-4 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {passage.text}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {passage.focusAreas.map((area, areaIndex) => (
                        <Badge key={areaIndex} variant="outline" className="text-xs bg-primary/5">
                          {area}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                      size="sm"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Start Reading
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
