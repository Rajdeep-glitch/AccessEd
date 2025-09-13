"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  FileText,
  Zap,
  Trophy,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExamQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
}

interface StudyPlan {
  topic: string
  duration: string
  activities: string[]
  priority: "high" | "medium" | "low"
}

export default function ExamPrep() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("practice")
  const [selectedSubject, setSelectedSubject] = useState("english")
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [studyText, setStudyText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenTest, setIsGenTest] = useState(false)
  const [genType, setGenType] = useState("questions")
  const [genDifficulty, setGenDifficulty] = useState("medium")
  const [generatedText, setGeneratedText] = useState("")

  // Mock exam questions
  const initialQuestions: ExamQuestion[] = [
    {
      id: "1",
      question: "Which word has the same sound as 'cat' at the beginning?",
      options: ["dog", "car", "bat", "sun"],
      correctAnswer: 1,
      explanation: "Both 'cat' and 'car' start with the /k/ sound, even though they're spelled differently.",
      difficulty: "easy",
      topic: "Phonics",
    },
    {
      id: "2",
      question: "What is the main idea of a story about a brave knight saving a village?",
      options: ["Knights wear armor", "Villages are small", "Being brave helps others", "Horses are fast"],
      correctAnswer: 2,
      explanation: "The main idea focuses on the central theme - how the knight's bravery helped save the village.",
      difficulty: "medium",
      topic: "Reading Comprehension",
    },
    {
      id: "3",
      question: "Which sentence uses the correct spelling?",
      options: ["I recieved a gift", "I received a gift", "I recevied a gift", "I receved a gift"],
      correctAnswer: 1,
      explanation: "Remember: 'i' before 'e' except after 'c' - but 'receive' is an exception to this rule.",
      difficulty: "hard",
      topic: "Spelling",
    },
  ]
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>(initialQuestions)

  // Mock study plans
  const studyPlans: StudyPlan[] = [
    {
      topic: "Reading Comprehension",
      duration: "15 min",
      activities: ["Read short passage", "Answer 3 questions", "Review vocabulary"],
      priority: "high",
    },
    {
      topic: "Spelling Patterns",
      duration: "10 min",
      activities: ["Practice 'ie/ei' words", "Word building exercise", "Audio spelling test"],
      priority: "medium",
    },
    {
      topic: "Phonics Review",
      duration: "12 min",
      activities: ["Sound matching game", "Rhyming practice", "Syllable counting"],
      priority: "low",
    },
  ]

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowExplanation(true)
    if (answerIndex === examQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  async function callGemini(messages: { role: 'user' | 'model'; content: string }[]) {
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
      const data = await resp.json()
      return data?.text || ''
    } catch (e: any) {
      return `Error: ${e?.message || 'failed to reach service'}`
    }
  }

  const generateStudyMaterial = async () => {
    if (!studyText.trim()) {
      toast({ title: 'Enter a topic first', description: 'Please add a topic or keywords to generate content.' })
      return
    }
    setIsGenerating(true)
    setGeneratedText('')

    const prompt = `Generate ${genType} for subject ${selectedSubject} with difficulty ${genDifficulty}. Topic/keywords: "${studyText}". Use concise, student-friendly wording.`
    const text = await callGemini([{ role: 'user', content: prompt }])

    setGeneratedText(text)
    setIsGenerating(false)
  }

  const generateNewTest = async () => {
    setIsGenTest(true)
    setShowExplanation(false)
    setSelectedAnswer(null)
    setCurrentQuestion(0)
    setScore(0)

    const prompt = `Create 5 multiple-choice questions as JSON array with fields id, question, options (4), correctAnswer (index 0-3), explanation, difficulty (easy|medium|hard), topic. Subject: ${selectedSubject}. Difficulty bias: ${selectedDifficulty}. Keep language simple.`

    const text = await callGemini([{ role: 'user', content: prompt }])

    // Try to parse JSON from the model output; fallback to initialQuestions
    try {
      const jsonMatch = text.match(/\[([\s\S]*)\]/)
      const parsed: ExamQuestion[] = JSON.parse(jsonMatch ? jsonMatch[0] : text)
      if (Array.isArray(parsed) && parsed.length) {
        setExamQuestions(parsed)
      } else {
        setExamQuestions(initialQuestions)
      }
    } catch {
      setExamQuestions(initialQuestions)
    }

    setIsGenTest(false)
    toast({ title: 'New test ready', description: `Subject: ${selectedSubject}` })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-balance">Exam Preparation</h2>
        <p className="text-muted-foreground">Smart study plans and practice tests tailored for you</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={activeTab === "practice" ? "default" : "outline"}
          onClick={() => setActiveTab("practice")}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Practice Tests
        </Button>
        <Button
          variant={activeTab === "study-plan" ? "default" : "outline"}
          onClick={() => setActiveTab("study-plan")}
          className="flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          Study Plans
        </Button>
        <Button
          variant={activeTab === "generator" ? "default" : "outline"}
          onClick={() => setActiveTab("generator")}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Content Generator
        </Button>
        <Button
          variant={activeTab === "progress" ? "default" : "outline"}
          onClick={() => setActiveTab("progress")}
          className="flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          Progress Tracking
        </Button>
      </div>

      {/* Practice Tests Tab */}
      {activeTab === "practice" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Practice Question {currentQuestion + 1} of {examQuestions.length}
                    </CardTitle>
                    <CardDescription>
                      Subject: {selectedSubject} • Difficulty: {examQuestions[currentQuestion].difficulty}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{examQuestions[currentQuestion].topic}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg font-medium text-balance">{examQuestions[currentQuestion].question}</div>

                <div className="space-y-3">
                  {examQuestions[currentQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedAnswer === index
                          ? index === examQuestions[currentQuestion].correctAnswer
                            ? "default"
                            : "destructive"
                          : "outline"
                      }
                      className="w-full justify-start text-left h-auto p-4"
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showExplanation}
                    >
                      <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
                      {option}
                      {showExplanation && index === examQuestions[currentQuestion].correctAnswer && (
                        <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
                      )}
                      {showExplanation &&
                        selectedAnswer === index &&
                        index !== examQuestions[currentQuestion].correctAnswer && (
                          <AlertCircle className="w-5 h-5 ml-auto text-red-600" />
                        )}
                    </Button>
                  ))}
                </div>

                {showExplanation && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-2">Explanation</h4>
                          <p className="text-sm text-muted-foreground">{examQuestions[currentQuestion].explanation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {showExplanation && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Score: {score}/{currentQuestion + 1}
                    </div>
                    <Button onClick={nextQuestion} disabled={currentQuestion >= examQuestions.length - 1}>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="social">Social Studies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" variant="outline" onClick={generateNewTest} disabled={isGenTest}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isGenTest ? 'Generating...' : 'Generate New Test'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Current Score</span>
                  <span className="font-semibold">
                    {score}/{currentQuestion + 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Accuracy</span>
                  <span className="font-semibold">
                    {currentQuestion > 0 ? Math.round((score / (currentQuestion + 1)) * 100) : 0}%
                  </span>
                </div>
                <Progress value={currentQuestion > 0 ? (score / (currentQuestion + 1)) * 100 : 0} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AI Study Plans Tab */}
      {activeTab === "study-plan" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Today's Study Plan
                </CardTitle>
                <CardDescription>Personalized based on your learning patterns and weak areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studyPlans.map((plan, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{plan.topic}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={plan.priority === "high" ? "default" : "outline"}>{plan.priority}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {plan.duration}
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {plan.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => {
                          setActiveTab('generator')
                          setStudyText(plan.topic)
                          toast({ title: 'Session started', description: `Loaded topic: ${plan.topic}` })
                        }}
                      >
                        Start Session
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Focus Areas</CardTitle>
                <CardDescription>Identified areas that need attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spelling Patterns</span>
                      <span className="text-red-600">Needs Work</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reading Fluency</span>
                      <span className="text-yellow-600">Improving</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Comprehension</span>
                      <span className="text-green-600">Strong</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Focus on 'ie/ei' patterns</p>
                    <p className="text-muted-foreground">You've struggled with these in recent exercises</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Practice reading aloud daily</p>
                    <p className="text-muted-foreground">10 minutes of voice practice will improve fluency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Content Generator Tab */}
      {activeTab === "generator" && (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Content Generator
              </CardTitle>
              <CardDescription>
                Generate personalized study materials, practice questions, and explanations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Type</label>
                  <Select value={genType} onValueChange={setGenType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="questions">Practice Questions</SelectItem>
                      <SelectItem value="explanations">Concept Explanations</SelectItem>
                      <SelectItem value="stories">Reading Stories</SelectItem>
                      <SelectItem value="exercises">Spelling Exercises</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                  <Select value={genDifficulty} onValueChange={setGenDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="adaptive">Adaptive (chooses)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Topic or Keywords</label>
                <Textarea
                  placeholder="Enter the topic you want to study or specific keywords..."
                  value={studyText}
                  onChange={(e) => setStudyText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={generateStudyMaterial} disabled={isGenerating || !studyText.trim()} className="w-full">
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Study Material
                  </>
                )}
              </Button>

              {isGenerating && (
                <Card className="bg-muted/50">
                  <CardContent className="p-6 text-center">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                      <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">personalized content for you...</p>
                  </CardContent>
                </Card>
              )}

              {!isGenerating && generatedText && (
                <Card className="bg-muted/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Result</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(generatedText)
                            toast({ title: 'Copied to clipboard' })
                          } catch {}
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{generatedText}</div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Tracking Tab */}
      {activeTab === "progress" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Exam Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Accuracy</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Speed Improvement</span>
                    <span>+15%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consistency</span>
                    <span>82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
                <div className="text-sm">
                  <p className="font-medium">Perfect Score!</p>
                  <p className="text-muted-foreground">Scored 100% on spelling test</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <p className="font-medium">Speed Reader</p>
                  <p className="text-muted-foreground">Improved reading speed by 20%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
                <div className="text-sm">
                  <p className="font-medium">Consistent Learner</p>
                  <p className="text-muted-foreground">7-day study streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
