"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Story Scramble — Drag sentences into the correct order
// - Difficulty scaling: 3, 4–5, 6+ sentences
// - Checks correctness, highlights mistakes, allows retry
// - Reads full story aloud on success
// - Optional timer for challenge mode
// - Persists: storyScramble.completed, storyScramble.level

type Story = string[]

type DnDSentence = {
  id: string
  text: string
}

const STORIES_EASY: Story[] = [
  ["I wake up.", "I brush my teeth.", "I eat breakfast."],
  ["The sun rises.", "Birds sing.", "We go to school."],
  ["Sam ties his shoes.", "He grabs his bag.", "He runs to the bus."],
]

const STORIES_MEDIUM: Story[] = [
  [
    "Mia mixes the batter.",
    "She pours it in a pan.",
    "The cake bakes in the oven.",
    "Her family shares a slice.",
  ],
  [
    "I pack my lunch.",
    "I put on my coat.",
    "I meet my friend at the gate.",
    "We walk to class together.",
  ],
  [
    "Dad plants a seed.",
    "He waters it each day.",
    "A sprout pops up.",
    "Soon, a flower blooms.",
  ],
]

const STORIES_HARD: Story[] = [
  [
    "Before the race, I stretch my legs.",
    "Then the whistle blows.",
    "After that, I run as fast as I can.",
    "I keep my eyes on the finish line.",
    "Finally, I cross it and smile.",
    "My friends cheer for me.",
  ],
  [
    "First, we pack our picnic basket.",
    "Then we drive to the park.",
    "After lunch, we play on the swings.",
    "Before sunset, we take a walk.",
    "At last, we head home, tired and happy.",
    "We talk about our favorite moments.",
  ],
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function speak(text: string, rate = 1) {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.lang = "en-US"
    window.speechSynthesis.speak(u)
  } catch {}
}

function queueSpeak(lines: string[], rate = 1) {
  try {
    window.speechSynthesis.cancel()
    lines.forEach((t, i) => {
      const u = new SpeechSynthesisUtterance(t)
      u.rate = rate
      u.lang = "en-US"
      u.pitch = 1
      u.volume = 1
      u.onend = () => {}
      // small pause between
      if (i < lines.length - 1) {
        const pause = new SpeechSynthesisUtterance(" ")
        pause.rate = rate
        pause.lang = "en-US"
        window.speechSynthesis.speak(u)
        window.speechSynthesis.speak(pause)
      } else {
        window.speechSynthesis.speak(u)
      }
    })
  } catch {}
}

export default function StoryScramble() {
  const [level, setLevel] = useState(1)
  const [storiesCompleted, setStoriesCompleted] = useState(0)
  const [score, setScore] = useState(0)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [original, setOriginal] = useState<Story>([])
  const [items, setItems] = useState<DnDSentence[]>([])
  const [misplaced, setMisplaced] = useState<boolean[]>([])
  const [won, setWon] = useState(false)

  const dragIndexRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  // Load persisted
  useEffect(() => {
    try {
      const sc = parseInt(localStorage.getItem("storyScramble.completed") || "", 10)
      const lv = parseInt(localStorage.getItem("storyScramble.level") || "", 10)
      if (!Number.isNaN(sc)) setStoriesCompleted(sc)
      if (!Number.isNaN(lv)) setLevel(Math.max(1, lv))
    } catch {}
  }, [])

  // Helpers to persist
  const persistCompleted = useCallback((val: number) => {
    try { localStorage.setItem("storyScramble.completed", String(val)) } catch {}
  }, [])
  const persistLevel = useCallback((val: number) => {
    try { localStorage.setItem("storyScramble.level", String(val)) } catch {}
  }, [])

  // Select a story based on current level
  const pickStory = useCallback((): Story => {
    if (level <= 1) return shuffle(STORIES_EASY)[0]
    if (level === 2) return shuffle(STORIES_MEDIUM)[0]
    return shuffle(STORIES_HARD)[0]
  }, [level])

  const timePerRound = useMemo(() => {
    const len = original.length || 4
    // generous time based on sentence count
    const base = len <= 3 ? 60 : len <= 5 ? 90 : 120
    // slight reduction for higher levels
    return Math.max(30, base - (level - 1) * 10)
  }, [level, original.length])

  const startRound = useCallback(() => {
    const story = pickStory()
    const shuffled = shuffle(story).map((t, i) => ({ id: `${Date.now()}-${i}`, text: t }))

    setOriginal(story)
    setItems(shuffled)
    setMisplaced(new Array(story.length).fill(false))
    setWon(false)
    setTimeLeft(timePerRound)
  }, [pickStory, timePerRound])

  useEffect(() => {
    startRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  // Timer effect
  useEffect(() => {
    if (!timerEnabled) return
    if (timeLeft <= 0) return
    timerRef.current = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [timerEnabled, timeLeft])

  useEffect(() => {
    if (timerEnabled && timeLeft === 0 && !won) {
      // time out ⇒ show mistakes
      checkOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerEnabled, timeLeft])

  const onDragStart = (index: number) => (e: React.DragEvent) => {
    dragIndexRef.current = index
    e.dataTransfer.effectAllowed = "move"
  }

  const onDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const onDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from == null || from === index) return
    const updated = [...items]
    const [moved] = updated.splice(from, 1)
    updated.splice(index, 0, moved)
    setItems(updated)
    dragIndexRef.current = null
  }

  const moveUp = (i: number) => {
    if (i <= 0) return
    const updated = [...items]
    const [m] = updated.splice(i, 1)
    updated.splice(i - 1, 0, m)
    setItems(updated)
  }
  const moveDown = (i: number) => {
    if (i >= items.length - 1) return
    const updated = [...items]
    const [m] = updated.splice(i, 1)
    updated.splice(i + 1, 0, m)
    setItems(updated)
  }

  const checkOrder = useCallback(() => {
    const current = items.map((x) => x.text)
    const flags = current.map((t, i) => t === original[i])
    const allCorrect = flags.every(Boolean)
    setMisplaced(flags.map((ok) => !ok))

    if (allCorrect) {
      setWon(true)
      const nextCompleted = storiesCompleted + 1
      const gained = 20 + original.length * 5
      setScore((s) => s + gained)
      setStoriesCompleted(nextCompleted)
      persistCompleted(nextCompleted)

      // Level up every 2 stories until hard tier, then every 3
      const threshold = level < 3 ? 2 : 3
      if (nextCompleted % threshold === 0) {
        const nextLevel = Math.min(6, level + 1)
        setLevel(nextLevel)
        persistLevel(nextLevel)
      }

      // Read full story aloud
      queueSpeak(original, 1)
    }
  }, [items, level, original, persistCompleted, persistLevel, storiesCompleted])

  const retry = () => {
    // keep same story, reshuffle
    const shuffled = shuffle(original).map((t, i) => ({ id: `${Date.now()}-${i}`, text: t }))
    setItems(shuffled)
    setMisplaced(new Array(original.length).fill(false))
    setWon(false)
    setTimeLeft(timePerRound)
  }

  const nextStory = () => {
    startRound()
    setTimeLeft(timePerRound)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>📖 Story Scramble</CardTitle>
              <CardDescription>Drag sentences into the correct order. Check your sequence when ready.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Level {level}</Badge>
              <Badge>Completed {storiesCompleted}</Badge>
              <Badge variant="outline">Score {score}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant={timerEnabled ? "default" : "outline"} onClick={() => setTimerEnabled((v) => !v)}>
              ⏱️ Timer {timerEnabled ? "On" : "Off"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => queueSpeak(original, 0.95)}>
              🔊 Read Story
            </Button>
            <Button size="sm" variant="secondary" onClick={retry}>🔄 Reshuffle</Button>
          </div>

          {/* Timer */}
          {timerEnabled && (
            <div>
              <Progress value={(timeLeft / timePerRound) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">Time left: {timeLeft}s</div>
            </div>
          )}

          {/* Draggable list */}
          <ol className="space-y-2">
            {items.map((it, idx) => (
              <li key={it.id} className="flex items-center gap-2">
                <span className="w-6 text-right text-muted-foreground">{idx + 1}</span>
                <div
                  draggable
                  onDragStart={onDragStart(idx)}
                  onDragOver={onDragOver(idx)}
                  onDrop={onDrop(idx)}
                  className={`flex-1 p-3 rounded-lg border bg-white dark:bg-black text-base leading-6 select-none cursor-grab ${
                    misplaced[idx] ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg">{it.text}</span>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => speak(it.text, 0.95)} aria-label="Play sentence">
                        🔊
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => moveUp(idx)} aria-label="Move up">
                        ▲
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => moveDown(idx)} aria-label="Move down">
                        ▼
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!won ? (
              <Button className="bg-amber-500 text-white hover:bg-amber-500/90" onClick={checkOrder}>
                ✅ Check Order
              </Button>
            ) : (
              <>
                <Badge className="bg-green-600">Correct! +{20 + original.length * 5} pts</Badge>
                <Button variant="secondary" onClick={nextStory}>▶️ Next Story</Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Tips: Use the speaker to hear each sentence. Short, readable text with large spacing helps focus.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}