"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentWord, setCurrentWord] = useState(0)
  const [readingStarted, setReadingStarted] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Simulated results for demo purposes
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

  useEffect(() => {
    if (isRecording && recordingTime < 120) {
      // Max 2 minutes
      timerRef.current = setTimeout(() => {
        setRecordingTime(recordingTime + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isRecording, recordingTime])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        // Here you would typically send the audio to a speech recognition service
        setHasRecorded(true)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
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
      setIsRecording(false)
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
      utterance.rate = 0.8
      utterance.pitch = 1.1
      utterance.volume = 0.9

      // Use a clear, friendly voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find((voice) => voice.name.includes("Female") || voice.name.includes("Google"))
      if (preferredVoice) utterance.voice = preferredVoice

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const analyzeReading = () => {
    // Simulate analysis delay
    setTimeout(() => {
      setShowResults(true)
    }, 2000)
  }

  const resetAssessment = () => {
    setSelectedPassage(null)
    setIsRecording(false)
    setIsPlaying(false)
    setRecordingTime(0)
    setHasRecorded(false)
    setShowResults(false)
    setCurrentWord(0)
    setReadingStarted(false)
    window.speechSynthesis.cancel()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

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
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                  >
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
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/20"
                  >
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
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedPassage.level} Level • Voice Reading Practice
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Passage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-balance">Read This Passage Aloud</CardTitle>
            <CardDescription className="text-center">
              Click the microphone to start recording, then read clearly and at your own pace
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="text-lg leading-relaxed text-center max-w-2xl mx-auto mb-6">
              <p className="text-balance">{selectedPassage.text}</p>
            </div>

            {/* Focus Areas */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {selectedPassage.focusAreas.map((area, index) => (
                <Badge key={index} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>

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
                  className={`${
                    isRecording ? "bg-red-600 hover:bg-red-700 text-white" : "bg-chart-2 hover:bg-chart-2/90 text-white"
                  }`}
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
            <p className="text-muted-foreground">Practice reading aloud and get personalized feedback</p>
          </div>
        </div>
      </div>

      {/* Passage Selection */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-balance">Choose a Reading Passage</h2>

        <div className="grid gap-6">
          {readingPassages.map((passage) => (
            <Card
              key={passage.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPassage(passage)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-balance">{passage.title}</CardTitle>
                    <CardDescription>
                      Perfect for practicing {passage.focusAreas.join(", ").toLowerCase()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      passage.level === "beginner"
                        ? "secondary"
                        : passage.level === "intermediate"
                          ? "default"
                          : "outline"
                    }
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
              <p className="text-sm text-muted-foreground text-balance">
                Select a passage and listen to the model reading first
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-medium mb-2 text-balance">2. Record Yourself</h3>
              <p className="text-sm text-muted-foreground text-balance">
                Read the passage aloud at your own comfortable pace
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-medium mb-2 text-balance">3. Get Feedback</h3>
              <p className="text-sm text-muted-foreground text-balance">
                Receive gentle, encouraging feedback to improve your reading
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
