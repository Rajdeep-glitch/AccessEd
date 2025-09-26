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
import SiteNavbar, { SectionKey } from "@/components/site-navbar"
import AIContentGenerator from "@/components/ai-content-generator"
import FontSwitcher from "@/components/font-switcher"
import SimonSays from "@/components/simon-says"
import SoundMatch from "@/components/sound-match"
import StoryScramble from "@/components/story-scramble"
import AIReadingCoachPro from "@/components/ai-reading-coach-pro"
import DyslexiaLens from "@/components/dyslexia-lens"
import Profile from "@/components/profile"
import DocumentSummarizer from "@/components/document-summarizer"


export default function DyslexiaLearningApp() {
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({ name: "Alex", type: "student" })
  const [simonBest, setSimonBest] = useState<number | null>(null)
  const [simonLevel, setSimonLevel] = useState<number | null>(null)
  // New games: Sound Match & Story Scramble preview stats
  const [soundBest, setSoundBest] = useState<number | null>(null)
  const [soundLevel, setSoundLevel] = useState<number | null>(null)
  const [scrambleCompleted, setScrambleCompleted] = useState<number | null>(null)
  const [scrambleLevel, setScrambleLevel] = useState<number | null>(null)
  // Gamification
  const [userPoints] = useState(1250)
  const [userLevel] = useState(5)
  const [achievements] = useState(['first-game', 'streak-7', 'ai-chat'])

  // Simple history stack for back navigation across sections
  const [history, setHistory] = useState<SectionKey[]>([])
  const canGoBack = history.length > 0

  const navigate = (next: SectionKey) => {
    setHistory((prev) => (prev[prev.length - 1] === activeSection ? prev : [...prev, activeSection]))
    setActiveSection(next)
  }

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const copy = [...prev]
      const last = copy.pop() as SectionKey
      setActiveSection(last)
      return copy
    })
  }

  // Sync auth state with backend session and local stats
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || ""
        const resp = await fetch(`${base}/api/auth/me`, { cache: "no-store", credentials: "include" })
        const data = await resp.json()
        if (!cancelled) {
          if (data?.user) {
            setIsAuthenticated(true)
            setUser({ name: data.user.name, type: data.user.role })
          }
        }
      } catch {}

      try {
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
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, []);

  if (!isAuthenticated)
    return (
      <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 hero-gradient opacity-10 animate-pulse-glow"></div>
      <div className="absolute inset-0 hero-pattern"></div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <span className="text-6xl">📚</span>
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <span className="text-5xl">🧠</span>
        </div>
        <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
          <span className="text-4xl">🎯</span>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '0.5s' }}>
          <span className="text-5xl">⭐</span>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-4xl animate-slide-in-up">
            {/* Hero section */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                  <span className="text-4xl">🧠</span>
                </div>
                <div>
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    AccessEd
                  </h1>
                  <p className="text-xl text-muted-foreground mt-2">Empowering Every Learner</p>
                </div>
              </div>

              <div className="mb-10">
                <h2 className="text-4xl font-bold mb-6 text-balance">
                  Revolutionize Learning with AI-Powered Dyslexia Support
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                  Join thousands of learners on their journey to reading success with our comprehensive,
                  gamified dyslexia learning platform featuring AI assistants, interactive games, and personalized coaching.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
                <div className="gamification-card p-6 rounded-xl">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Learning</h3>
                  <p className="text-sm text-muted-foreground">Personalized AI assistants guide your learning journey</p>
                </div>
                <div className="gamification-card p-6 rounded-xl">
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <h3 className="font-semibold mb-2">Gamified Experience</h3>
                  <p className="text-sm text-muted-foreground">Engaging games that make learning fun and effective</p>
                </div>
                <div className="gamification-card p-6 rounded-xl">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold mb-2">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">Detailed analytics and achievements to celebrate success</p>
                </div>
              </div>
            </div>

            {/* CTA section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Link href="/auth/signup" className="flex-1">
                  <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-xl transform hover:scale-105 transition-all duration-300">
                    🚀 Get Started Free
                  </Button>
                </Link>
                <Link href="/auth/signin" className="flex-1">
                  <Button variant="outline" className="w-full h-14 text-lg font-semibold bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              </div>

              <Button
                variant="ghost"
                onClick={() => setIsAuthenticated(true)}
                className="text-base text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-300"
              >
                👀 Try Demo Mode
              </Button>

              {/* Stats */}
              <div className="flex justify-center gap-8 mt-12 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Learners</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">50+</div>
                  <div className="text-sm text-muted-foreground">Games & Tools</div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4">
              <FontSwitcher />
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-background">
      <AccessibilityToolbar />

      {/* Header */}
      <SiteNavbar
        activeSection={activeSection}
        onNavigateAction={(key) => navigate(key)}
        user={user}
        onSignOutAction={async () => {
          try {
            const base = process.env.NEXT_PUBLIC_API_URL || ""
            await fetch(`${base}/api/auth/logout`, { method: "POST", credentials: "include" })
          } catch {}
          setIsAuthenticated(false)
        }}
        onBack={goBack}
        canGoBack={canGoBack}
      />

      {activeSection === "story" && <StoryMode />}

      {activeSection === "voice-reading" && (
        <VoiceReadingAssessment
          onPlan={() => {
            setActiveSection("ai-learning-path")
          }}
        />
      )}
      {activeSection === "parent" && <ParentTeacherDashboard />}
      {activeSection === "ai-exam-prep" && <AIExamPrep />}
      {activeSection === "spelling-builder" && <SpellingBuilder />}
      {activeSection === "reading-fluency" && <ReadingFluencyTracker />}
      {activeSection === "peer-community" && <PeerCommunity />}
      {activeSection === "content-generator" && <AIContentGenerator />}
      {activeSection === "ai-coach" && <DocumentSummarizer />}

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
                    <CardDescription>Find the word that doesn&apos;t rhyme - against the clock!</CardDescription>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-float">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-balance">Welcome back, {user.name}!</h2>
                  <p className="text-sm text-muted-foreground">Ready for today&apos;s learning adventure?</p>
                </div>
              </div>
              {/* Level and Points Display */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Level</div>
                  <div className="text-2xl font-bold text-primary">{userLevel}</div>
                </div>
                <div className="points-badge px-4 py-2 rounded-full text-sm font-semibold">
                  {userPoints.toLocaleString()} XP
                </div>
              </div>
            </div>

            {/* Achievements Showcase */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Recent Achievements 🏆</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {achievements.map((achievement) => (
                  <div key={achievement} className="flex-shrink-0 gamification-card p-3 rounded-lg text-center min-w-[80px]">
                    <div className="w-8 h-8 bg-gradient-to-br from-gold to-warning rounded-full flex items-center justify-center mb-1 mx-auto text-xs">
                      {achievement === 'first-game' && '🎮'}
                      {achievement === 'streak-7' && '🔥'}
                      {achievement === 'ai-chat' && '🤖'}
                    </div>
                    <div className="text-xs font-medium">
                      {achievement === 'first-game' && 'First Game'}
                      {achievement === 'streak-7' && '7-Day Streak'}
                      {achievement === 'ai-chat' && 'AI Chat'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="gamification-card border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Daily Streak</p>
                      <p className="text-3xl font-bold text-primary animate-pulse">7 days</p>
                      <p className="text-xs text-muted-foreground mt-1">🔥 Keep it up!</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg animate-float">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gamification-card border-secondary/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Words Learned</p>
                      <p className="text-3xl font-bold text-secondary">142</p>
                      <p className="text-xs text-muted-foreground mt-1">📚 Vocabulary growing!</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                      <span className="text-2xl">🎯</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gamification-card border-accent/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Time Today</p>
                      <p className="text-3xl font-bold text-accent">25 min</p>
                      <p className="text-xs text-muted-foreground mt-1">⏰ Great progress!</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                      <span className="text-2xl">🕒</span>
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
                      <CardDescription>Find the word that doesn&apos;t rhyme!</CardDescription>
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
              <Card className="gamification-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl animate-pulse">📊</span>
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <span>📖</span>
                          Reading Speed
                        </span>
                        <span className="font-semibold text-primary">78%</span>
                      </div>
                      <Progress value={78} className="h-3 bg-muted/50" />
                      <p className="text-xs text-muted-foreground mt-1">+5% from last week</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <span>🧠</span>
                          Comprehension
                        </span>
                        <span className="font-semibold text-secondary">85%</span>
                      </div>
                      <Progress value={85} className="h-3 bg-muted/50" />
                      <p className="text-xs text-muted-foreground mt-1">Excellent progress!</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <span>🔤</span>
                          Spelling
                        </span>
                        <span className="font-semibold text-accent">62%</span>
                      </div>
                      <Progress value={62} className="h-3 bg-muted/50" />
                      <p className="text-xs text-muted-foreground mt-1">Keep practicing!</p>
                    </div>
                  </div>

                  {/* Mini Leaderboard */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <span>🏆</span>
                      Top Performers This Week
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-6 h-6 bg-gold rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
                        <span>You</span>
                        <span className="ml-auto text-primary font-semibold">1,250 XP</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">2</span>
                        <span>Alex M.</span>
                        <span className="ml-auto">1,180 XP</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">3</span>
                        <span>Sarah L.</span>
                        <span className="ml-auto">1,050 XP</span>
                      </div>
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

      {activeSection === "profile" && (
        <Profile
          user={user}
          userPoints={userPoints}
          userLevel={userLevel}
          achievements={achievements}
          simonBest={simonBest}
          simonLevel={simonLevel}
          soundBest={soundBest}
          soundLevel={soundLevel}
          scrambleCompleted={scrambleCompleted}
          scrambleLevel={scrambleLevel}
        />
      )}

    </div>
  )
}
