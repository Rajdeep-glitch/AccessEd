"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Brain,
  Calendar,
  Download,
  FileText,
  Gamepad2,
  Mic,
  BookOpen,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  Settings,
  Bell,
  Target,
  Clock,
  Trophy,
  AlertCircle,
  CheckCircle,
  Eye,
} from "lucide-react"

interface StudentProgress {
  area: string
  current: number
  target: number
  trend: "up" | "down" | "stable"
  lastWeek: number
}

interface ActivitySession {
  id: string
  type: "story" | "game" | "voice" | "ai-coach"
  title: string
  duration: number
  score: number
  completedAt: string
  strengths: string[]
  improvements: string[]
}

const studentProgress: StudentProgress[] = [
  { area: "Reading Comprehension", current: 92, target: 95, trend: "up", lastWeek: 88 },
  { area: "Spelling & Writing", current: 76, target: 85, trend: "up", lastWeek: 72 },
  { area: "Phonics & Sounds", current: 58, target: 75, trend: "up", lastWeek: 55 },
  { area: "Reading Fluency", current: 81, target: 90, trend: "stable", lastWeek: 81 },
  { area: "Vocabulary", current: 89, target: 90, trend: "up", lastWeek: 86 },
]

const recentSessions: ActivitySession[] = [
  {
    id: "1",
    type: "story",
    title: "The Magic Garden",
    duration: 18,
    score: 85,
    completedAt: "2024-01-15T10:30:00",
    strengths: ["Excellent comprehension", "Good reading pace"],
    improvements: ["Work on expression", "Practice difficult words"],
  },
  {
    id: "2",
    type: "game",
    title: "Rhyme Radar Level 4",
    duration: 12,
    score: 95,
    completedAt: "2024-01-15T09:15:00",
    strengths: ["Quick pattern recognition", "Strong phonemic awareness"],
    improvements: ["Try harder levels", "Focus on speed"],
  },
  {
    id: "3",
    type: "voice",
    title: "Voice Reading Assessment",
    duration: 15,
    score: 78,
    completedAt: "2024-01-14T16:45:00",
    strengths: ["Clear pronunciation", "Good volume"],
    improvements: ["Work on fluency", "Practice longer passages"],
  },
  {
    id: "4",
    type: "ai-coach",
    title: "Spelling Patterns Practice",
    duration: 10,
    score: 82,
    completedAt: "2024-01-14T14:20:00",
    strengths: ["Improved accuracy", "Better focus"],
    improvements: ["Review silent E rules", "Practice more complex words"],
  },
]

export default function ParentTeacherDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days")
  const [activeTab, setActiveTab] = useState("overview")

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "story":
        return <BookOpen className="w-4 h-4" />
      case "game":
        return <Gamepad2 className="w-4 h-4" />
      case "voice":
        return <Mic className="w-4 h-4" />
      case "ai-coach":
        return <Brain className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-balance">Parent & Teacher Dashboard</h1>
            <p className="text-muted-foreground">Track Alex's learning journey and progress</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold text-primary">89%</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Days</p>
                  <p className="text-2xl font-bold text-secondary">23/30</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold text-accent">4.2h</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold text-chart-2">12</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Detailed Progress</TabsTrigger>
          <TabsTrigger value="activities">Activity History</TabsTrigger>
          <TabsTrigger value="reports">Reports & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Progress Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Learning Areas Progress</CardTitle>
                <CardDescription>Current performance across key learning areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentProgress.map((area, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-balance">{area.area}</span>
                          {getTrendIcon(area.trend)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{area.current}%</span>
                          <span>/</span>
                          <span>{area.target}%</span>
                        </div>
                      </div>
                      <Progress value={area.current} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Last week: {area.lastWeek}%</span>
                        <span>Target: {area.target}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">Focus Area</h4>
                      <p className="text-xs text-muted-foreground text-balance">
                        Phonics needs attention. Recommend 10 extra minutes daily on sound blending exercises.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">Strength</h4>
                      <p className="text-xs text-muted-foreground text-balance">
                        Excellent comprehension skills! Alex consistently scores above grade level.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/20">
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">Suggestion</h4>
                      <p className="text-xs text-muted-foreground text-balance">
                        Try multisensory activities like finger tracing for spelling practice.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Learning Sessions</CardTitle>
              <CardDescription>Latest activities and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getActivityIcon(session.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-balance">{session.title}</h4>
                        <Badge variant="outline">{session.score}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.duration} minutes • {formatDate(session.completedAt)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Trends</CardTitle>
                <CardDescription>Performance over time by learning area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {studentProgress.map((area, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-balance">{area.area}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(area.trend)}
                          <span className="text-sm font-medium">{area.current}%</span>
                        </div>
                      </div>
                      <Progress value={area.current} className="h-3 mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started: {Math.max(0, area.current - 20)}%</span>
                        <span>Goal: {area.target}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Summary</CardTitle>
                <CardDescription>Time spent on different learning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="font-medium">Story Reading</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">45 min</div>
                      <div className="text-xs text-muted-foreground">3 sessions</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-secondary" />
                      <span className="font-medium">AI Coach</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">32 min</div>
                      <div className="text-xs text-muted-foreground">5 sessions</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gamepad2 className="w-5 h-5 text-accent" />
                      <span className="font-medium">Learning Games</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">28 min</div>
                      <div className="text-xs text-muted-foreground">4 sessions</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-chart-2/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mic className="w-5 h-5 text-chart-2" />
                      <span className="font-medium">Voice Reading</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">15 min</div>
                      <div className="text-xs text-muted-foreground">1 session</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Activity History</CardTitle>
              <CardDescription>Detailed view of all learning sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        {getActivityIcon(session.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-balance">{session.title}</h4>
                          <Badge variant={session.score >= 80 ? "default" : "secondary"}>{session.score}%</Badge>
                          <Badge variant="outline">{session.duration} min</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{formatDate(session.completedAt)}</p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-green-700 mb-2">Strengths</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {session.strengths.map((strength, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  <span className="text-balance">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-secondary mb-2">Areas to Practice</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {session.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Target className="w-3 h-3 text-secondary flex-shrink-0" />
                                  <span className="text-balance">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress Report</CardTitle>
                <CardDescription>Comprehensive analysis of learning outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Key Achievements</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Improved reading comprehension by 15%</li>
                      <li>• Completed 12 story modules successfully</li>
                      <li>• Achieved 7-day learning streak</li>
                      <li>• Mastered 45 new vocabulary words</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                    <h4 className="font-medium text-secondary mb-2">Focus Areas for Next Month</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Increase phonics practice time</li>
                      <li>• Work on reading fluency and expression</li>
                      <li>• Practice more complex spelling patterns</li>
                      <li>• Develop writing skills through storytelling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Personalized suggestions for continued growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 text-balance">At-Home Activities</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Read together for 15 minutes daily</li>
                      <li>• Practice sight words during car rides</li>
                      <li>• Use finger tracing for spelling practice</li>
                      <li>• Play rhyming games during daily activities</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 text-balance">Classroom Support</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Provide extra time for reading tasks</li>
                      <li>• Use visual aids and graphic organizers</li>
                      <li>• Encourage peer reading partnerships</li>
                      <li>• Celebrate small wins and progress</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Downloadable Reports</CardTitle>
              <CardDescription>Generate detailed reports for meetings and records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Weekly Summary</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">Progress Charts</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">IEP Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
