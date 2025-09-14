"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import StoryMode from "@/components/story-mode"
import RhymeRadarGame from "@/components/rhyme-radar-game"
import MemoryBoostGame from "@/components/memory-boost-game"
import VoiceReadingAssessment from "@/components/voice-reading-assessment"
import ParentTeacherDashboard from "@/components/parent-teacher-dashboard"
import AIExamPrep from "@/components/ai-exam-prep"
import AccessibilityToolbar from "@/components/accessibility-toolbar"
import SpellingBuilder from "@/components/spelling-builder"
import ReadingFluencyTracker from "@/components/reading-fluency-tracker"
import { useState, useEffect } from "react"
import Link from "next/link"
import PeerCommunity from "@/components/peer-community"
import SiteNavbar from "@/components/site-navbar"
import AIContentGenerator from "@/components/ai-content-generator"
import FontSwitcher from "@/components/font-switcher"
import SimonSays from "@/components/simon-says"
import SoundMatch from "@/components/sound-match"
import StoryScramble from "@/components/story-scramble"
import AIReadingCoachPro from "@/components/ai-reading-coach-pro"
import DyslexiaLens from "@/components/dyslexia-lens"

export default function DyslexiaLearningApp() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({ name: "Alex", type: "student" })
  const [simonBest, setSimonBest] = useState<number | null>(null)
  const [simonLevel, setSimonLevel] = useState<number | null>(null)
  // New games: Sound Match & Story Scramble preview stats
  const [soundBest, setSoundBest] = useState<number | null>(null)
  const [soundLevel, setSoundLevel] = useState<number | null>(null)
  const [scrambleCompleted, setScrambleCompleted] = useState<number | null>(null)
  const [scrambleLevel, setScrambleLevel] = useState<number | null>(null)

  // Simple history stack for back navigation across sections
  const [history, setHistory] = useState<string[]>([])
  const canGoBack = history.length > 0

  const navigate = (next: string) => {
    setHistory((prev) => (prev[prev.length - 1] === activeSection ? prev : [...prev, activeSection]))
    setActiveSection(next)
  }

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const copy = [...prev]
      const last = copy.pop() as string
      setActiveSection(last)
      return copy
    })
  }

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
      // Load Simon Says stats for the card preview
      const bs = parseInt(localStorage.getItem("simonSays.bestScore") || "", 10)
      const lv = parseInt(localStorage.getItem("simonSays.level") || "", 10)
      if (!Number.isNaN(bs)) setSimonBest(bs)
      if (!Number.isNaN(lv)) setSimonLevel(lv)

      // Load Sound Match preview stats
      const smb = parseInt(localStorage.getItem("soundMatch.bestScore") || "", 10)
      const sml = parseInt(localStorage.getItem("soundMatch.level") || "", 10)
      if (!Number.isNaN(smb)) setSoundBest(smb)
      if (!Number.isNaN(sml)) setSoundLevel(sml)

      // Load Story Scramble preview stats
      const ssc = parseInt(localStorage.getItem("storyScramble.completed") || "", 10)
      const ssl = parseInt(localStorage.getItem("storyScramble.level") || "", 10)
      if (!Number.isNaN(ssc)) setScrambleCompleted(ssc)
      if (!Number.isNaN(ssl)) setScrambleLevel(ssl)
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
      <SiteNavbar
        activeSection={activeSection as any}
        onNavigate={(key) => navigate(key)}
        user={user}
        onSignOut={() => setIsAuthenticated(false)}
        onBack={goBack}
        canGoBack={canGoBack}
      />

      {activeSection === "story" && <StoryMode />}

      {activeSection === "voice-reading" && <VoiceReadingAssessment />}
      {activeSection === "parent" && <ParentTeacherDashboard />}
      {activeSection === "ai-exam-prep" && <AIExamPrep />}
      {activeSection === "spelling-builder" && <SpellingBuilder />}
      {activeSection === "reading-fluency" && <ReadingFluencyTracker />}
      {activeSection === "peer-community" && <PeerCommunity />}
      {activeSection === "content-generator" && <AIContentGenerator />}
      {activeSection === "ai-coach" && (
        <div className="container mx-auto px-4 py-8">
          <div className="h-[80vh] border rounded-lg overflow-hidden">
            <iframe
              src={process.env.NEXT_PUBLIC_AI_COACH_URL || "/ai-coach/index.html"}
              className="w-full h-full"
              title="Doc Summarizer"
            />
          </div>
        </div>
      )}

      {activeSection === "ai-coach-pro" && (
        <div className="container mx-auto px-4 py-8">
          <AIReadingCoachPro />
        </div>
      )}

      {activeSection === "dyslexia-lens" && (
        <div className="container mx-auto px-4 py-8">
          <DyslexiaLens />
        </div>
      )}

      {activeSection === "settings" && (
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI</CardTitle>
                <CardDescription>Test AI generation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => navigate("content-generator")}>Open Content Generator</Button>
                  <Button variant="secondary" onClick={() => navigate("ai-coach")}>Open Doc Summarizer</Button>
                  <Button variant="outline" onClick={() => navigate("ai-coach-pro")}>Open Coach Pro</Button>
                  <Button variant="outline" onClick={() => navigate("dyslexia-lens")}>Open Dyslexia Lens</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSection === "games" && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-balance">Learning Games</h2>
            <p className="text-muted-foreground">Fun games to boost your reading and memory skills</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* NEW: Sound Match */}
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate("sound-match")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔊</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Sound Match</CardTitle>
                    <CardDescription>
                      Hear a sound — can you match it to the correct letter, word, or picture?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>High Score: {soundBest ?? "—"}</Badge>
                  <Badge variant="outline">Level: {soundLevel ?? "—"}</Badge>
                </div>
                <Button className="w-full bg-indigo-500 text-white hover:bg-indigo-500/90">
                  <span className="mr-2">▶️</span>
                  Play Sound Match
                </Button>
              </CardContent>
            </Card>

            {/* NEW: Story Scramble */}
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate("story-scramble")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📖</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Story Scramble</CardTitle>
                    <CardDescription>
                      A short story is broken into jumbled sentences. Arrange them in the right order!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>Stories Completed: {scrambleCompleted ?? "—"}</Badge>
                  <Badge variant="outline">Level: {scrambleLevel ?? "—"}</Badge>
                </div>
                <Button className="w-full bg-amber-500 text-white hover:bg-amber-500/90">
                  <span className="mr-2">▶️</span>
                  Play Story Scramble
                </Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate("rhyme-radar")}
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
              onClick={() => navigate("memory-boost")}
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
              onClick={() => navigate("spelling-builder")}
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

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate("simon-says")}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Simon Says</CardTitle>
                    <CardDescription>
                      🎵 Simon Says — Listen and watch carefully — repeat the sequence of colors, sounds, or words in the
                      correct order! Each round gets faster and longer, testing focus and memory. Best Score: [dynamic tracking]
                      Level: [dynamic progression]
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge>Best Score: {simonBest ?? "—"}</Badge>
                  <Badge variant="outline">Level: {simonLevel ?? "—"}</Badge>
                </div>
                <Button className="w-full bg-pink-500 text-white hover:bg-pink-500/90">
                  <span className="mr-2">▶️</span>
                  Play Simon Says
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {activeSection === "rhyme-radar" && <RhymeRadarGame />}
      {activeSection === "memory-boost" && <MemoryBoostGame />}
      {activeSection === "simon-says" && <SimonSays />}
      {activeSection === "sound-match" && <SoundMatch />}
      {activeSection === "story-scramble" && <StoryScramble />}

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
                onClick={() => navigate("story")}
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



              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("spelling-builder")}
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
                onClick={() => navigate("voice-reading")}
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
                onClick={() => navigate("reading-fluency")}
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
                onClick={() => navigate("rhyme-radar")}
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
                onClick={() => navigate("memory-boost")}
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
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => navigate("peer-community")}
              >
                <span className="text-xl">👥</span>
                <span>Peer Community</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => navigate("ai-exam-prep")}
              >
                <span className="text-xl">📖</span>
                <span>Exam Prep</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => navigate("ai-coach")}
              >
                <span className="text-xl">🧠</span>
                <span>Doc Summarizer</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                onClick={() => navigate("games")}
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
