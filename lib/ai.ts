// Simple client-side helper to call the AI chat API
export type Role = 'user' | 'model'

export interface ChatMessage {
  role: Role
  content: string
}

export async function generateText(prompt: string, history: ChatMessage[] = []): Promise<string> {
  try {
    // If no history, use generate endpoint for single prompt content generation
    if (history.length === 0) {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      return typeof data?.text === 'string' ? data.text : ''
    } else {
      // With history, use chat endpoint
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      return typeof data?.text === 'string' ? data.text : ''
    }
  } catch {
    return ''
  }
}