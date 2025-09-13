"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import AccessibilityToolbar from "@/components/accessibility-toolbar"
import RhymeRadarGame from "@/components/rhyme-radar-game"
import MemoryBoostGame from "@/components/memory-boost-game"
import SpellingBuilder from "@/components/spelling-builder"

interface UserData {
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [activeSection, setActiveSection] = useState("dashboard")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/auth/signin")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <AccessibilityToolbar />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Empowering Every Learner</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.name}!</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              <Button
                variant={activeSection === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection("dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant={activeSection === "story-mode" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection("story-mode")}
              >
                Story Mode
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
                variant={activeSection === "parent-portal" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection("parent-portal")}
              >
                Parent Portal
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {activeSection === "rhyme-radar" && <RhymeRadarGame />}
      {activeSection === "memory-boost" && <MemoryBoostGame />}
      {activeSection === "spelling-builder" && <SpellingBuilder />}

      {activeSection === "games" && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-balance">Learning Games</h2>
            <p className="text-muted-foreground">Fun games to boost your reading and memory skills</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Dashboard Content */}
      {activeSection === "dashboard" && (
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-balance">Hello, {user.name}! 👋</h2>
                <p className="text-lg text-muted-foreground mt-1">Ready to continue your learning journey?</p>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <span className="mr-1">⭐</span>
                Level 5 Learner
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Daily Streak</p>
                      <p className="text-2xl font-bold text-gray-900">7 days</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Words Learned</p>
                      <p className="text-2xl font-bold text-gray-900">142</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Games Played</p>
                      <p className="text-2xl font-bold text-gray-900">28</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎮</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reading Score</p>
                      <p className="text-2xl font-bold text-gray-900">85%</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Learning Activities */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-balance">Learning Activities</h3>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("story-mode")}
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

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveSection("spelling-builder")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🔤</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Spelling Builder</CardTitle>
                      <CardDescription>Drag and drop letters to build words</CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      Build
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder sections for other navigation items */}
      {activeSection === "story-mode" && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">Story Mode</h2>
          <p className="text-muted-foreground">Interactive reading stories coming soon!</p>
        </div>
      )}



      {activeSection === "voice-reading" && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">Voice Reading</h2>
          <p className="text-muted-foreground">Voice reading practice coming soon!</p>
        </div>
      )}

      {activeSection === "parent-portal" && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">Parent Portal</h2>
          <p className="text-muted-foreground">Parent dashboard and progress tracking coming soon!</p>
        </div>
      )}
    </div>
  )
}
