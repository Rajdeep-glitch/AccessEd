"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AccessibilitySettings {
  theme: "light" | "dark" | "high-contrast"
  fontSize: "small" | "medium" | "large" | "extra-large"
  dyslexicFont: boolean
  soundEnabled: boolean
  language: string
}

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    theme: "light",
    fontSize: "medium",
    dyslexicFont: false,
    soundEnabled: true,
    language: "en",
  })

  useEffect(() => {
    // Apply theme changes
    const root = document.documentElement
    root.className = root.className.replace(/\b(dark|high-contrast)\b/g, "")
    if (settings.theme !== "light") {
      root.classList.add(settings.theme)
    }

    // Apply font size changes
    root.style.fontSize = {
      small: "14px",
      medium: "16px",
      large: "18px",
      "extra-large": "20px",
    }[settings.fontSize]

    if (settings.dyslexicFont) {
      document.body.style.fontFamily = "OpenDyslexic, Comic Sans MS, Arial, sans-serif"
      // Apply to all existing elements
      const elements = document.querySelectorAll("*")
      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.fontFamily = "OpenDyslexic, Comic Sans MS, Arial, sans-serif"
        }
      })
    } else {
      document.body.style.fontFamily = "var(--font-sans)"
      // Reset font family for all elements
      const elements = document.querySelectorAll("*")
      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.fontFamily = ""
        }
      })
    }
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      {/* Accessibility Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 rounded-full w-12 h-12 p-0"
        variant="outline"
        aria-label="Open accessibility settings"
      >
        <span className="text-lg">⚙️</span>
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="fixed top-16 right-4 z-50 w-80 shadow-lg">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Accessibility Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility settings"
              >
                ×
              </Button>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="flex gap-2">
                <Button
                  variant={settings.theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting("theme", "light")}
                  className="flex-1"
                >
                  <span className="mr-1">☀️</span>
                  Light
                </Button>
                <Button
                  variant={settings.theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting("theme", "dark")}
                  className="flex-1"
                >
                  <span className="mr-1">🌙</span>
                  Dark
                </Button>
                <Button
                  variant={settings.theme === "high-contrast" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting("theme", "high-contrast")}
                  className="flex-1"
                >
                  <span className="mr-1">⚫</span>
                  High
                </Button>
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">Text Size</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSetting(
                      "fontSize",
                      settings.fontSize === "extra-large"
                        ? "large"
                        : settings.fontSize === "large"
                          ? "medium"
                          : settings.fontSize === "medium"
                            ? "small"
                            : "small",
                    )
                  }
                  disabled={settings.fontSize === "small"}
                >
                  <span>🔍➖</span>
                </Button>
                <Badge variant="outline" className="flex-1 justify-center">
                  {settings.fontSize}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSetting(
                      "fontSize",
                      settings.fontSize === "small"
                        ? "medium"
                        : settings.fontSize === "medium"
                          ? "large"
                          : settings.fontSize === "large"
                            ? "extra-large"
                            : "extra-large",
                    )
                  }
                  disabled={settings.fontSize === "extra-large"}
                >
                  <span>🔍➕</span>
                </Button>
              </div>
            </div>

            <div>
              <Button
                variant={settings.dyslexicFont ? "default" : "outline"}
                onClick={() => updateSetting("dyslexicFont", !settings.dyslexicFont)}
                className="w-full justify-start"
              >
                <span className="mr-2">🔤</span>
                {settings.dyslexicFont ? "Using Dyslexic Font" : "Enable Dyslexic Font"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1 px-2">
                Switches entire app to dyslexia-friendly typography
              </p>
            </div>

            {/* Sound Toggle */}
            <div>
              <Button
                variant={settings.soundEnabled ? "default" : "outline"}
                onClick={() => updateSetting("soundEnabled", !settings.soundEnabled)}
                className="w-full justify-start"
              >
                {settings.soundEnabled ? <span className="mr-2">🔊</span> : <span className="mr-2">🔇</span>}
                Sound Effects
              </Button>
            </div>

            {/* Language Selection */}
            <div>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <span className="mr-2">🌐</span>
                Language: English
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
