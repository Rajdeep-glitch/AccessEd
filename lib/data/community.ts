// Community data models and mock data for the Peer Community feature

export type User = {
  id: string
  name: string // username chosen at signup
  role: "student" | "parent" | "teacher"
  avatarUrl?: string
}

export type MediaItem = {
  id: string
  type: "image" | "video"
  url: string
  caption?: string
  alt?: string
  size?: number // percentage width for rendering (e.g., 50–100)
}

export type Comment = {
  id: string
  author: User
  content: string
  createdAt: string // ISO
  replies?: Comment[]
}

export type Reactions = {
  likes: number
  hearts: number
  shares: number
}

export type Post = {
  id: string
  author: User
  content: string
  createdAt: string
  reactions: Reactions
  tags: string[]
  comments: Comment[]
  media?: MediaItem[]
}

export const topics: string[] = [
  "Reading Fluency",
  "Spelling",
  "Phonics",
  "Accommodations",
  "Study Tips",
  "Motivation",
]

export const members: User[] = [
  { id: "u1", name: "Alex", role: "student" },
  { id: "u2", name: "Maya", role: "student" },
  { id: "u3", name: "Sam", role: "teacher" },
  { id: "u4", name: "Jordan", role: "parent" },
  { id: "u5", name: "Priya", role: "student" },
]

export const initialPosts: Post[] = [
  {
    id: "p1",
    author: members[2], // Sam (teacher)
    content:
      "Quick tip: Break reading into short sprints (5–7 minutes) with a 1-minute stretch in between. Keeps focus high!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    reactions: { likes: 18, hearts: 6, shares: 2 },
    tags: ["Reading Fluency", "Study Tips"],
    media: [
      {
        id: "m1",
        type: "image",
        url: "/placeholder.jpg",
        caption: "Stretch break ideas",
        alt: "Illustration of stretch break ideas",
        size: 90,
      },
    ],
    comments: [
      {
        id: "c1",
        author: members[0],
        content: "Tried this today—felt way easier to finish my page!",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        replies: [
          {
            id: "c1_r1",
            author: members[2],
            content: "Love to hear that! Consistency is key. 💪",
            createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: "p2",
    author: members[1],
    content: "What helped you remember tricky words like 'because'? Any games or tricks?",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    reactions: { likes: 9, hearts: 3, shares: 1 },
    tags: ["Spelling"],
    comments: [
      {
        id: "c2",
        author: members[4],
        content: "I use 'big elephants can always understand small elephants'!",
        createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      },
    ],
  },
]