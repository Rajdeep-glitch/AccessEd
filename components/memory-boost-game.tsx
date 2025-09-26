"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface MemoryCard {
  id: number
  letter: string
  isFlipped: boolean
  isMatched: boolean
}

const letters = ["A", "B", "C", "D", "E", "F", "G", "H"]

export default function MemoryBoostGame() {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)

  const levelRef = useRef(level)
  const timeElapsedRef = useRef(timeElapsed)
  const movesRef = useRef(moves)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (gameActive && !gameComplete) {
      timer = setTimeout(() => setTimeElapsed(timeElapsed + 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [timeElapsed, gameActive, gameComplete])

  useEffect(() => {
    levelRef.current = level
  }, [level])

  useEffect(() => {
    timeElapsedRef.current = timeElapsed
  }, [timeElapsed])

  useEffect(() => {
    movesRef.current = moves
  }, [moves])

  useEffect(() => {
    if (flippedCards.length !== 2) {
      return
    }

    const [first, second] = flippedCards
    const firstCard = cards.find((card) => card.id === first)
    const secondCard = cards.find((card) => card.id === second)

    if (!firstCard || !secondCard) {
      return
    }

    let timeoutId: ReturnType<typeof setTimeout>

    const incrementMoves = () => {
      setMoves((prev) => {
        const updatedMoves = prev + 1
        movesRef.current = updatedMoves
        return updatedMoves
      })
    }

    if (firstCard.letter === secondCard.letter) {
      // Match found
      timeoutId = setTimeout(() => {
        setCards((prev) =>
          prev.map((card) => (card.id === first || card.id === second ? { ...card, isMatched: true } : card)),
        )
        setMatches((prev) => {
          const updatedMatches = prev + 1
          const totalPairs = letters.slice(0, 4 + levelRef.current).length

          if (updatedMatches === totalPairs) {
            setGameComplete(true)
            setGameActive(false)
          }

          return updatedMatches
        })
        setFlippedCards([])

        // Calculate score bonus for quick matches
        const timeBonus = Math.max(0, 10 - Math.floor(timeElapsedRef.current / 10))
        const moveBonus = Math.max(0, 20 - movesRef.current)
        setScore((prev) => prev + 50 + timeBonus + moveBonus)

        incrementMoves()
      }, 1000)
    } else {
      // No match
      timeoutId = setTimeout(() => {
        setCards((prev) =>
          prev.map((card) => (card.id === first || card.id === second ? { ...card, isFlipped: false } : card)),
        )
        setFlippedCards([])
        incrementMoves()
      }, 1000)
    }

    return () => clearTimeout(timeoutId)
  }, [flippedCards, cards, level])

  const initializeGame = () => {
    const gameLetters = letters.slice(0, 4 + levelRef.current) // Increase difficulty with level
    const cardPairs = [...gameLetters, ...gameLetters]
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((letter, index) => ({
        id: index,
        letter,
        isFlipped: false,
        isMatched: false,
      }))

    setCards(shuffledCards)
    setFlippedCards([])
    setMatches(0)
    setMoves(0)
    movesRef.current = 0
    setTimeElapsed(0)
    timeElapsedRef.current = 0
    setGameActive(true)
    setGameComplete(false)
  }

  const flipCard = (cardId: number) => {
    if (flippedCards.length >= 2 || flippedCards.includes(cardId)) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isMatched) return

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))
    setFlippedCards((prev) => [...prev, cardId])
  }

  const resetGame = () => {
    setCards([])
    setFlippedCards([])
    setMatches(0)
    setMoves(0)
    setTimeElapsed(0)
    setGameActive(false)
    setGameComplete(false)
    setScore(0)
  }

  const nextLevel = () => {
    setLevel((prev) => {
      const updatedLevel = prev + 1
      levelRef.current = updatedLevel
      return updatedLevel
    })
    initializeGame()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const gridCols = Math.ceil(Math.sqrt(cards.length))

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🧩</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">Memory Boost</h1>
            <p className="text-muted-foreground">Match the letter pairs to boost your memory!</p>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-chart-3">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{moves}</div>
              <div className="text-sm text-muted-foreground">Moves</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!gameActive && !gameComplete && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl text-balance">Ready to Boost Your Memory?</CardTitle>
            <CardDescription>
              Flip the cards to find matching letter pairs. Try to complete it in as few moves as possible!
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="w-24 h-24 bg-chart-3/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🧠</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={() => setLevel(Math.max(1, level - 1))} disabled={level === 1}>
                  -
                </Button>
                <span className="text-lg font-medium">Level {level}</span>
                <Button variant="outline" onClick={() => setLevel(Math.min(4, level + 1))} disabled={level === 4}>
                  +
                </Button>
              </div>
              <Button size="lg" onClick={initializeGame} className="bg-chart-3 text-white hover:bg-chart-3/90">
                <span className="mr-2">⚡</span>
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameComplete && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-center gap-2 text-balance">
              <span className="text-2xl">🏆</span>
              Level Complete!
            </CardTitle>
            <CardDescription>Excellent memory work! All pairs matched successfully.</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-chart-3">{score}</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{moves}</div>
                <div className="text-sm text-muted-foreground">Total Moves</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            {/* Performance feedback */}
            <div className="mb-6">
              {moves <= letters.slice(0, 4 + level).length + 2 && (
                <Badge className="bg-green-100 text-green-800 border-green-200 mr-2">
                  <span className="mr-1">⭐</span>
                  Perfect Memory!
                </Badge>
              )}
              {timeElapsed <= 60 && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 mr-2">
                  <span className="mr-1">⏰</span>
                  Speed Demon!
                </Badge>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              {level < 4 && (
                <Button onClick={nextLevel} className="bg-chart-3 text-white hover:bg-chart-3/90">
                  Next Level
                </Button>
              )}
              <Button onClick={initializeGame} variant="outline">
                Play Again
              </Button>
              <Button variant="outline" onClick={resetGame}>
                <span className="mr-2">🔄</span>
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gameActive && (
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">
                  Progress: {matches} of {letters.slice(0, 4 + level).length} pairs
                </span>
                <Badge variant="outline">Level {level}</Badge>
              </div>
              <Progress value={(matches / letters.slice(0, 4 + level).length) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Game Grid */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`grid gap-4 max-w-2xl mx-auto`}
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                }}
              >
                {cards.map((card) => (
                  <Button
                    key={card.id}
                    variant="outline"
                    className={`aspect-square text-2xl font-bold h-20 transition-all duration-300 ${
                      card.isFlipped || card.isMatched
                        ? card.isMatched
                          ? "bg-green-100 border-green-300 text-green-800"
                          : "bg-primary/10 border-primary text-primary"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => flipCard(card.id)}
                    disabled={card.isFlipped || card.isMatched || flippedCards.length >= 2}
                  >
                    {card.isFlipped || card.isMatched ? card.letter : "?"}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
