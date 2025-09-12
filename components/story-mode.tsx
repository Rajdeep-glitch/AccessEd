"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface Story {
  id: string
  title: string
  chapter: number
  content: string[]
  questions: {
    question: string
    options: string[]
    correct: number
    explanation: string
  }[]
  audioUrl?: string
  difficulty: "easy" | "medium" | "hard"
}

const sampleStory: Story = {
  id: "magic-garden",
  title: "The Magic Garden",
  chapter: 3,
  content: [
    "Once upon a time, there was a little girl named Maya who loved to explore.",
    "One sunny morning, Maya discovered a hidden gate behind her grandmother's house.",
    "The gate was covered with beautiful, colorful flowers that seemed to glow in the sunlight.",
    "When Maya touched the gate, it slowly opened with a gentle creak.",
    "Inside, she found the most amazing garden she had ever seen!",
    "The flowers were singing soft melodies, and the butterflies danced in the air.",
    "Maya realized she had found a truly magical place.",
  ],
  questions: [
    {
      question: "Who is the main character in the story?",
      options: ["Maya", "Grandmother", "A butterfly", "A flower"],
      correct: 0,
      explanation: "Maya is the little girl who discovers the magic garden.",
    },
    {
      question: "Where did Maya find the hidden gate?",
      options: ["In the park", "Behind her house", "Behind grandmother's house", "In the forest"],
      correct: 2,
      explanation: "The gate was hidden behind her grandmother's house.",
    },
    {
      question: "What made the garden special?",
      options: ["It was very big", "The flowers could sing", "It had many trees", "It was very old"],
      correct: 1,
      explanation: "The flowers were singing soft melodies, making it a magical garden.",
    },
  ],
  difficulty: "easy",
}

export default function StoryMode() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState<boolean[]>([])
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [readingSpeed, setReadingSpeed] = useState(1)

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setCompletedQuestions(new Array(sampleStory.questions.length).fill(false))
  }, [])

  const speakText = (text: string) => {
    if (!isAudioEnabled || !window.speechSynthesis) return

    // Stop any current speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = readingSpeed
    utterance.pitch = 1.1
    utterance.volume = 0.8

    // Use a child-friendly voice if available
    const voices = window.speechSynthesis.getVoices()
    const childVoice = voices.find(
      (voice) => voice.name.includes("Female") || voice.name.includes("Woman") || voice.lang.includes("en"),
    )
    if (childVoice) utterance.voice = childVoice

    speechRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const toggleReading = () => {
    if (isReading) {
      window.speechSynthesis.cancel()
      setIsReading(false)
    } else {
      speakText(sampleStory.content[currentPage])
      setIsReading(true)
    }
  }

  const nextPage = () => {
    if (currentPage < sampleStory.content.length - 1) {
      setCurrentPage(currentPage + 1)
      setIsReading(false)
      window.speechSynthesis.cancel()
    } else {
      setShowQuestions(true)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      setIsReading(false)
      window.speechSynthesis.cancel()
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowExplanation(true)

    const newCompleted = [...completedQuestions]
    newCompleted[currentQuestion] = true
    setCompletedQuestions(newCompleted)

    if (answerIndex === sampleStory.questions[currentQuestion].correct) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < sampleStory.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const restartStory = () => {
    setCurrentPage(0)
    setShowQuestions(false)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setCompletedQuestions(new Array(sampleStory.questions.length).fill(false))
    setIsReading(false)
    window.speechSynthesis.cancel()
  }

  const progress = showQuestions
    ? ((currentQuestion + 1) / sampleStory.questions.length) * 100
    : ((currentPage + 1) / sampleStory.content.length) * 100

  if (showQuestions) {
    const question = sampleStory.questions[currentQuestion]
    const isCorrect = selectedAnswer === question.correct
    const allQuestionsCompleted = currentQuestion === sampleStory.questions.length - 1 && showExplanation

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">{sampleStory.title}</h1>
                <p className="text-muted-foreground">Comprehension Questions</p>
              </div>
            </div>
            <Badge variant="secondary">Chapter {sampleStory.chapter}</Badge>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestion + 1} of {sampleStory.questions.length}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-balance">{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    selectedAnswer === null
                      ? "outline"
                      : selectedAnswer === index
                        ? isCorrect
                          ? "default"
                          : "destructive"
                        : index === question.correct
                          ? "default"
                          : "outline"
                  }
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => !showExplanation && handleAnswerSelect(index)}
                  disabled={showExplanation}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-balance">{option}</span>
                    {showExplanation && index === question.correct && <span className="ml-auto text-xl">✅</span>}
                    {showExplanation && selectedAnswer === index && index !== question.correct && (
                      <span className="ml-auto text-xl">❌</span>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {showExplanation && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? <span className="text-xl">✅</span> : <span className="text-xl">❌</span>}
                  <span className="font-medium">{isCorrect ? "Correct!" : "Not quite right"}</span>
                </div>
                <p className="text-muted-foreground text-balance">{question.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={restartStory}>
            <span className="mr-2">🔄</span>
            Restart Story
          </Button>

          {allQuestionsCompleted ? (
            <Card className="p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xl font-bold">Story Complete!</span>
                </div>
                <p className="text-muted-foreground">
                  Score: {score} out of {sampleStory.questions.length}
                </p>
              </div>
            </Card>
          ) : (
            showExplanation && (
              <Button onClick={nextQuestion}>
                Next Question
                <span className="ml-2">➡️</span>
              </Button>
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">📖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">{sampleStory.title}</h1>
              <p className="text-muted-foreground">Interactive Story Reading</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Chapter {sampleStory.chapter}</Badge>
            <Badge variant="outline" className="capitalize">
              {sampleStory.difficulty}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          Page {currentPage + 1} of {sampleStory.content.length}
        </p>
      </div>

      {/* Story Content */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <div className="text-6xl">🌸</div>
            </div>
          </div>

          <div className="text-lg leading-relaxed text-center max-w-2xl mx-auto">
            <p className="text-balance">{sampleStory.content[currentPage]}</p>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsAudioEnabled(!isAudioEnabled)}>
            {isAudioEnabled ? <span className="text-lg">🔊</span> : <span className="text-lg">🔇</span>}
          </Button>

          <Button variant={isReading ? "default" : "outline"} onClick={toggleReading} disabled={!isAudioEnabled}>
            {isReading ? <span className="mr-2">⏸️</span> : <span className="mr-2">▶️</span>}
            {isReading ? "Pause" : "Read Aloud"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Speed:</span>
            <Button variant="outline" size="sm" onClick={() => setReadingSpeed(Math.max(0.5, readingSpeed - 0.25))}>
              -
            </Button>
            <span className="text-sm w-8 text-center">{readingSpeed}x</span>
            <Button variant="outline" size="sm" onClick={() => setReadingSpeed(Math.min(2, readingSpeed + 0.25))}>
              +
            </Button>
          </div>
        </div>

        <Button variant="outline" onClick={restartStory}>
          <span className="mr-2">🔄</span>
          Restart
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevPage} disabled={currentPage === 0}>
          <span className="mr-2">⬅️</span>
          Previous
        </Button>

        <Button onClick={nextPage}>
          {currentPage === sampleStory.content.length - 1 ? "Start Questions" : "Next"}
          <span className="ml-2">➡️</span>
        </Button>
      </div>
    </div>
  )
}
