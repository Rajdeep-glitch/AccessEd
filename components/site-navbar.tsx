"use client"

import { useMemo } from "react"
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
  UsersRound,
  Trophy,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import FontSwitcher from "@/components/font-switcher"

export type SectionKey =
  | "dashboard"
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
  | "settings"

export default function SiteNavbar({
  activeSection,
  onNavigate,
  user,
  onSignOut,
  onBack,
  canGoBack,
}: {
  activeSection: SectionKey
  onNavigate: (key: SectionKey) => void
  user: { name: string; type?: string }
  onSignOut: () => void
  onBack?: () => void
  canGoBack?: boolean
}) {
  const initials = useMemo(() => (user?.name || "U").slice(0, 2).toUpperCase(), [user?.name])

  const items: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <Trophy className="h-4 w-4" /> },
    { key: "story", label: "Story Mode", icon: <BookOpen className="h-4 w-4" /> },
    { key: "content-generator", label: "Content Generator", icon: <Sparkles className="h-4 w-4" /> },
    { key: "games", label: "Games", icon: <Gamepad2 className="h-4 w-4" /> },
    { key: "voice-reading", label: "Voice Reading", icon: <Mic className="h-4 w-4" /> },
    { key: "parent", label: "Parent Portal", icon: <UsersRound className="h-4 w-4" /> },
    { key: "ai-exam-prep", label: "Exam Prep", icon: <Trophy className="h-4 w-4" /> },
    { key: "peer-community", label: "Community", icon: <UsersRound className="h-4 w-4" /> },
  ]

  return (
    <header className="sticky top-0 z-40 border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left controls: Back + Brand */}
        <div className="flex items-center gap-3">
          {canGoBack && (
            <Button variant="ghost" size="icon" className="mr-1" onClick={onBack} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
            <span className="text-xl">🧠</span>
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-tight">AccessEd</div>
            <div className="text-xs text-muted-foreground">Empowering Every Learner</div>
          </div>
        </div>



        {/* Desktop Nav + Actions */}
        <nav className="hidden lg:flex items-center gap-2">
          {/* Primary actions (always visible) */}
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onNavigate("dashboard")}>
            <Trophy className="h-4 w-4 mr-2" /> Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onNavigate("story")}>
            <BookOpen className="h-4 w-4 mr-2" /> Story Mode
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onNavigate("games")}>
            <Gamepad2 className="h-4 w-4 mr-2" /> Games
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onNavigate("voice-reading")}>
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
              <DropdownMenuItem onClick={() => onNavigate("content-generator")}>Content Generator</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate("ai-coach")}>Doc Summarizer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate("dyslexia-lens")}>Dyslexia Lens</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate("parent")}>Parent Portal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate("ai-exam-prep")}>Exam Prep</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate("peer-community")}>Community</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-2 h-6" />
          <FontSwitcher className="mr-2" />

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
              <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary" onClick={() => onNavigate("dashboard")}> <UserIcon className="h-4 w-4 mr-2" /> Profile</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-destructive/10 hover:text-destructive" onClick={onSignOut}> <LogOut className="h-4 w-4 mr-2" /> Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile: actions */}
        <div className="flex lg:hidden items-center gap-2">
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
                    <DropdownMenuItem onClick={() => onNavigate("dashboard")}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("story")}>Story Mode</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-between hover:bg-primary/10 hover:text-primary transition-colors">Explore</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="z-[100]">
                    <DropdownMenuItem onClick={() => onNavigate("games")}>Games</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("voice-reading")}>Voice Reading</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("content-generator")}>Content Generator</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("ai-coach")}>Doc Summarizer</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("dyslexia-lens")}>Dyslexia Lens</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-between hover:bg-primary/10 hover:text-primary transition-colors">Community</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="z-[100]">
                    <DropdownMenuItem onClick={() => onNavigate("parent")}>Parent Portal</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("ai-exam-prep")}>Exam Prep</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("peer-community")}>Community</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator className="my-3" />
                <Button variant="ghost" className="justify-start" onClick={() => onNavigate("settings")}>Settings</Button>
                <Button variant="ghost" className="justify-start" onClick={() => onNavigate("dashboard")}>Profile</Button>
                <Button variant="outline" className="justify-start" onClick={onSignOut}>Sign Out</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}