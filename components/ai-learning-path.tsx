"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Target, Clock, Star, CheckCircle, ArrowRight, Lightbulb, TrendingUp, BookOpen, Zap } from "lucide-react"

interface LearningArea {
  id: string
  name: string
  level: number
  progress: number
  weakness: boolean
  exercises: Exercise[]
}

interface Exercise {
  id: string
  title: string
  type: "spelling" | "phonics" | "comprehension" | "vocabulary"
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: number
  completed: boolean
  score?: number
}

interface AIRecommendation {
  type: "focus" | "strength" | "suggestion"
  title: string
  description: string
  action?: string
}

const learningAreas: LearningArea[] = [
  {
    id: "spelling",
    name: "Spelling Patterns",
    level: 3,
    progress: 45,
    weakness: true,
    exercises: [
      { id: "sp1", title: "Silent E Words", type: "spelling", difficulty: "easy", estimatedTime: 8, completed: false },
      {
        id: "sp2",
        title: "Double Consonants",
        type: "spelling",
        difficulty: "medium",
        estimatedTime: 12,
        completed: false,
      },
      { id: "sp3", title: "Vowel Teams", type: "spelling", difficulty: "medium", estimatedTime: 10, completed: false },
    ],
  },
  {
    id: "phonics",
    name: "Phonics & Sounds",
    level: 2,
    progress: 62,
    weakness: true,
    exercises: [
      {
        id: "ph1",
        title: "Blending Sounds",
        type: "phonics",
        difficulty: "easy",
        estimatedTime: 6,
        completed: true,
        score: 85,
      },
      {
        id: "ph2",
        title: "Rhyming Patterns",
        type: "phonics",
        difficulty: "medium",
        estimatedTime: 8,
        completed: false,
      },
      {
        id: "ph3",
        title: "Sound Segmentation",
        type: "phonics",
        difficulty: "hard",
        estimatedTime: 15,
        completed: false,
      },
    ],
  },
  {
    id: "comprehension",
    name: "Reading Comprehension",
    level: 4,
    progress: 78,
    weakness: false,
    exercises: [
      {
        id: "rc1",
        title: "Main Ideas",
        type: "comprehension",
        difficulty: "medium",
        estimatedTime: 10,
        completed: true,
        score: 92,
      },
      {
        id: "rc2",
        title: "Character Analysis",
        type: "comprehension",
        difficulty: "medium",
        estimatedTime: 12,
        completed: true,
        score: 88,
      },
      {
        id: "rc3",
        title: "Inference Skills",
        type: "comprehension",
        difficulty: "hard",
        estimatedTime: 15,
        completed: false,
      },
    ],
  },
  {
    id: "vocabulary",
    name: "Vocabulary Building",
    level: 3,
    progress: 71,
    weakness: false,
    exercises: [
      {
        id: "vb1",
        title: "Context Clues",
        type: "vocabulary",
        difficulty: "medium",
        estimatedTime: 8,
        completed: true,
        score: 79,
      },
      { id: "vb2", title: "Word Families", type: "vocabulary", difficulty: "easy", estimatedTime: 6, completed: false },
      {
        id: "vb3",
        title: "Synonyms & Antonyms",
        type: "vocabulary",
        difficulty: "medium",
        estimatedTime: 10,
        completed: false,
      },
    ],
  },
]

const aiRecommendations: AIRecommendation[] = [
  {
    type: "focus",
    title: "Priority: Spelling Patterns",
    description: "Focus on silent E and double consonant rules. Practice 10 minutes daily for best results.",
    action: "Start Exercise",
  },
  {
    type: "strength",
    title: "Excellent Comprehension",
    description: "Your reading comprehension skills are above grade level. Keep up the great work!",
  },
  {
    type: "suggestion",
    title: "Multisensory Learning",
    description: "Try using finger tracing while spelling words to engage multiple senses.",
    action: "Learn More",
  },
]

export default function AILearningPath() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [dailyGoal, setDailyGoal] = useState(15) // minutes
  const [todayProgress, setTodayProgress] = useState(8)

  const weakAreas = learningAreas.filter((area) => area.weakness)
  const strongAreas = learningAreas.filter((area) => !area.weakness)

  const startExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise)
  }

  const completeExercise = (score: number) => {
    if (currentExercise) {
      // Update exercise completion
      const updatedAreas = learningAreas.map((area) => ({
        ...area,
        exercises: area.exercises.map((ex) => (ex.id === currentExercise.id ? { ...ex, completed: true, score } : ex)),
      }))

      setTodayProgress((prev) => prev + currentExercise.estimatedTime)
      setCurrentExercise(null)
    }
  }

  if (currentExercise) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentExercise(null)}>
              ← Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">{currentExercise.title}</h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {currentExercise.type} • {currentExercise.difficulty} • {currentExercise.estimatedTime} min
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Exercise: {currentExercise.title}</CardTitle>
            <CardDescription className="text-center">
              Complete the following {currentExercise.type} exercise
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-lg font-medium mb-4 text-balance">
              Interactive {currentExercise.type} exercise would load here
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-balance">
              This would contain the actual exercise content, questions, and interactive elements tailored to the
              student's learning needs.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => completeExercise(85)}>Complete Exercise</Button>
              <Button variant="outline" onClick={() => setCurrentExercise(null)}>
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">AI Learning Coach</h1>
            <p className="text-muted-foreground">Personalized learning path based on your progress</p>
          </div>
        </div>

        {/* Daily Progress */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-balance">Today's Learning Goal</h3>
                <p className="text-sm text-muted-foreground">
                  {todayProgress} of {dailyGoal} minutes completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-secondary">{todayProgress}m</span>
              </div>
            </div>
            <Progress value={(todayProgress / dailyGoal) * 100} className="h-3" />
            {todayProgress >= dailyGoal && (
              <div className="flex items-center gap-2 mt-3 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Daily goal achieved! Great job!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* AI Recommendations */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-balance">AI Recommendations</h2>
          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <Card
                key={index}
                className={`${
                  rec.type === "focus"
                    ? "bg-primary/5 border-primary/20"
                    : rec.type === "strength"
                      ? "bg-green-50 border-green-200"
                      : "bg-secondary/5 border-secondary/20"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        rec.type === "focus"
                          ? "bg-primary/10"
                          : rec.type === "strength"
                            ? "bg-green-100"
                            : "bg-secondary/10"
                      }`}
                    >
                      {rec.type === "focus" && <Target className="w-4 h-4 text-primary" />}
                      {rec.type === "strength" && <Star className="w-4 h-4 text-green-600" />}
                      {rec.type === "suggestion" && <Lightbulb className="w-4 h-4 text-secondary" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1 text-balance">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground text-balance">{rec.description}</p>
                      {rec.action && (
                        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs bg-transparent">
                          {rec.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Areas */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-balance">Learning Areas</h2>

          {/* Areas Needing Focus */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-balance">
              <TrendingUp className="w-5 h-5 text-primary" />
              Priority Areas
            </h3>
            <div className="grid gap-4">
              {weakAreas.map((area) => (
                <Card key={area.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-balance">{area.name}</CardTitle>
                        <CardDescription>Level {area.level} • Needs attention</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        Priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{area.progress}%</span>
                      </div>
                      <Progress value={area.progress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      {area.exercises.slice(0, 2).map((exercise) => (
                        <div key={exercise.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                exercise.completed ? "bg-green-100" : "bg-secondary/10"
                              }`}
                            >
                              {exercise.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Target className="w-4 h-4 text-secondary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-balance">{exercise.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {exercise.estimatedTime} min • {exercise.difficulty}
                                {exercise.completed && exercise.score && ` • Score: ${exercise.score}%`}
                              </p>
                            </div>
                          </div>
                          {!exercise.completed && (
                            <Button size="sm" onClick={() => startExercise(exercise)}>
                              Start
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Strong Areas */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-balance">
              <Star className="w-5 h-5 text-green-600" />
              Strong Areas
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {strongAreas.map((area) => (
                <Card key={area.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base text-balance">{area.name}</CardTitle>
                        <CardDescription>Level {area.level} • Doing well</CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        Strong
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{area.progress}%</span>
                      </div>
                      <Progress value={area.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {area.exercises.filter((ex) => ex.completed).length} of {area.exercises.length} completed
                      </div>
                      <Button size="sm" variant="outline">
                        Continue
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-balance">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <Zap className="w-5 h-5" />
            <span className="text-sm">Quick Practice</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <Target className="w-5 h-5" />
            <span className="text-sm">Skill Assessment</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <Brain className="w-5 h-5" />
            <span className="text-sm">AI Tutor Chat</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Progress Report</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
