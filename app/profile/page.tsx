"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type User = { id: string; name: string; email: string; createdAt: string; photo?: string }

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || ""
        const resp = await fetch(`${base}/api/auth/me`, { credentials: "include" })
        const data = await resp.json()
        if (data?.user) setUser(data.user)
      } catch {}
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (!user)
    return (
      <div className="p-6">
        <p className="mb-4">You are not signed in.</p>
        <Link href="/auth/signin">
          <Button>Go to Sign In</Button>
        </Link>
      </div>
    )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {user.photo ? (
              <Image src={user.photo} alt={user.name} width={96} height={96} className="rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-secondary grid place-items-center text-2xl">🧑</div>
            )}
            <div>
              <div className="text-lg font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground mt-1">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="mt-6">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 