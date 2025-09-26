"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

// --- helpers for rendering ---
function bionicWord(word: string): [string, string] {
  const split = Math.ceil(word.length / 2)
  return [word.slice(0, split), word.slice(split)]
}

function syllableChunks(word: string): string[] {
  return word.split(/(?<=[aeiou])/i)
}

function phonemeMarkup(word: string) {
  // simple demo coloring for vowels
  return word.split("").map((ch, i) => ({
    key: i,
    text: ch,
    className: /[aeiou]/i.test(ch) ? "text-red-500" : "",
  }))
}

export default function DyslexiaLens() {
  const [enableBionic, setEnableBionic] = useState(false)
  const [enableSyllables, setEnableSyllables] = useState(false)
  const [enablePhonemes, setEnablePhonemes] = useState(false)
  const [enableRuler, setEnableRuler] = useState(false)
  const [enableOverlay, setEnableOverlay] = useState(false)
  const [overlayColor, setOverlayColor] = useState("#fef9c3")
  const [overlayOpacity, setOverlayOpacity] = useState(50)
  const [focusBand, setFocusBand] = useState(60)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [letterSpacing, setLetterSpacing] = useState(0.5)
  const [sampleText, setSampleText] = useState(
    "Dyslexia is a common learning difference that affects reading, writing, and spelling."
  )

  // --- renderWord handles all modes ---
  function renderWord(word: string, i: number) {
    if (enablePhonemes) {
      const parts = phonemeMarkup(word)
      return (
        <span key={i} className="inline-block mr-1">
          {parts.map((p) => (
            <span key={p.key} className={p.className}>
              {p.text}
            </span>
          ))}
        </span>
      )
    }

    if (enableSyllables) {
      const chunks = syllableChunks(word)
      return (
        <span key={i} className="inline-block mr-1">
          {chunks.map((ch, idx) => (
            <span
              key={idx}
              className={idx % 2 === 0 ? "text-purple-600 font-medium" : "text-orange-600"}
            >
              {ch}
            </span>
          ))}
        </span>
      )
    }

    if (enableBionic) {
      const [bold, rest] = bionicWord(word)
      return (
        <span key={i} className="inline-block mr-1">
          <span className="font-bold">{bold}</span>
          {rest}
        </span>
      )
    }

    return (
      <span key={i} className="inline-block mr-1">
        {word}
      </span>
    )
  }

  const tokens = sampleText.split(/(\s+)/).map((t) => ({ t, w: /\S/.test(t) }))

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-semibold">Dyslexia Lens</h2>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Bionic Reading</Label>
            <Switch checked={enableBionic} onCheckedChange={setEnableBionic} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Syllable Highlighting</Label>
            <Switch checked={enableSyllables} onCheckedChange={setEnableSyllables} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Phoneme Coloring</Label>
            <Switch checked={enablePhonemes} onCheckedChange={setEnablePhonemes} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Reading Ruler</Label>
            <Switch checked={enableRuler} onCheckedChange={setEnableRuler} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Overlay</Label>
            <Switch checked={enableOverlay} onCheckedChange={setEnableOverlay} />
          </div>
        </div>

        {/* Typography Settings */}
        <div className="space-y-4">
          <div>
            <Label>Font Size: {fontSize}px</Label>
            <Slider value={[fontSize]} min={12} max={32} step={1} onValueChange={(v) => setFontSize(v[0])} />
          </div>

          <div>
            <Label>Line Height: {lineHeight}</Label>
            <Slider
              value={[lineHeight]}
              min={1.2}
              max={2}
              step={0.1}
              onValueChange={(v) => setLineHeight(v[0])}
            />
          </div>

          <div>
            <Label>Letter Spacing: {letterSpacing}px</Label>
            <Slider
              value={[letterSpacing]}
              min={0}
              max={5}
              step={0.1}
              onValueChange={(v) => setLetterSpacing(v[0])}
            />
          </div>

          {enableOverlay && (
            <>
              <div>
                <Label>Overlay Color</Label>
                <input
                  type="color"
                  value={overlayColor}
                  onChange={(e) => setOverlayColor(e.target.value)}
                  className="ml-2"
                />
              </div>

              <div>
                <Label>Overlay Opacity: {overlayOpacity}%</Label>
                <Slider
                  value={[overlayOpacity]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(v) => setOverlayOpacity(v[0])}
                />
              </div>
            </>
          )}

          {enableRuler && (
            <div>
              <Label>Focus Band Height: {focusBand}px</Label>
              <Slider value={[focusBand]} min={0} max={200} step={10} onValueChange={(v) => setFocusBand(v[0])} />
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Input & Live Preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Label className="block mb-2">Input Text</Label>
        <Textarea value={sampleText} onChange={(e) => setSampleText(e.target.value)} rows={4} />

        <h3 className="mt-6 mb-2 text-lg font-semibold">Live Preview</h3>
        <div
          className="relative p-4 border rounded-lg bg-white"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight.toString(),
            letterSpacing: `${letterSpacing}px`,
          }}
        >
          {tokens.map((tk, i) =>
            tk.w ? renderWord(tk.t, i) : <span key={i}>{tk.t}</span>
          )}

          {enableOverlay && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: overlayColor,
                opacity: overlayOpacity / 100,
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
