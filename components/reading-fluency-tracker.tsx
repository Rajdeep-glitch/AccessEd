"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ReadingSession {
  date: string
  wordsPerMinute: number
  accuracy: number
  duration: number
  passage: string
}

export default function ReadingFluencyTracker() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for reading sessions
  const readingSessions: ReadingSession[] = [
    { date: "2024-01-15", wordsPerMinute: 85, accuracy: 92, duration: 300, passage: "The Adventure Begins" },
    { date: "2024-01-14", wordsPerMinute: 82, accuracy: 89, duration: 280, passage: "Ocean Mysteries" },
    { date: "2024-01-13", wordsPerMinute: 78, accuracy: 94, duration: 320, passage: "Space Explorer" },
    { date: "2024-01-12", wordsPerMinute: 75, accuracy: 87, duration: 290, passage: "Forest Friends" },
    { date: "2024-01-11", wordsPerMinute: 73, accuracy: 91, duration: 310, passage: "City Adventures" },
    { date: "2024-01-10", wordsPerMinute: 70, accuracy: 88, duration: 300, passage: "Mountain Climb" },
    { date: "2024-01-09", wordsPerMinute: 68, accuracy: 85, duration: 330, passage: "Desert Journey" },
  ]

  const currentWPM = readingSessions[0]?.wordsPerMinute || 0
  const previousWPM = readingSessions[1]?.wordsPerMinute || 0
  const improvement = currentWPM - previousWPM
  const averageAccuracy = readingSessions.reduce((sum, session) => sum + session.accuracy, 0) / readingSessions.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-balance">Reading Fluency Tracker</h2>
        <p className="text-muted-foreground">Track your reading speed and accuracy over time</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant={activeTab === "overview" ? "default" : "outline"} onClick={() => setActiveTab("overview")}>
          <span className="mr-2">📊</span>
          Overview
        </Button>
        <Button variant={activeTab === "progress" ? "default" : "outline"} onClick={() => setActiveTab("progress")}>
          <span className="mr-2">📈</span>
          Progress Chart
        </Button>
        <Button variant={activeTab === "sessions" ? "default" : "outline"} onClick={() => setActiveTab("sessions")}>
          <span className="mr-2">📅</span>
          Session History
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                Current Reading Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">{currentWPM}</div>
                <div className="text-sm text-muted-foreground">Words per minute</div>
                {improvement > 0 && (
                  <Badge className="bg-green-100 text-green-800">
                    <span className="mr-1">📈</span>+{improvement} WPM
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Average Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-secondary">{Math.round(averageAccuracy)}%</div>
                <div className="text-sm text-muted-foreground">Reading accuracy</div>
                <Progress value={averageAccuracy} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* Weekly Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-accent">90</div>
                <div className="text-sm text-muted-foreground">Target WPM</div>
                <Progress value={(currentWPM / 90) * 100} className="mt-2" />
                <div className="text-xs text-muted-foreground">{90 - currentWPM} WPM to goal</div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Reading Sessions</CardTitle>
              <CardDescription>Your last 7 reading practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {readingSessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📖</span>
                      <div>
                        <div className="font-medium">{session.passage}</div>
                        <div className="text-sm text-muted-foreground">{session.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{session.wordsPerMinute}</div>
                        <div className="text-muted-foreground">WPM</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{session.accuracy}%</div>
                        <div className="text-muted-foreground">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{Math.round(session.duration / 60)}</div>
                        <div className="text-muted-foreground">Minutes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Chart Tab */}
      {activeTab === "progress" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading Speed Progress</CardTitle>
              <CardDescription>Words per minute over the last 7 sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 p-4">
                {readingSessions.reverse().map((session, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="bg-primary rounded-t w-full transition-all hover:bg-primary/80"
                      style={{ height: `${(session.wordsPerMinute / 100) * 200}px` }}
                    />
                    <div className="text-xs text-center">
                      <div className="font-semibold">{session.wordsPerMinute}</div>
                      <div className="text-muted-foreground">{session.date.slice(-2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between gap-2">
                  {readingSessions.map((session, index) => (
                    <div key={index} className="flex flex-col items-center gap-1 flex-1">
                      <div className="bg-secondary rounded-t w-full" style={{ height: `${session.accuracy}px` }} />
                      <div className="text-xs">{session.accuracy}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="mr-2">📈</span>
                  <span>Reading speed improved by {improvement} WPM this week</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="mr-2">🎯</span>
                  <span>Accuracy is consistently above 85%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="mr-2">⏱️</span>
                  <span>
                    Average session time:{" "}
                    {Math.round(readingSessions.reduce((sum, s) => sum + s.duration, 0) / readingSessions.length / 60)}{" "}
                    minutes
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Session History Tab */}
      {activeTab === "sessions" && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Session History</CardTitle>
            <CardDescription>Detailed view of all your reading practice sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readingSessions.map((session, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{session.passage}</div>
                    <div className="text-sm text-muted-foreground">{session.date}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-primary">{session.wordsPerMinute}</div>
                    <div className="text-xs text-muted-foreground">WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-secondary">{session.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{Math.round(session.duration / 60)}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center">
                    <Badge variant={session.accuracy >= 90 ? "default" : "outline"}>
                      {session.accuracy >= 90 ? "Excellent" : "Good"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
