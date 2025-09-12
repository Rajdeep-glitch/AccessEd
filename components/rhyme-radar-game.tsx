"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface RhymeSet {
  words: string[]
  oddOneOut: number
  explanation: string
}

const rhymeSets: RhymeSet[] = [
  {
    words: ["cat", "bat", "hat", "dog"],
    oddOneOut: 3,
    explanation: "Cat, bat, and hat all rhyme with the 'at' sound. Dog doesn't rhyme with them.",
  },
  {
    words: ["sun", "fun", "run", "car"],
    oddOneOut: 3,
    explanation: "Sun, fun, and run all rhyme with the 'un' sound. Car doesn't rhyme with them.",
  },
  {
    words: ["tree", "bee", "see", "book"],
    oddOneOut: 3,
    explanation: "Tree, bee, and see all rhyme with the 'ee' sound. Book doesn't rhyme with them.",
  },
  {
    words: ["ball", "tall", "wall", "fish"],
    oddOneOut: 3,
    explanation: "Ball, tall, and wall all rhyme with the 'all' sound. Fish doesn't rhyme with them.",
  },
  {
    words: ["cake", "lake", "make", "bird"],
    oddOneOut: 3,
    explanation: "Cake, lake, and make all rhyme with the 'ake' sound. Bird doesn't rhyme with them.",
  },
  {
    words: ["night", "light", "bright", "house"],
    oddOneOut: 3,
    explanation: "Night, light, and bright all rhyme with the 'ight' sound. House doesn't rhyme with them.",
  },
]

export default function RhymeRadarGame() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentSet, setCurrentSet] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameActive, setGameActive] = useState(false)
  const [selectedWord, setSelectedWord] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [streak, setStreak] = useState(0)
  const [highScore, setHighScore] = useState(85)
  const [gameComplete, setGameComplete] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameActive && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0 && gameActive) {
      endGame()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, gameActive, showResult])

  const startGame = () => {
    setGameActive(true)
    setCurrentSet(0)
    setScore(0)
    setTimeLeft(30)
    setSelectedWord(null)
    setShowResult(false)
    setStreak(0)
    setGameComplete(false)
  }

  const selectWord = (wordIndex: number) => {
    if (showResult || !gameActive) return

    setSelectedWord(wordIndex)
    const correct = wordIndex === rhymeSets[currentSet].oddOneOut
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      const points = Math.max(10, 20 - Math.floor((30 - timeLeft) / 2)) // Bonus for speed
      setScore(score + points)
      setStreak(streak + 1)
    } else {
      setStreak(0)
    }

    // Auto-advance after 2 seconds
    setTimeout(() => {
      nextRound()
    }, 2000)
  }

  const nextRound = () => {
    if (currentSet < rhymeSets.length - 1) {
      setCurrentSet(currentSet + 1)
      setSelectedWord(null)
      setShowResult(false)
      setTimeLeft(Math.max(15, 30 - currentLevel * 2)) // Decrease time as level increases
    } else {
      endGame()
    }
  }

  const endGame = () => {
    setGameActive(false)
    setGameComplete(true)
    if (score > highScore) {
      setHighScore(score)
    }
  }

  const resetGame = () => {
    setGameActive(false)
    setCurrentSet(0)
    setScore(0)
    setTimeLeft(30)
    setSelectedWord(null)
    setShowResult(false)
    setStreak(0)
    setGameComplete(false)
  }

  const speakWord = (word: string) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.8
      utterance.pitch = 1.2
      window.speechSynthesis.speak(utterance)
    }
  }

  const currentRhymeSet = rhymeSets[currentSet]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">Rhyme Radar</h1>
            <p className="text-muted-foreground">Find the word that doesn't rhyme!</p>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{highScore}</div>
              <div className="text-sm text-muted-foreground">High Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{currentLevel}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!gameActive && !gameComplete && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl text-balance">Ready to Play Rhyme Radar?</CardTitle>
            <CardDescription>
              Listen to the words and find the one that doesn't rhyme with the others. You have limited time!
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <Button size="lg" onClick={startGame} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <span className="mr-2">⚡</span>
              Start Game
            </Button>
          </CardContent>
        </Card>
      )}

      {gameComplete && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-center gap-2 text-balance">
              <span className="text-2xl">🏆</span>
              Game Complete!
            </CardTitle>
            <CardDescription>Great job finding all the odd words out!</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{score}</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {Math.round((score / (rhymeSets.length * 20)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{streak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={startGame} className="bg-accent text-accent-foreground hover:bg-accent/90">
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
          {/* Timer and Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  <span className="font-medium">Time Left: {timeLeft}s</span>
                </div>
                <Badge variant="outline">
                  Round {currentSet + 1} of {rhymeSets.length}
                </Badge>
              </div>
              <Progress value={(timeLeft / 30) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Game Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-balance">Which word doesn't rhyme?</CardTitle>
              <CardDescription className="text-center">
                Click on the word that sounds different from the others
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {currentRhymeSet.words.map((word, index) => (
                  <Button
                    key={index}
                    variant={
                      selectedWord === null
                        ? "outline"
                        : selectedWord === index
                          ? isCorrect
                            ? "default"
                            : "destructive"
                          : index === currentRhymeSet.oddOneOut && showResult
                            ? "default"
                            : "outline"
                    }
                    size="lg"
                    className="h-20 text-xl font-medium relative"
                    onClick={() => selectWord(index)}
                    disabled={showResult}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-balance">{word}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation()
                          speakWord(word)
                        }}
                      >
                        <span className="text-lg">🔊</span>
                      </Button>
                    </div>
                    {showResult && selectedWord === index && (
                      <div className="absolute -top-2 -right-2">
                        {isCorrect ? <span className="text-2xl">✅</span> : <span className="text-2xl">❌</span>}
                      </div>
                    )}
                  </Button>
                ))}
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-muted rounded-lg max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? <span className="text-xl">✅</span> : <span className="text-xl">❌</span>}
                    <span className="font-medium">{isCorrect ? "Correct!" : "Not quite right"}</span>
                    {isCorrect && streak > 1 && (
                      <Badge variant="secondary" className="ml-2">
                        <span className="mr-1">⭐</span>
                        {streak} streak!
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-balance">{currentRhymeSet.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
