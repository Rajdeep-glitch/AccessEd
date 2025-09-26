"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fadeInUp } from "@/components/shared/motion"

export function GameCard({
  title,
  description,
  icon,
  accent = "primary",
  stats,
  onPlay,
}: {
  title: string
  description: string
  icon: React.ReactNode
  accent?: "primary" | "secondary" | "accent" | "chart-2" | "chart-3"
  stats?: { label: string; value: string }[]
  onPlay?: () => void
}) {
  const accentBg =
    accent === "secondary"
      ? "bg-secondary/10"
      : accent === "accent"
      ? "bg-accent/10"
      : accent === "chart-2"
      ? "bg-chart-2/10"
      : accent === "chart-3"
      ? "bg-chart-3/10"
      : "bg-primary/10"

  return (
    <motion.div variants={fadeInUp}>
      <Card className="hover:shadow-lg transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${accentBg} rounded-xl flex items-center justify-center`}>{icon}</div>
            <div className="flex-1">
              <CardTitle className="text-lg text-balance">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            {stats?.map((s, i) => (
              <Badge key={i} variant={i === 0 ? "default" : "outline"}>
                {s.label}: {s.value}
              </Badge>
            ))}
          </div>
          <Button onClick={onPlay} className="w-full group">
            <span className="mr-2">▶️</span>
            Play
            <span className="ml-2 h-2 w-2 rounded-full bg-accent group-hover:animate-pulse" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}