"use client"

import { useState, useEffect, useCallback } from "react"
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
  
  const numPairs = 4 + level - 1;

  const initializeGame = useCallback((currentLevel: number) => {
    const gameLetters = letters.slice(0, 4 + currentLevel - 1)
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
    setTimeElapsed(0)
    setGameActive(true)
    setGameComplete(false)
  }, [])
  
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameActive && !gameComplete) {
      timer = setInterval(() => {
        setTimeElapsed(t => t + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameActive, gameComplete])

  useEffect(() => {
    if (flippedCards.length !== 2) return

    const timeoutId = setTimeout(() => {
      const [firstId, secondId] = flippedCards
      const firstCard = cards.find((card) => card.id === firstId)
      const secondCard = cards.find((card) => card.id === secondId)

      setMoves(m => m + 1)

      if (firstCard && secondCard && firstCard.letter === secondCard.letter) {
        setCards(prev =>
          prev.map(card =>
            card.id === firstId || card.id === secondId ? { ...card, isMatched: true, isFlipped: false } : card
          )
        )
        setMatches(m => m + 1)
        setScore(s => {
            const timeBonus = Math.max(0, 10 - Math.floor(timeElapsed / 10))
            const moveBonus = Math.max(0, 20 - moves)
            return s + 50 + timeBonus + moveBonus
        })
      } else {
        setCards(prev =>
          prev.map(card =>
            card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card
          )
        )
      }
      setFlippedCards([])
    }, 800)
    
    return () => clearTimeout(timeoutId)
  }, [flippedCards, cards, timeElapsed, moves])

  useEffect(() => {
    if (cards.length > 0 && matches === numPairs) {
      setGameComplete(true)
      setGameActive(false)
    }
  }, [matches, cards.length, numPairs])

  const flipCard = (cardId: number) => {
    const cardToFlip = cards.find(c => c.id === cardId);
    if (!cardToFlip || cardToFlip.isFlipped || cardToFlip.isMatched || flippedCards.length >= 2) return

    setCards(prev => prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c)))
    setFlippedCards(prev => [...prev, cardId])
  }

  // This function now correctly sends the user back to the level select screen
  const resetGame = () => {
    setGameActive(false)
    setGameComplete(false)
    // Optional: reset score and level if you want a full reset
    // setScore(0)
    // setLevel(1)
  }
  
  const nextLevel = () => {
    const newLevel = level + 1
    setLevel(newLevel)
    initializeGame(newLevel)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const gridCols = Math.ceil(Math.sqrt(cards.length))

  return (
    // ✨ UI FIX: Reduced main container padding
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      {/* ✨ UI FIX: Reduced bottom margin */}
      <div className="mb-4">
        {/* ✨ UI FIX: Reduced bottom margin */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🧩</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">Memory Boost</h1>
            <p className="text-muted-foreground">Match the letter pairs to boost your memory!</p>
          </div>
        </div>

        {/* Game Stats */}
        {/* ✨ UI FIX: Reduced bottom margin */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
          <Card>
            {/* ✨ UI FIX: Reduced padding in stat cards */}
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-chart-3">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-secondary">{moves}</div>
              <div className="text-sm text-muted-foreground">Moves</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Start Screen */}
      {!gameActive && !gameComplete && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl text-balance">Ready to Boost Your Memory?</CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <div className="w-20 h-20 bg-chart-3/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🧠</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={() => setLevel(Math.max(1, level - 1))} disabled={level === 1}>-</Button>
                <span className="text-lg font-medium">Level {level}</span>
                <Button variant="outline" onClick={() => setLevel(Math.min(4, level + 1))} disabled={level === 4}>+</Button>
              </div>
              <Button size="lg" onClick={() => initializeGame(level)} className="bg-chart-3 text-white hover:bg-chart-3/90">
                <span className="mr-2">⚡</span>
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✨ UX FIX: Completion screen with clear action buttons */}
      {gameComplete && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-center gap-2 text-balance">
              <span className="text-2xl">🏆</span>
              Level Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">{score}</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{moves}</div>
                <div className="text-sm text-muted-foreground">Total Moves</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              {level < 4 && (
                <Button onClick={nextLevel} className="bg-chart-3 text-white hover:bg-chart-3/90">
                  Next Level
                </Button>
              )}
              <Button onClick={() => initializeGame(level)} variant="outline">
                Play Again (Level {level})
              </Button>
              <Button variant="outline" onClick={resetGame}>
                Change Level
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Grid */}
      {gameActive && (
        // ✨ UI FIX: Reduced spacing
        <div className="space-y-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Progress: {matches} of {numPairs} pairs</span>
                <Badge variant="outline">Level {level}</Badge>
              </div>
              <Progress value={(matches / numPairs) * 100} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            {/* ✨ UI FIX: Reduced padding */}
            <CardContent className="p-4">
              <div className="grid gap-2 md:gap-4 max-w-2xl mx-auto" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {cards.map(card => (
                  <Button
                    key={card.id}
                    variant="outline"
                    className={`aspect-square text-2xl font-bold h-16 md:h-20 transition-all duration-300 ${
                      card.isFlipped || card.isMatched
                        ? card.isMatched
                          ? "bg-green-100 border-green-300 text-green-800"
                          : "bg-primary/10 border-primary text-primary"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => flipCard(card.id)}
                    disabled={flippedCards.length === 2 || card.isFlipped || card.isMatched}
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