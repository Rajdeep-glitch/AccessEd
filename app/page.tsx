"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import StoryMode from "@/components/story-mode"
import AILearningPath from "@/components/ai-learning-path"
import RhymeRadarGame from "@/components/rhyme-radar-game"
import MemoryBoostGame from "@/components/memory-boost-game"
import VoiceReadingAssessment from "@/components/voice-reading-assessment"
import ParentTeacherDashboard from "@/components/parent-teacher-dashboard"
import AIExamPrep from "@/components/ai-exam-prep"
import AccessibilityToolbar from "@/components/accessibility-toolbar"
import SpellingBuilder from "@/components/spelling-builder"
import ReadingFluencyTracker from "@/components/reading-fluency-tracker"
import FontSwitcher from "@/components/font-switcher"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function DyslexiaLearningApp() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({ name: "Alex", type: "student" })

  // Sync auth state with localStorage (set by /auth/signin)
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("isAuthenticated")
      const storedUser = localStorage.getItem("user")
      if (storedAuth === "true" || storedUser) {
        setIsAuthenticated(true)
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      // noop for demo
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-3xl">🧠</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-balance">AccessEd</h1>
              <p className="text-muted-foreground">Empowering Every Learner</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-lg text-balance mb-6">
              Join thousands of learners on their journey to reading success with our AI-powered dyslexia learning
              platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/signup" className="flex-1">
                <Button className="w-full h-12 text-base font-medium">Get Started Free</Button>
              </Link>
              <Link href="/auth/signin" className="flex-1">
                <Button variant="outline" className="w-full h-12 text-base font-medium bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              onClick={() => setIsAuthenticated(true)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Continue as Demo User
            </Button>
          </div>

          <div className="absolute top-4 right-4">
            <FontSwitcher />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AccessibilityToolbar />

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-balance">AccessEd</h1>
              <p className="text-sm text-muted-foreground">Empowering Every Learner</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant={activeSection === "dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={activeSection === "story" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("story")}
            >
              Story Mode
            </Button>
            <Button
              variant={activeSection === "ai-coach" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("ai-coach")}
            >
              AI Coach
            </Button>
            <Button
              variant={activeSection === "games" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("games")}
            >
              Games
            </Button>
            <Button
              variant={activeSection === "voice-reading" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("voice-reading")}
            >
              Voice Reading
            </Button>
            <Button
              variant={activeSection === "parent" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("parent")}
            >
              Parent Portal
            </Button>
            <FontSwitcher />
            <Button variant="outline" size="sm">
              {user.name}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)}>
              Sign Out
            </Button>
            <Button
              variant={activeSection === "ai-exam-prep" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("ai-exam-prep")}
            >
              Exam Prep
            </Button>
          </nav>
        </div>
      </header>

      {activeSection === "story" && <StoryMode />}
      {activeSection === "ai-coach" && <AILearningPath />}
      {activeSection === "voice-reading" && <VoiceReadingAssessment />}
      {activeSection === "parent" && <ParentTeacherDashboard />}
      {activeSection === "ai-exam-prep" && <AIExamPrep />}
      {activeSection === "spelling-builder" && <SpellingBuilder />}
      {activeSection === "reading-fluency" && <ReadingFluencyTracker />}

      {activeSection === "games" && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-balance">Learning Games</h2>
            <p className="text-muted-foreground">Fun games to boost your reading and memory skills</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setActiveSection("rhyme-radar")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Rhyme Radar</CardTitle>
                    <CardDescription>Find the word that doesn't rhyme - against the clock!</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>High Score: 85</Badge>
                  <Badge variant="outline">Level 4</Badge>
                </div>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <span className="mr-2">▶️</span>
                  Play Rhyme Radar
                </Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setActiveSection("memory-boost")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🧩</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Memory Boost</CardTitle>
                    <CardDescription>Match letter pairs to strengthen your memory skills</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>Best Time: 1:23</Badge>
                  <Badge variant="outline">Level 3</Badge>
                </div>
                <Button className="w-full bg-chart-3 text-white hover:bg-chart-3/90">
                  <span className="mr-2">▶️</span>
                  Play Memory Boost
                </Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setActiveSection("spelling-builder")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔤</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Spelling Builder</CardTitle>
                    <CardDescription>Drag and drop letters to build words with audio support</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>Words Built: 23</Badge>
                  <Badge variant="outline">Level 2</Badge>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <span className="mr-2">▶️</span>
                  Build Words
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {activeSection === "rhyme-radar" && <RhymeRadarGame />}
      {activeSection === "memory-boost" && <MemoryBoostGame />}

      {activeSection === "dashboard" && (
        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-balance">Welcome back, {user.name}!</h2>
                <p className="text-sm text-muted-foreground">Ready for today's learning adventure?</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white border-primary/30 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Daily Streak</p>
                      <p className="text-2xl font-bold text-primary">7 days</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">🏆</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-secondary/30 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Words Learned</p>
                      <p className="text-2xl font-bold text-secondary">142</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">🎯</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-accent/30 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Time Today</p>
                      <p className="text-2xl font-bold text-accent">25 min</p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">🕒</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Learning Activities */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Activities */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-balance">Learning Activities</h3>

              {/* Story Mode */}
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("story")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📖</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Story Mode Learning</CardTitle>
                      <CardDescription>Interactive stories with comprehension questions</CardDescription>
                    </div>
                    <Button size="sm">
                      <span className="mr-2">▶️</span>
                      Start
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Chapter 3</Badge>
                    <Badge variant="outline">Audio Available</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">65% Complete</p>
                </CardContent>
              </Card>

              {/* AI Learning Path */}
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("ai-coach")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🧠</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">AI Learning Coach</CardTitle>
                      <CardDescription>Personalized exercises for your needs</CardDescription>
                    </div>
                    <Button size="sm" variant="secondary">
                      Continue
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Today's Focus: Spelling Patterns</span>
                      <span className="text-muted-foreground">10 min</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("spelling-builder")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🔤</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Spelling Builder</CardTitle>
                      <CardDescription>Build words with drag & drop letters</CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      <span className="mr-2">▶️</span>
                      Build
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Voice Reading */}
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("voice-reading")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🎤</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Voice Reading Practice</CardTitle>
                      <CardDescription>Read aloud and get gentle feedback</CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      <span className="mr-2">🎧</span>
                      Practice
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Games & Progress */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-balance">Games & Progress</h3>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("reading-fluency")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📈</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Reading Fluency</CardTitle>
                      <CardDescription>Track your reading speed progress</CardDescription>
                    </div>
                    <Button size="sm" className="bg-chart-1 text-white hover:bg-chart-1/90">
                      View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge>85 WPM</Badge>
                    <Badge variant="outline">+3 this week</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Rhyme Radar Game */}
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("rhyme-radar")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🎯</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Rhyme Radar</CardTitle>
                      <CardDescription>Find the word that doesn't rhyme!</CardDescription>
                    </div>
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Play
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge>High Score: 85</Badge>
                    <Badge variant="outline">Level 4</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Memory Boost */}
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("memory-boost")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🧩</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Memory Boost</CardTitle>
                      <CardDescription>Fun memory games with letters</CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      Play
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reading Speed</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Comprehension</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Spelling</span>
                        <span>62%</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-balance">Quick Actions</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <span className="text-xl">👥</span>
                <span>Peer Community</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => setActiveSection("ai-exam-prep")}
              >
                <span className="text-xl">📖</span>
                <span>Exam Prep</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => setActiveSection("ai-coach")}
              >
                <span className="text-xl">🧠</span>
                <span>AI Coach</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => setActiveSection("games")}
              >
                <span className="text-xl">🏆</span>
                <span>Games</span>
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
