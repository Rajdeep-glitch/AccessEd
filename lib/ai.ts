// Simple client-side helper to call the AI chat API
export type Role = 'user' | 'model'

export interface ChatMessage {
  role: Role
  content: string
}

export async function generateText(prompt: string, history: ChatMessage[] = []): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...history, { role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    return typeof data?.text === 'string' ? data.text : ''
  } catch {
    return ''
  }
}