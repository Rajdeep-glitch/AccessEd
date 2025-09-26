"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Edit2, Save } from "lucide-react"

export default function Profile({
  user,
  userPoints,
  userLevel,
  achievements,
  simonBest,
  simonLevel,
  soundBest,
  soundLevel,
  scrambleCompleted,
  scrambleLevel
}: {
  user: { name: string; type: string }
  userPoints: number
  userLevel: number
  achievements: string[]
  simonBest?: number | null
  simonLevel?: number | null
  soundBest?: number | null
  soundLevel?: number | null
  scrambleCompleted?: number | null
  scrambleLevel?: number | null
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user.name,
    bio: "",
    picture: ""
  })

  useEffect(() => {
    // Load profile data from localStorage
    const saved = localStorage.getItem("userProfile")
    if (saved) {
      setProfileData(JSON.parse(saved))
    } else {
      setProfileData(prev => ({ ...prev, name: user.name }))
    }
  }, [user.name])

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profileData))
    setIsEditing(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, picture: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const achievementIcons = {
    'first-game': '🎮',
    'streak-7': '🔥',
    'ai-chat': '🤖'
  }

  const achievementLabels = {
    'first-game': 'First Game',
    'streak-7': '7-Day Streak',
    'ai-chat': 'AI Chat'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">My Profile</CardTitle>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
            <CardDescription>Manage your personal information and view your learning progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profileData.picture} alt={profileData.name} />
                    <AvatarFallback className="text-2xl">{profileData.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Click the camera to upload a new picture</p>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-medium">{profileData.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-muted-foreground">{profileData.bio || "No bio added yet."}</p>
                  )}
                </div>
                <div>
                  <Label>Account Type</Label>
                  <p className="mt-1 capitalize">{user.type}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Details / Progress */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Achievements
              </CardTitle>
              <CardDescription>Your learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-2xl">{achievementIcons[achievement as keyof typeof achievementIcons]}</span>
                    <span className="font-medium">{achievementLabels[achievement as keyof typeof achievementLabels]}</span>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-muted-foreground">No achievements yet. Keep learning!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Game Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎮 Game Progress
              </CardTitle>
              <CardDescription>Your performance in learning games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simonBest && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Simon Says</span>
                      <Badge variant="secondary">Best: {simonBest}</Badge>
                    </div>
                    <Progress value={Math.min((simonLevel || 0) * 10, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Level {simonLevel || 0}</p>
                  </div>
                )}
                {soundBest && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Sound Match</span>
                      <Badge variant="secondary">Best: {soundBest}</Badge>
                    </div>
                    <Progress value={Math.min((soundLevel || 0) * 10, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Level {soundLevel || 0}</p>
                  </div>
                )}
                {scrambleCompleted && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Story Scramble</span>
                      <Badge variant="secondary">Completed: {scrambleCompleted}</Badge>
                    </div>
                    <Progress value={Math.min((scrambleLevel || 0) * 10, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Level {scrambleLevel || 0}</p>
                  </div>
                )}
                {!simonBest && !soundBest && !scrambleCompleted && (
                  <p className="text-muted-foreground">No game stats yet. Play some games!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Overall Progress
            </CardTitle>
            <CardDescription>Your learning journey at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userLevel}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{userPoints.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">XP Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{achievements.length}</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-1">{(simonLevel || 0) + (soundLevel || 0) + (scrambleLevel || 0)}</div>
                <div className="text-sm text-muted-foreground">Total Levels</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}