"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SpellingWord {
  word: string
  letters: string[]
  audio?: string
  hint: string
  difficulty: "easy" | "medium" | "hard"
}

export default function SpellingBuilder() {
  const [currentWord, setCurrentWord] = useState(0)
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null)
  const [builtWord, setBuiltWord] = useState<string[]>([])
  const [availableLetters, setAvailableLetters] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const spellingWords: SpellingWord[] = [
    {
      word: "cat",
      letters: ["c", "a", "t"],
      hint: "A furry pet that says meow",
      difficulty: "easy",
    },
    {
      word: "friend",
      letters: ["f", "r", "i", "e", "n", "d"],
      hint: "Someone you like to play with",
      difficulty: "medium",
    },
    {
      word: "beautiful",
      letters: ["b", "e", "a", "u", "t", "i", "f", "u", "l"],
      hint: "Something that looks very nice",
      difficulty: "hard",
    },
  ]

  useEffect(() => {
    resetWord()
  }, [currentWord])

  const resetWord = () => {
    const word = spellingWords[currentWord]
    const shuffled = [...word.letters].sort(() => Math.random() - 0.5)
    // Add some extra letters to make it challenging
    const extraLetters = ["x", "z", "q", "j", "k"].slice(0, Math.floor(Math.random() * 3))
    setAvailableLetters([...shuffled, ...extraLetters].sort(() => Math.random() - 0.5))
    setBuiltWord([])
    setShowHint(false)
    setIsComplete(false)
  }

  const handleDragStart = (letter: string) => {
    setDraggedLetter(letter)
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedLetter) {
      const newBuiltWord = [...builtWord]
      newBuiltWord[targetIndex] = draggedLetter
      setBuiltWord(newBuiltWord)

      // Remove letter from available letters
      setAvailableLetters((prev) => {
        const index = prev.indexOf(draggedLetter)
        if (index > -1) {
          const newLetters = [...prev]
          newLetters.splice(index, 1)
          return newLetters
        }
        return prev
      })

      setDraggedLetter(null)
    }
  }

  const handleLetterClick = (letter: string) => {
    // Find first empty slot
    const emptyIndex = builtWord.findIndex((slot) => !slot)
    if (emptyIndex !== -1) {
      handleDrop(emptyIndex)
    }
  }

  const removeLetter = (index: number) => {
    const letter = builtWord[index]
    if (letter) {
      setBuiltWord((prev) => {
        const newWord = [...prev]
        newWord[index] = ""
        return newWord
      })
      setAvailableLetters((prev) => [...prev, letter])
    }
  }

  const checkWord = () => {
    const currentWordData = spellingWords[currentWord]
    const isCorrect = builtWord.join("").toLowerCase() === currentWordData.word.toLowerCase()

    setAttempts((prev) => prev + 1)

    if (isCorrect) {
      setScore((prev) => prev + 10)
      setIsComplete(true)
      // Auto-advance after 2 seconds
      setTimeout(() => {
        if (currentWord < spellingWords.length - 1) {
          setCurrentWord((prev) => prev + 1)
        }
      }, 2000)
    }
  }

  const playAudio = () => {
    // Text-to-speech for the word
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(spellingWords[currentWord].word)
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const currentWordData = spellingWords[currentWord]
  const progress = ((currentWord + (isComplete ? 1 : 0)) / spellingWords.length) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-balance">Spelling Builder</h2>
          <p className="text-muted-foreground">Drag and drop letters to build words</p>

          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline">
              Word {currentWord + 1} of {spellingWords.length}
            </Badge>
            <Badge variant="secondary">Score: {score}</Badge>
            <Badge
              variant={
                currentWordData.difficulty === "easy"
                  ? "default"
                  : currentWordData.difficulty === "medium"
                    ? "secondary"
                    : "destructive"
              }
            >
              {currentWordData.difficulty}
            </Badge>
          </div>

          <Progress value={progress} className="mt-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Word Building Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Build the Word
              </CardTitle>
              <CardDescription>Drag letters from below or click to add them</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Button */}
              <div className="text-center">
                <Button onClick={playAudio} variant="outline" size="lg">
                  <span className="mr-2 text-xl">🔊</span>
                  Listen to Word
                </Button>
              </div>

              {/* Word Slots */}
              <div className="flex justify-center gap-2 flex-wrap">
                {Array.from({ length: currentWordData.word.length }).map((_, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center text-2xl font-bold bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    onClick={() => removeLetter(index)}
                  >
                    {builtWord[index] || ""}
                  </div>
                ))}
              </div>

              {/* Hint */}
              {showHint && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">💡</span>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Hint</h4>
                        <p className="text-yellow-700">{currentWordData.hint}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={checkWord}
                  disabled={builtWord.some((letter) => !letter) || isComplete}
                  className="flex-1"
                >
                  {isComplete ? (
                    <>
                      <span className="mr-2">✅</span>
                      Correct!
                    </>
                  ) : (
                    "Check Word"
                  )}
                </Button>
                <Button onClick={() => setShowHint(!showHint)} variant="outline">
                  <span className="text-lg">💡</span>
                </Button>
                <Button onClick={resetWord} variant="outline">
                  <span className="text-lg">🔄</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Letters */}
          <Card>
            <CardHeader>
              <CardTitle>Available Letters</CardTitle>
              <CardDescription>Drag these letters to build the word</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {availableLetters.map((letter, index) => (
                  <div
                    key={`${letter}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(letter)}
                    onClick={() => handleLetterClick(letter)}
                    className="w-16 h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-2xl font-bold cursor-move hover:bg-primary/90 transition-colors select-none"
                  >
                    {letter.toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Progress Stats */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Attempts</span>
                  <span>{attempts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span>{attempts > 0 ? Math.round((score / (attempts * 10)) * 100) : 0}%</span>
                </div>
              </div>

              {/* Achievements */}
              {isComplete && (
                <Card className="mt-4 bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <span className="text-4xl block mb-2">🏆</span>
                    <h4 className="font-semibold text-green-800">Well Done!</h4>
                    <p className="text-green-700 text-sm">You spelled "{currentWordData.word}" correctly!</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
