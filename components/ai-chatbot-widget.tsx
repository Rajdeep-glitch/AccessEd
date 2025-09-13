"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your AI learning assistant. I'm here to help you with reading, spelling, and any questions about dyslexia learning. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Call backend API (Gemini)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // send short history for context
          messages: [...messages, userMessage].slice(-10).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.content,
          }))
        })
      })

      const data = await res.json()
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data?.text || "Sorry, I couldn't generate a response right now.",
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } catch (err) {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'There was an error contacting the AI service. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setIsTyping(false)
    }
  }

  // Deprecated: canned responses replaced by Gemini backend.
  const generateAIResponse = (_userInput: string): string => {
    return ""
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <span className="text-2xl">💬</span>
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 shadow-2xl border-0 bg-card/95 backdrop-blur-sm z-50 transition-all duration-300",
        isMinimized ? "w-80 h-16" : "w-96 h-[500px]",
      )}
      style={{ maxHeight: '80vh' }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-primary">🤖</span>
          AI Learning Assistant
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <span>⬆️</span> : <span>⬇️</span>}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <span>✕</span>
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(500px-80px)] min-h-0" style={{ maxHeight: 'calc(80vh - 80px)' }} >
          <ScrollArea className="flex-1 p-4 min-h-0">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary">🤖</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[280px] rounded-lg px-3 py-2 text-sm",
                      message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {message.content}
                  </div>
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-secondary">👤</span>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary">🤖</span>
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about learning..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} size="icon">
                <span>📤</span>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
