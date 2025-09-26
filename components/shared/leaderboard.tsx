"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"
import { MotionContainer, MotionCard, fadeInUp } from "@/components/shared/motion"

export type LeaderItem = {
  name: string
  score: number
  rank?: number
  initials?: string
}

export function Leaderboard({
  title = "Leaderboard",
  items = [
    { name: "Alex", score: 1280, rank: 1, initials: "AL" },
    { name: "Sam", score: 1175, rank: 2, initials: "SA" },
    { name: "Jamie", score: 1090, rank: 3, initials: "JA" },
    { name: "Riley", score: 980, rank: 4, initials: "RI" },
    { name: "Taylor", score: 915, rank: 5, initials: "TA" },
  ],
  highlightCurrent = true,
}: {
  title?: string
  items?: LeaderItem[]
  highlightCurrent?: boolean
}) {
  const sorted = [...items].sort((a, b) => b.score - a.score).map((it, i) => ({ ...it, rank: it.rank ?? i + 1 }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-chart-2" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MotionContainer className="space-y-3">
          {sorted.map((item, idx) => (
            <MotionCard key={item.name + idx}>
              <motion.div
                variants={fadeInUp}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  highlightCurrent && idx === 0 ? "bg-chart-2/10 border-chart-2/30" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 grid place-items-center rounded-md font-semibold ${
                    item.rank === 1 ? "bg-chart-2 text-white" : item.rank === 2 ? "bg-primary/10" : "bg-secondary/10"
                  }`}>
                    {item.rank}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{item.initials || item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
                <div className="text-sm font-semibold">{item.score.toLocaleString()}</div>
              </motion.div>
            </MotionCard>
          ))}
        </MotionContainer>
      </CardContent>
    </Card>
  )
}