"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Simple Simon Says game with multisensory cues (color, tone, words)
// Focuses on short, clear feedback, progressive difficulty, and accessibility.

const PAD_COLORS = [
  { key: 0, name: "Red", color: "bg-red-500", active: "bg-red-400", aria: "Red pad", freq: 440 },
  { key: 1, name: "Blue", color: "bg-blue-500", active: "bg-blue-400", aria: "Blue pad", freq: 523.25 },
  { key: 2, name: "Green", color: "bg-green-500", active: "bg-green-400", aria: "Green pad", freq: 659.25 },
  { key: 3, name: "Yellow", color: "bg-yellow-500", active: "bg-yellow-400", aria: "Yellow pad", freq: 783.99 },
]

function speak(text: string, enabled: boolean) {
  if (!enabled) return
  try {
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1
    utter.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  } catch {}
}

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const init = () => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const gain = ctx.createGain()
      gain.gain.value = 0.04
      gain.connect(ctx.destination)
      ctxRef.current = ctx
      gainRef.current = gain
    }
  }

  const beep = (freq: number, ms: number) => {
    init()
    const ctx = ctxRef.current!
    const gain = gainRef.current!
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.value = freq
    osc.connect(gain)
    osc.start()
    setTimeout(() => {
      osc.stop()
      osc.disconnect()
    }, ms)
  }

  return { beep }
}

export default function SimonSays() {
  const [sequence, setSequence] = useState<number[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [activePad, setActivePad] = useState<number | null>(null)
  const [round, setRound] = useState(0) // current round length
  const [level, setLevel] = useState(1)
  const [bestScore, setBestScore] = useState(0)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  // Accessibility and multisensory toggles
  const [soundsOn, setSoundsOn] = useState(true)
  const [speakWords, setSpeakWords] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  const { beep } = useAudio()

  // Playback speed shortens as level grows
  const stepMs = useMemo(() => Math.max(300, 900 - level * 60), [level])

  useEffect(() => {
    // Load stats
    try {
      const bs = parseInt(localStorage.getItem("simonSays.bestScore") || "0", 10)
      const lv = parseInt(localStorage.getItem("simonSays.level") || "1", 10)
      if (!Number.isNaN(bs)) setBestScore(bs)
      if (!Number.isNaN(lv)) setLevel(Math.max(1, lv))
    } catch {}
  }, [])

  const saveStats = (score: number, lv: number) => {
    try {
      localStorage.setItem("simonSays.bestScore", String(score))
      localStorage.setItem("simonSays.level", String(lv))
    } catch {}
  }

  const flashPad = async (padIndex: number, say = false) => {
    setActivePad(padIndex)
    const pad = PAD_COLORS[padIndex]
    if (soundsOn) beep(pad.freq, stepMs - 100)
    if (say) speak(pad.name, speakWords)
    await new Promise((r) => setTimeout(r, stepMs))
    setActivePad(null)
    await new Promise((r) => setTimeout(r, Math.max(120, stepMs * 0.3)))
  }

  const playback = async (seq: number[]) => {
    setIsPlayingBack(true)
    for (let i = 0; i < seq.length; i++) {
      // Say the first item in round to reduce cognitive load
      await flashPad(seq[i], i === 0)
    }
    setIsPlayingBack(false)
  }

  const startGame = async () => {
    setIsGameOver(false)
    const first = Math.floor(Math.random() * 4)
    const initSeq = [first]
    setSequence(initSeq)
    setPlayerIndex(0)
    setRound(1)
    await playback(initSeq)
  }

  const nextRound = async () => {
    const next = Math.floor(Math.random() * 4)
    const newSeq = [...sequence, next]
    setSequence(newSeq)
    setPlayerIndex(0)
    setRound(newSeq.length)
    // Every 2 rounds, increment level for speed increase
    const newLevel = 1 + Math.floor((newSeq.length - 1) / 2)
    setLevel(newLevel)
    saveStats(Math.max(bestScore, newSeq.length - 1), newLevel)
    await playback(newSeq)
  }

  const handlePadPress = async (padIndex: number) => {
    if (isPlayingBack || isGameOver || sequence.length === 0) return
    await flashPad(padIndex, true)
    const correct = sequence[playerIndex] === padIndex
    if (!correct) {
      setIsGameOver(true)
      const score = round - 1
      const newBest = Math.max(bestScore, score)
      setBestScore(newBest)
      saveStats(newBest, level)
      speak("Try again", speakWords)
      return
    }
    const nextIndex = playerIndex + 1
    if (nextIndex === sequence.length) {
      // Round complete
      const score = sequence.length
      const newBest = Math.max(bestScore, score)
      setBestScore(newBest)
      saveStats(newBest, level)
      setPlayerIndex(0)
      await new Promise((r) => setTimeout(r, 300))
      await nextRound()
    } else {
      setPlayerIndex(nextIndex)
    }
  }

  const reset = () => {
    setSequence([])
    setPlayerIndex(0)
    setRound(0)
    setIsGameOver(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-balance flex items-center gap-2">
          <span className="text-2xl">🎵</span> Simon Says
        </h2>
        <p className="text-muted-foreground text-balance">
          Listen and watch carefully — repeat the sequence of colors, sounds, or words in the correct order! Each
          round gets faster and longer, testing focus and memory.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Play Area</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tap the pads in the same order. Use the toggles for sounds and spoken words.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6 select-none">
              {PAD_COLORS.map((pad) => (
                <button
                  key={pad.key}
                  aria-label={pad.aria}
                  className={`relative h-28 sm:h-36 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-offset-2 transition-colors ${
                    activePad === pad.key ? pad.active : pad.color
                  }`}
                  onClick={() => handlePadPress(pad.key)}
                >
                  {showLabels && (
                    <span className="drop-shadow-sm" aria-hidden>
                      {pad.name}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Button onClick={startGame} disabled={isPlayingBack} className="h-10">
                {sequence.length === 0 ? "Start" : isGameOver ? "Try Again" : "Restart"}
              </Button>
              <Button onClick={reset} variant="outline" className="h-10">Reset</Button>

              <div className="flex items-center gap-2">
                <Switch id="sounds" checked={soundsOn} onCheckedChange={setSoundsOn} />
                <Label htmlFor="sounds">Sounds</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="speak" checked={speakWords} onCheckedChange={setSpeakWords} />
                <Label htmlFor="speak">Speak words</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="labels" checked={showLabels} onCheckedChange={setShowLabels} />
                <Label htmlFor="labels">Show labels</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Faster and longer every round</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge>Level: {level}</Badge>
                <Badge variant="outline">Round: {round}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">Best Score: {bestScore}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Tip: Focus on the first cue in each round. Use colors, tones, or words—whatever helps you most.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}