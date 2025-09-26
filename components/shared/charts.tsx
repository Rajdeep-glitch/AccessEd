"use client"

import React from "react"
import { ResponsiveContainer, AreaChart, Area, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { motion } from "framer-motion"

export function Sparkline({ data, color = "hsl(var(--primary))" }: { data: { x: string | number; y: number }[]; color?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <ResponsiveContainer width="100%" height={48}>
        <AreaChart data={data} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={color} fillOpacity={1} fill="url(#spark)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export function SimpleLineChart({ data, color = "hsl(var(--primary))" }: { data: { name: string; value: number }[]; color?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}