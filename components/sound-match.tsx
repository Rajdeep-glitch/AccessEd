"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Sound Match — Phonics-based game with audio cues and matching options
// - Levels and scaling per spec
// - Dyslexia-friendly: slow/fast playback, color-coded letters, multisensory (vibration), clear UI
// - Persists bestScore and level via localStorage keys:
//   soundMatch.bestScore, soundMatch.level

type TargetType = "letter" | "word" | "picture"

type LetterItem = { char: string; phoneme: string }
type WordItem = { word: string; emoji?: string }

type RoundTarget = {
  type: TargetType
  // canonical answer id used for comparison
  answer: string
  // label shown in option
  label: string
  // text to speak (phoneme or word)
  speakText: string
}

const VOWELS = new Set(["A", "E", "I", "O", "U"])

const LETTERS: LetterItem[] = [
  { char: "A", phoneme: "a" },
  { char: "B", phoneme: "b" },
  { char: "C", phoneme: "c" },
  { char: "D", phoneme: "d" },
  { char: "E", phoneme: "e" },
  { char: "F", phoneme: "f" },
  { char: "G", phoneme: "g" },
  { char: "H", phoneme: "h" },
  { char: "I", phoneme: "i" },
  { char: "J", phoneme: "j" },
  { char: "K", phoneme: "k" },
  { char: "L", phoneme: "l" },
  { char: "M", phoneme: "m" },
  { char: "N", phoneme: "n" },
  { char: "O", phoneme: "o" },
  { char: "P", phoneme: "p" },
  { char: "Q", phoneme: "q" },
  { char: "R", phoneme: "r" },
  { char: "S", phoneme: "s" },
  { char: "T", phoneme: "t" },
  { char: "U", phoneme: "u" },
  { char: "V", phoneme: "v" },
  { char: "W", phoneme: "w" },
  { char: "X", phoneme: "x" },
  { char: "Y", phoneme: "y" },
  { char: "Z", phoneme: "z" },
]

const WORDS: WordItem[] = [
  { word: "cat", emoji: "🐱" },
  { word: "dog", emoji: "🐶" },
  { word: "sun", emoji: "☀️" },
  { word: "bus", emoji: "🚌" },
  { word: "hat", emoji: "👒" },
  { word: "bed", emoji: "🛏️" },
  { word: "bell", emoji: "🔔" },
  { word: "fish", emoji: "🐟" },
  { word: "milk", emoji: "🥛" },
  { word: "book", emoji: "📘" },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

function speak(text: string, rate = 1) {
  try {
    // Stop any queued utterances
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.lang = "en-US"
    window.speechSynthesis.speak(u)
  } catch {}
}

function vibrate(ms: number) {
  try {
    if (typeof navigator !== "undefined" && (navigator as any).vibrate) {
      ;(navigator as any).vibrate(ms)
    }
  } catch {}
}

export default function SoundMatch() {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [round, setRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [target, setTarget] = useState<RoundTarget | null>(null)
  const [options, setOptions] = useState<RoundTarget[]>([])
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)

  const timerRef = useRef<number | null>(null)

  // Load persisted best and level
  useEffect(() => {
    try {
      const bs = parseInt(localStorage.getItem("soundMatch.bestScore") || "", 10)
      const lv = parseInt(localStorage.getItem("soundMatch.level") || "", 10)
      if (!Number.isNaN(bs)) setBestScore(bs)
      if (!Number.isNaN(lv)) setLevel(Math.max(1, lv))
    } catch {}
  }, [])

  // Persist helpers
  const persistBest = useCallback((val: number) => {
    try { localStorage.setItem("soundMatch.bestScore", String(val)) } catch {}
  }, [])
  const persistLevel = useCallback((val: number) => {
    try { localStorage.setItem("soundMatch.level", String(val)) } catch {}
  }, [])

  // Time per round decreases as level rises
  const timePerRound = useMemo(() => {
    // Level 1: 10s, down to min 4s by level 8+
    return Math.max(4, 10 - Math.floor(level / 1.5))
  }, [level])

  // Option count 3–4
  const optionCount = useMemo(() => (level >= 3 ? 4 : 3), [level])

  const currentType: TargetType = useMemo(() => {
    if (level <= 1) return "letter"
    if (level === 2) return "word"
    return "picture"
  }, [level])

  // Generate a new round
  const buildRound = useCallback(() => {
    let correct: RoundTarget
    let opts: RoundTarget[]

    if (currentType === "letter") {
      const correctLetter = pick(LETTERS, 1)[0]
      correct = {
        type: "letter",
        answer: correctLetter.char,
        label: correctLetter.char,
        speakText: correctLetter.phoneme,
      }
      const distractors = pick(
        LETTERS.filter((l) => l.char !== correctLetter.char),
        optionCount - 1
      ).map<RoundTarget>((l) => ({ type: "letter", answer: l.char, label: l.char, speakText: l.phoneme }))
      opts = shuffle([correct, ...distractors])
    } else if (currentType === "word") {
      const correctWord = pick(WORDS, 1)[0]
      correct = {
        type: "word",
        answer: correctWord.word,
        label: correctWord.word,
        speakText: correctWord.word,
      }
      const distractors = pick(
        WORDS.filter((w) => w.word !== correctWord.word),
        optionCount - 1
      ).map<RoundTarget>((w) => ({ type: "word", answer: w.word, label: w.word, speakText: w.word }))
      opts = shuffle([correct, ...distractors])
    } else {
      // picture + word association
      const correctWord = pick(WORDS, 1)[0]
      correct = {
        type: "picture",
        answer: correctWord.word,
        label: `${correctWord.emoji ?? ""} ${correctWord.word}`.trim(),
        speakText: correctWord.word,
      }
      const distractors = pick(
        WORDS.filter((w) => w.word !== correctWord.word),
        optionCount - 1
      ).map<RoundTarget>((w) => ({
        type: "picture",
        answer: w.word,
        label: `${w.emoji ?? ""} ${w.word}`.trim(),
        speakText: w.word,
      }))
      opts = shuffle([correct, ...distractors])
    }

    setTarget(correct)
    setOptions(opts)
    setTimeLeft(timePerRound)
    setIsRunning(true)

    // autoplay prompt
    setTimeout(() => speak(correct.speakText, 1), 200)
  }, [currentType, optionCount, timePerRound])

  // Start first round and whenever round increments
  useEffect(() => {
    buildRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, currentType])

  // Timer effect
  useEffect(() => {
    if (!isRunning) return
    if (timeLeft <= 0) {
      // time out → treat as wrong
      handleSelect(null)
      return
    }
    timerRef.current = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [isRunning, timeLeft])

  const levelUpIfNeeded = useCallback((newScore: number) => {
    // Simple progression: every 5 correct rounds => level up
    const computedLevel = Math.max(1, Math.floor(newScore / 50) + 1) // +1 level per 50 points
    if (computedLevel !== level) {
      setLevel(computedLevel)
      persistLevel(computedLevel)
    }
  }, [level, persistLevel])

  const handleSelect = useCallback((answer: string | null) => {
    if (!target) return

    const correct = answer !== null && answer === target.answer

    if (correct) {
      setFeedback("correct")
      const newScore = score + 10
      setScore(newScore)
      if (newScore > bestScore) {
        setBestScore(newScore)
        persistBest(newScore)
      }
      levelUpIfNeeded(newScore)
      setTimeout(() => {
        setFeedback(null)
        setRound((r) => r + 1)
      }, 400)
    } else {
      setFeedback("wrong")
      vibrate(120)
      speak(target.speakText, 0.9) // replay slower on wrong
      const newLives = lives - 1
      setLives(newLives)
      if (newLives <= 0) {
        setIsRunning(false)
      } else {
        setTimeout(() => {
          setFeedback(null)
          setRound((r) => r + 1)
        }, 500)
      }
    }
  }, [bestScore, levelUpIfNeeded, lives, persistBest, score, target])

  const restart = () => {
    setScore(0)
    setLives(3)
    setRound((r) => r + 1)
    setFeedback(null)
    setIsRunning(true)
  }

  const colorClassForLetter = (c: string) =>
    VOWELS.has(c) ? "text-primary font-semibold" : "text-secondary-foreground"

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>🔊 Sound Match</CardTitle>
              <CardDescription>
                Listen and select the correct match. Speed increases as you progress.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Level {level}</Badge>
              <Badge>Score {score}</Badge>
              <Badge variant="outline">Best {bestScore}</Badge>
              <Badge variant="secondary">Lives {"❤️".repeat(lives)}{"🖤".repeat(Math.max(0, 3 - lives))}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Playback controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => target && speak(target.speakText, 0.85)}>
              🔉 Slow
            </Button>
            <Button size="sm" variant="secondary" onClick={() => target && speak(target.speakText, 1)}>
              🔊 Play
            </Button>
            <Button size="sm" variant="secondary" onClick={() => target && speak(target.speakText, 1.25)}>
              🔊 Fast
            </Button>
          </div>

          {/* Timer */}
          <div>
            <Progress value={(timeLeft / timePerRound) * 100} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">Time left: {timeLeft}s</div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {options.map((opt) => (
              <button
                key={opt.answer}
                onClick={() => handleSelect(opt.answer)}
                className={`p-4 rounded-lg border text-center hover:shadow transition ${
                  feedback && opt.answer === target?.answer && feedback === "correct" ? "border-green-500 bg-green-50" : ""
                } ${feedback && opt.answer !== target?.answer && feedback === "wrong" ? "opacity-70" : ""}`}
              >
                {opt.type === "letter" ? (
                  <span className={`text-2xl ${colorClassForLetter(opt.label)}`}>{opt.label}</span>
                ) : (
                  <span className="text-lg">
                    {opt.label}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Game over + actions */}
          {!isRunning && lives <= 0 && (
            <div className="p-4 rounded-md border bg-muted/40">
              <div className="font-semibold mb-2">Game Over</div>
              <div className="text-sm text-muted-foreground mb-3">Your score: {score}</div>
              <Button onClick={restart} className="bg-indigo-500 text-white hover:bg-indigo-500/90">
                ▶️ Play Again
              </Button>
            </div>
          )}

          {/* Tip */}
          <p className="text-sm text-muted-foreground">
            Tip: Letters are color-coded (vowels highlighted). Use Slow/Play/Fast to hear the sound clearly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}