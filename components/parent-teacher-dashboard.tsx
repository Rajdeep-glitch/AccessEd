"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Gamepad2, Mic, BookOpen, Trophy, TrendingUp, TrendingDown, Target } from "lucide-react"
import { motion } from "framer-motion"
import { Lexend } from "next/font/google"

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" })

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
}

const studentProgress: StudentProgress[] = [
  { area: "Reading Comprehension", current: 92, target: 95, trend: "up", lastWeek: 88 },
  { area: "Spelling & Writing", current: 76, target: 85, trend: "up", lastWeek: 72 },
  { area: "Phonics & Sounds", current: 58, target: 75, trend: "up", lastWeek: 55 },
  { area: "Reading Fluency", current: 81, target: 90, trend: "stable", lastWeek: 81 },
  { area: "Vocabulary", current: 89, target: 90, trend: "up", lastWeek: 86 },
]

const recentSessions: ActivitySession[] = [
  { id: "1", type: "story", title: "The Magic Garden", duration: 18, score: 85, completedAt: "2024-01-15T10:30:00" },
  { id: "2", type: "game", title: "Rhyme Radar Level 4", duration: 12, score: 95, completedAt: "2024-01-15T09:15:00" },
]

export default function ParentTeacherDashboard() {
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

  return (
    <div className={`${lexend.variable} min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}>
      <div className="max-w-7xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
            <Trophy className="w-4 h-4" />
            Parental Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-lexend">Track Alex&apos;s Learning Journey</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Monitor progress, get AI-powered insights, and customize learning experiences for optimal growth.
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-1 shadow-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Recent Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {studentProgress.map((p) => (
                  <div key={p.area} className="flex items-center justify-between mb-4">
                    <span>{p.area}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={p.current} className="w-32" />
                      {getTrendIcon(p.trend)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {studentProgress.map((p) => (
                  <div key={p.area} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{p.area}</span>
                      <span>{p.current}% / Target {p.target}%</span>
                    </div>
                    <Progress value={(p.current / p.target) * 100} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(s.type)}
                      <span>{s.title}</span>
                    </div>
                    <Badge>{s.score}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
