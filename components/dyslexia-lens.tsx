"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Eye, Share2, Upload } from "lucide-react"

// Basic utilities
const VOWEL_RE = /[aeiouy]+/i
const DIGRAPHS = ["ch", "sh", "th", "ph", "wh", "ck", "ng", "qu"]

function splitWordsPreserve(text: string) {
  // Split while preserving spaces and newlines as tokens
  const tokens: { t: string; w: boolean }[] = []
  let buf = ""
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (/\s/.test(c)) {
      if (buf) tokens.push({ t: buf, w: true })
      tokens.push({ t: c, w: false })
      buf = ""
    } else {
      buf += c
    }
  }
  if (buf) tokens.push({ t: buf, w: true })
  return tokens
}

function bionicWord(word: string) {
  const len = word.length
  if (len <= 2) return [word, ""]
  const boldCount = Math.max(1, Math.floor(len * 0.4))
  return [word.slice(0, boldCount), word.slice(boldCount)]
}

function syllableChunks(word: string) {
  // Naive syllable heuristic: split on vowel group boundaries
  const chunks: string[] = []
  let cur = ""
  let prevVowel = false
  for (const ch of word) {
    const isV = /[aeiouy]/i.test(ch)
    if (cur && isV && !prevVowel) {
      chunks.push(cur)
      cur = ch
    } else {
      cur += ch
    }
    prevVowel = isV
  }
  if (cur) chunks.push(cur)
  return chunks
}

function phonemeMarkup(word: string) {
  const parts: { key: string; text: string; className?: string }[] = []
  let i = 0
  while (i < word.length) {
    const two = word.slice(i, i + 2).toLowerCase()
    if (DIGRAPHS.includes(two)) {
      parts.push({ key: i + "-dg", text: word.slice(i, i + 2), className: "bg-indigo-200/60 rounded px-0.5" })
      i += 2
      continue
    }
    const ch = word[i]
    const isV = /[aeiouy]/i.test(ch)
    parts.push({ key: i + "-ph", text: ch, className: isV ? "text-blue-700 font-medium" : undefined })
    i += 1
  }
  return parts
}

// Profile (preset) model
type LensProfile = {
  name: string
  enableBionic: boolean
  enableSyllables: boolean
  enablePhonemes: boolean
  overlay: string
  fontSize: number
  lineHeight: number
  letterSpacing: number
  wordSpacing: number
  focusBand: number
}

const DEFAULT_PROFILE: LensProfile = {
  name: "Default",
  enableBionic: true,
  enableSyllables: true,
  enablePhonemes: false,
  overlay: "none",
  fontSize: 18,
  lineHeight: 1.8,
  letterSpacing: 0.5,
  wordSpacing: 2,
  focusBand: 0,
}

const PRESET_DYSLEXIA: LensProfile = {
  name: "Dyslexia",
  enableBionic: true,
  enableSyllables: true,
  enablePhonemes: false,
  overlay: "dyslexic-blue",
  fontSize: 20,
  lineHeight: 1.9,
  letterSpacing: 0.6,
  wordSpacing: 3,
  focusBand: 80,
}

function loadProfiles(): LensProfile[] {
  try {
    const raw = localStorage.getItem("dyslexiaLens.profiles")
    if (!raw) return [DEFAULT_PROFILE, PRESET_DYSLEXIA]
    const arr = JSON.parse(raw) as LensProfile[]
    // ensure at least built-ins
    const names = new Set(arr.map(p => p.name))
    if (!names.has("Default")) arr.unshift(DEFAULT_PROFILE)
    if (!names.has("Dyslexia")) arr.push(PRESET_DYSLEXIA)
    return arr
  } catch {
    return [DEFAULT_PROFILE, PRESET_DYSLEXIA]
  }
}

function saveProfiles(list: LensProfile[]) {
  localStorage.setItem("dyslexiaLens.profiles", JSON.stringify(list))
}

export default function DyslexiaLens() {
  const [input, setInput] = useState<string>(
    "Paste or type any text here. This tool will transform it to be more dyslexia-friendly with multiple adjustable modes."
  )
  const [enableBionic, setEnableBionic] = useState(true)
  const [enableSyllables, setEnableSyllables] = useState(true)
  const [enablePhonemes, setEnablePhonemes] = useState(false)
  const [overlay, setOverlay] = useState<string>("none")
  const [fontSize, setFontSize] = useState<number>(18)
  const [lineHeight, setLineHeight] = useState<number>(1.8)
  const [letterSpacing, setLetterSpacing] = useState<number>(0.5)
  const [wordSpacing, setWordSpacing] = useState<number>(2)
  const [focusBand, setFocusBand] = useState<number>(0)

  const [profiles, setProfiles] = useState<LensProfile[]>(() => loadProfiles())
  const [activeProfile, setActiveProfile] = useState<string>("Default")

  const tokens = useMemo(() => splitWordsPreserve(input), [input])

  const overlayClass = useMemo(() => {
    switch (overlay) {
      case "ivory":
        return "bg-[#FFF8E7]"
      case "mint":
        return "bg-[#E9FFF4]"
      case "peach":
        return "bg-[#FFF1E6]"
      case "dyslexic-blue":
        return "bg-[#DCE8FF]"
      default:
        return "bg-background"
    }
  }, [overlay])

  function applyProfile(p: LensProfile) {
    setEnableBionic(p.enableBionic)
    setEnableSyllables(p.enableSyllables)
    setEnablePhonemes(p.enablePhonemes)
    setOverlay(p.overlay)
    setFontSize(p.fontSize)
    setLineHeight(p.lineHeight)
    setLetterSpacing(p.letterSpacing)
    setWordSpacing(p.wordSpacing)
    setFocusBand(p.focusBand)
    setActiveProfile(p.name)
  }

  function captureProfile(name: string): LensProfile {
    return {
      name,
      enableBionic,
      enableSyllables,
      enablePhonemes,
      overlay,
      fontSize,
      lineHeight,
      letterSpacing,
      wordSpacing,
      focusBand,
    }
  }

  function exportProfiles() {
    const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dyslexia-lens-profiles.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  function importProfilesFromFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as LensProfile[]
        setProfiles(parsed)
        saveProfiles(parsed)
      } catch {
        alert("Invalid profiles file.")
      }
    }
    reader.readAsText(file)
  }

  async function shareProfiles() {
    try {
      const payload = JSON.stringify(profiles)
      // Use Web Share API if available
      if ((navigator as any).share) {
        await (navigator as any).share({
          title: "Dyslexia Lens Profiles",
          text: "Here are my Dyslexia Lens profiles",
          files: [new File([payload], "dyslexia-lens-profiles.json", { type: "application/json" })],
        })
      } else {
        await navigator.clipboard.writeText(payload)
        alert("Profiles JSON copied to clipboard!")
      }
    } catch (e) {
      alert("Sharing failed. Profiles copied to clipboard instead.")
      try {
        await navigator.clipboard.writeText(JSON.stringify(profiles))
      } catch {}
    }
  }

  function saveCurrentAsProfile() {
    const name = prompt("Profile name?")?.trim()
    if (!name) return
    const p = captureProfile(name)
    const next = [...profiles.filter((x) => x.name !== name), p]
    setProfiles(next)
    saveProfiles(next)
    setActiveProfile(name)
  }

  function deleteProfile(name: string) {
    if (name === "Default" || name === "Dyslexia") return
    const next = profiles.filter((p) => p.name !== name)
    setProfiles(next)
    saveProfiles(next)
    if (activeProfile === name) setActiveProfile("Default")
  }

  const previewStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight.toString(),
    letterSpacing: `${letterSpacing}px`,
    wordSpacing: `${wordSpacing}px`,
    fontFamily:
      'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl grid place-items-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">Dyslexia Lens</h1>
            <p className="text-muted-foreground text-balance">
              Transform any text with bionic reading, syllables, phonemes, overlays, and layout controls.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Input</CardTitle>
            <CardDescription>Paste or type your content here</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} className="resize-vertical" />
            <div className="mt-3 flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.readText().then(setInput)}>
                Paste from Clipboard
              </Button>
              <Button size="sm" onClick={() => navigator.clipboard.writeText(input)}>Copy Text</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Controls</CardTitle>
            <CardDescription>Tune readability to each learner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="bionic">Bionic Reading</Label>
                  <p className="text-xs text-muted-foreground">Bold leading letters in each word</p>
                </div>
                <Switch id="bionic" checked={enableBionic} onCheckedChange={setEnableBionic} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="syllables">Syllable Highlight</Label>
                  <p className="text-xs text-muted-foreground">Alternate color syllables</p>
                </div>
                <Switch id="syllables" checked={enableSyllables} onCheckedChange={setEnableSyllables} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="phonemes">Phoneme Coloring</Label>
                  <p className="text-xs text-muted-foreground">Vowels + common digraphs</p>
                </div>
                <Switch id="phonemes" checked={enablePhonemes} onCheckedChange={setEnablePhonemes} />
              </div>

              <div>
                <Label>Overlay</Label>
                <Select value={overlay} onValueChange={setOverlay}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Overlay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ivory">Ivory</SelectItem>
                    <SelectItem value="mint">Mint</SelectItem>
                    <SelectItem value="peach">Peach</SelectItem>
                    <SelectItem value="dyslexic-blue">Dyslexic Blue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Font Size: {fontSize}px</Label>
                <Slider value={[fontSize]} min={14} max={28} step={1} onValueChange={(v) => setFontSize(v[0])} />
              </div>

              <div>
                <Label>Line Height: {lineHeight.toFixed(1)}</Label>
                <Slider value={[lineHeight]} min={1.2} max={2.2} step={0.1} onValueChange={(v) => setLineHeight(v[0])} />
              </div>

              <div>
                <Label>Letter Spacing: {letterSpacing}px</Label>
                <Slider value={[letterSpacing]} min={0} max={2} step={0.1} onValueChange={(v) => setLetterSpacing(v[0])} />
              </div>

              <div>
                <Label>Word Spacing: {wordSpacing}px</Label>
                <Slider value={[wordSpacing]} min={0} max={8} step={0.5} onValueChange={(v) => setWordSpacing(v[0])} />
              </div>

              <div>
                <Label>Focus Band Height: {focusBand}px</Label>
                <Slider value={[focusBand]} min={0} max={200} step={10} onValueChange={(v) => setFocusBand(v[0])} />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-3">
              <div className="flex gap-2 flex-wrap items-center">
                <Button onClick={() => applyProfile(PRESET_DYSLEXIA)}>One-Click Dyslexia</Button>
                <Button variant="outline" onClick={() => applyProfile(DEFAULT_PROFILE)}>Reset</Button>
              </div>

              <Separator className="my-1" />

              <div className="grid sm:grid-cols-2 gap-3 items-end">
                <div>
                  <Label>Profiles</Label>
                  <Select value={activeProfile} onValueChange={(name) => {
                    const p = profiles.find((x) => x.name === name)
                    if (p) applyProfile(p)
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => (
                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={saveCurrentAsProfile}>Save as New</Button>
                  <Button size="sm" variant="outline" onClick={() => activeProfile && deleteProfile(activeProfile)}>Delete</Button>
                  <Button size="sm" variant="outline" onClick={exportProfiles}><Share2 className="w-4 h-4 mr-2" />Export</Button>
                  <label className="inline-flex items-center gap-2 text-sm px-3 py-2 border rounded cursor-pointer bg-background hover:bg-muted">
                    <Upload className="w-4 h-4" /> Import
                    <input type="file" accept="application/json" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) importProfilesFromFile(file)
                    }} />
                  </label>
                  <Button size="sm" onClick={shareProfiles}><Share2 className="w-4 h-4 mr-2" />Share</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-balance">Preview</CardTitle>
          <CardDescription>All transformations are applied in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div id="dyslexia-lens-preview" className={`relative p-4 rounded border ${overlayClass}`} style={previewStyle}>
            {focusBand > 0 && (
              <div
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-black/5 border border-black/10 pointer-events-none"
                style={{ height: focusBand }}
              />
            )}
            <div className="prose max-w-none leading-relaxed">
              {tokens.map((tk, i) => (tk.w ? renderWord(tk.t, i) : <span key={i}>{tk.t}</span>))}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => navigator.clipboard.writeText(input)}>
              <Eye className="w-4 h-4 mr-2" />Copy Original
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText((document.getElementById("dyslexia-lens-preview")?.textContent || "").trim())}
            >
              Copy Preview Text
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  function renderWord(w: string, idx: number) {
    let content: JSX.Element = <span>{w}</span>

    if (enableBionic) {
      const [b, r] = bionicWord(w)
      content = (
        <span>
          <strong>{b}</strong>
          {r}
        </span>
      )
    }

    if (enableSyllables) {
      const chunks = syllableChunks(w)
      content = (
        <span>
          {chunks.map((c, i) => (
            <span key={i} className={i % 2 === 0 ? "bg-yellow-200/50 rounded px-0.5" : "bg-green-200/50 rounded px-0.5"}>
              {c}
            </span>
          ))}
        </span>
      )
    }

    if (enablePhonemes) {
      const parts = phonemeMarkup(w)
      content = (
        <span>
          {parts.map((p) => (
            <span key={p.key} className={p.className}>{p.text}</span>
          ))}
        </span>
      )
    }

    return (
      <span key={idx} className="inline">
        {content}
      </span>
    )
  }
}