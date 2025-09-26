"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface FontSwitcherProps {
  className?: string
}

export default function FontSwitcher({ className }: FontSwitcherProps) {
  const [currentFont, setCurrentFont] = useState("default")
  const [isOpen, setIsOpen] = useState(false)

  const fonts = useMemo(() => [
    { id: "default", name: "Default Font", family: "var(--font-sans)" },
    { id: "dyslexic", name: "Dyslexic Friendly", family: "OpenDyslexic, Comic Sans MS, sans-serif" },
    { id: "comic", name: "Comic Sans", family: "Comic Sans MS, cursive" },
    { id: "arial", name: "Arial", family: "Arial, sans-serif" },
  ], [])

  const applyFont = useCallback((fontId: string) => {
    const font = fonts.find((f) => f.id === fontId)
    if (font) {
      document.documentElement.style.setProperty("--font-family-override", font.family)
      document.body.style.fontFamily = font.family

      // Apply to all text elements for immediate effect
      const elements = document.querySelectorAll("*")
      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.fontFamily = font.family
        }
      })
    }
  }, [fonts])

  useEffect(() => {
    // Load saved font preference
    const savedFont = localStorage.getItem("preferred-font") || "default"
    setCurrentFont(savedFont)
    applyFont(savedFont)
  }, [applyFont])

  const handleFontChange = (fontId: string) => {
    setCurrentFont(fontId)
    applyFont(fontId)
    localStorage.setItem("preferred-font", fontId)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
        <span className="text-sm">🔤</span>
        <span className="hidden sm:inline">Font</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-64 z-50 shadow-lg">
          <CardContent className="p-3">
            <div className="space-y-2">
              <h3 className="font-medium text-sm mb-3">Choose Font Style</h3>
              {fonts.map((font) => (
                <Button
                  key={font.id}
                  variant={currentFont === font.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-between text-left h-auto p-3"
                  onClick={() => handleFontChange(font.id)}
                  style={{ fontFamily: font.family }}
                >
                  <div>
                    <div className="font-medium">{font.name}</div>
                    <div className="text-xs text-muted-foreground">The quick brown fox jumps</div>
                  </div>
                  {currentFont === font.id && <span>✓</span>}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
