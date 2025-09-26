"use client"

import { useMemo } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Menu,
  LogOut,
  User as UserIcon,
  BookOpen,
  Gamepad2,
  Mic,
  Trophy,
  ArrowLeft,
} from "lucide-react"
import FontSwitcher from "@/components/font-switcher"
import ThemeToggle from "@/components/shared/theme-toggle"
import { motion } from "framer-motion"

export type SectionKey =
  | "dashboard"
  | "profile"
  | "story"
  | "games"
  | "voice-reading"
  | "parent"
  | "ai-exam-prep"
  | "peer-community"
  | "content-generator"
  | "ai-coach"
  | "ai-coach-pro"
  | "dyslexia-lens"
  | "ai-learning-path"
  | "settings"
  | "spelling-builder"
  | "reading-fluency"
  | "sound-match"
  | "story-scramble"
  | "rhyme-radar"
  | "memory-boost"
  | "simon-says"

export default function SiteNavbar({
  activeSection,
  onNavigateAction,
  user,
  onSignOutAction,
  onBack,
  canGoBack,
}: {
  activeSection: SectionKey
  onNavigateAction: (key: SectionKey) => void
  user: { name: string; type?: string }
  onSignOutAction: () => void
  onBack?: () => void
  canGoBack?: boolean
}) {
  const initials = useMemo(() => (user?.name || "U").slice(0, 2).toUpperCase(), [user?.name])

  return (
    <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
        {/* Left controls: Back + Brand */}
        <div className="flex items-center gap-4">
          {canGoBack && (
            <Button variant="ghost" size="icon" className="mr-2 hover:bg-primary/10 transition-colors" onClick={onBack} aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground grid place-items-center shadow-lg animate-float">
            <span className="text-2xl">🧠</span>
          </div>
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AccessEd
            </div>
            <div className="text-xs text-muted-foreground">Empowering Every Learner</div>
          </div>
        </div>

        {/* Desktop Nav + Actions */}
        <nav className="hidden lg:flex items-center gap-2">
          {/* Primary actions (always visible) */}
          <Button variant="ghost" size="sm" className={`hover:bg-primary/10 hover:text-primary transition-colors ${activeSection === "dashboard" ? "bg-primary/10 text-primary" : ""}`} onClick={() => onNavigateAction("dashboard")}>
            <Trophy className="h-4 w-4 mr-2" /> Dashboard
          </Button>
          <Button variant="ghost" size="sm" className={`hover:bg-primary/10 hover:text-primary transition-colors ${activeSection === "story" ? "bg-primary/10 text-primary" : ""}`} onClick={() => onNavigateAction("story")}>
            <BookOpen className="h-4 w-4 mr-2" /> Story Mode
          </Button>
          <Button variant="ghost" size="sm" className={`hover:bg-primary/10 hover:text-primary transition-colors ${activeSection === "games" ? "bg-primary/10 text-primary" : ""}`} onClick={() => onNavigateAction("games")}>
            <Gamepad2 className="h-4 w-4 mr-2" /> Games
          </Button>
          <Button variant="ghost" size="sm" className={`hover:bg-primary/10 hover:text-primary transition-colors ${activeSection === "voice-reading" ? "bg-primary/10 text-primary" : ""}`} onClick={() => onNavigateAction("voice-reading")}>
            <Mic className="h-4 w-4 mr-2" /> Voice Reading
          </Button>

          {/* Compact overflow into More */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors">
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-[100]">
              <DropdownMenuItem onClick={() => onNavigateAction("content-generator")}>Content Generator</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateAction("ai-coach")}>Doc Summarizer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateAction("dyslexia-lens")}>Dyslexia Lens</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateAction("parent")}>Parent Portal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateAction("ai-exam-prep")}>Exam Prep</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateAction("peer-community")}>Community</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-2 h-6" />
          <FontSwitcher className="mr-1" />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-1 hover:bg-secondary/20 transition-colors">
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary" onClick={() => onNavigateAction("profile")}> <UserIcon className="h-4 w-4 mr-2" /> Profile</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-destructive/10 hover:text-destructive" onClick={onSignOutAction}> <LogOut className="h-4 w-4 mr-2" /> Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile: actions */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-transparent">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium leading-none">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.type || "Student"}</div>
                </div>
              </div>

              <nav className="grid gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-between hover:bg-primary/10 hover:text-primary transition-colors">Learn</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="z-[100]">
                    <DropdownMenuItem onClick={() => onNavigateAction("dashboard")}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigateAction("story")}>Story Mode</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-between hover:bg-primary/10 hover:text-primary transition-colors">Explore</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="z-[100]">
                    <DropdownMenuItem onClick={() => onNavigateAction("games")}>Games</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigateAction("voice-reading")}>Voice Reading</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigateAction("content-generator")}>Content Generator</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigateAction("ai-coach")}>Doc Summarizer</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigateAction("dyslexia-lens")}>Dyslexia Lens</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-between hover:bg-primary/10 hover:text-primary transition-colors">Community</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="z-[100]">
                    <DropdownMenuItem onClick={() => onNavigateAction("parent")}>Parent Portal</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigateAction("ai-exam-prep")}>Exam Prep</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigateAction("peer-community")}>Community</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator className="my-3" />
                <Button variant="ghost" className="justify-start" onClick={() => onNavigateAction("settings")}>Settings</Button>
                <Button variant="ghost" className="justify-start" onClick={() => onNavigateAction("profile")}>Profile</Button>
                <Button variant="outline" className="justify-start" onClick={onSignOutAction}>Sign Out</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}