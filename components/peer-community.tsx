"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { initialPosts, topics, members, type Post, type MediaItem } from "@/lib/data/community"
import { Lexend } from "next/font/google"
import { Image as ImageIcon, Video as VideoIcon, Heart, ThumbsUp, Share2, Smile, X } from "lucide-react"

const lexend = Lexend({ subsets: ["latin"] })

// Friendly relative time helper
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// Count total comments including one-level replies
function totalCommentsCount(comments: Post["comments"]): number {
  return comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)
}

export default function PeerCommunity() {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [newPost, setNewPost] = useState("")
  const [search, setSearch] = useState("")
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  // Upload state
  type PendingMedia = {
    id: string
    file: File
    previewUrl: string
    type: MediaItem["type"]
    caption: string
    size: number // 50-100 percent
  }
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesTag = !activeTag || p.tags.includes(activeTag)
      const hay = (p.content + " " + (p.media?.map((m) => m.caption).join(" ") || "")).toLowerCase()
      const matchesText = !search || hay.includes(search.toLowerCase())
      return matchesTag && matchesText
    })
  }, [posts, activeTag, search])

  // Drag & drop events
  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const prevent = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const onDrop = (e: DragEvent) => {
      prevent(e)
      const files = Array.from(e.dataTransfer?.files || [])
      handleFiles(files)
      el.classList.remove("ring-2", "ring-primary")
    }
    const onDragEnter = (e: DragEvent) => {
      prevent(e)
      el.classList.add("ring-2", "ring-primary")
    }
    const onDragOver = (e: DragEvent) => prevent(e)
    const onDragLeave = (e: DragEvent) => {
      prevent(e)
      el.classList.remove("ring-2", "ring-primary")
    }
    el.addEventListener("dragenter", onDragEnter)
    el.addEventListener("dragover", onDragOver)
    el.addEventListener("dragleave", onDragLeave)
    el.addEventListener("drop", onDrop)
    return () => {
      el.removeEventListener("dragenter", onDragEnter)
      el.removeEventListener("dragover", onDragOver)
      el.removeEventListener("dragleave", onDragLeave)
      el.removeEventListener("drop", onDrop)
    }
  }, [])

  function handleFiles(files: File[]) {
    const items = files
      .filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .slice(0, 4) // cap for demo
      .map((file) => {
        const type: MediaItem["type"] = file.type.startsWith("video/") ? "video" : "image"
        const previewUrl = URL.createObjectURL(file)
        return { id: `${Date.now()}_${file.name}`, file, previewUrl, type, caption: "", size: 100 }
      })
    setPendingMedia((prev) => [...prev, ...items])
  }

  function handleAddPost() {
    const content = newPost.trim()
    if (!content && pendingMedia.length === 0) return
    const author = members[0] // Demo current user from local data
    const media: MediaItem[] | undefined =
      pendingMedia.length > 0
        ? pendingMedia.map((m, idx) => ({
            id: `${m.id}_${idx}`,
            type: m.type,
            url: m.previewUrl,
            caption: m.caption || undefined,
            alt: m.caption || m.file.name,
            size: m.size,
          }))
        : undefined

    const post: Post = {
      id: `p_${Date.now()}`,
      author,
      content,
      createdAt: new Date().toISOString(),
      reactions: { likes: 0, hearts: 0, shares: 0 },
      tags: activeTag ? [activeTag] : [],
      comments: [],
      media,
    }
    setPosts([post, ...posts])
    setNewPost("")
    setPendingMedia([])
  }

  function handleReact(id: string, kind: keyof Post["reactions"]) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, reactions: { ...p.reactions, [kind]: p.reactions[kind] + 1 } } : p)),
    )
  }

  function handleAddComment(postId: string) {
    const text = (commentDrafts[postId] || "").trim()
    if (!text) return
    const comment = {
      id: `c_${Date.now()}`,
      author: members[0],
      content: text,
      createdAt: new Date().toISOString(),
    }
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)))
    setCommentDrafts((d) => ({ ...d, [postId]: "" }))
  }

  function insertEmoji(postId: string, emoji: string) {
    setCommentDrafts((d) => ({ ...d, [postId]: (d[postId] || "") + emoji }))
  }

  return (
    <div className={`${lexend.className} container mx-auto px-4 py-8`}> {/* Dyslexia-friendly font */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-balance">Peer Community</h2>
        <p className="text-muted-foreground">Connect, share, and learn with fellow students, parents, and teachers.</p>
      </div>

      <div className="grid lg:grid-cols-[240px_minmax(0,1fr)_300px] gap-6 items-start">
        {/* Left: Topics and Search */}
        <div className="hidden lg:block space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topics</CardTitle>
              <CardDescription>Filter by interest</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant={!activeTag ? "default" : "outline"} size="sm" onClick={() => setActiveTag(null)}>
                All
              </Button>
              {topics.map((t) => (
                <Button
                  key={t}
                  variant={activeTag === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTag(t)}
                >
                  {t}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search posts"
              />
            </CardContent>
          </Card>
        </div>

        {/* Center: Composer and Feed */}
        <div className="space-y-4">
          <Card className="bg-white dark:bg-neutral-900 border-primary/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Start a conversation</CardTitle>
              <CardDescription>Share tips, wins, or questions. Be kind and constructive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={activeTag ? `Share something about ${activeTag}...` : "What would you like to share?"}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                aria-label="Write a post"
                className="min-h-[90px] leading-relaxed text-[1.05rem]"
              />

              {/* Upload & Dropzone */}
              <div
                ref={dropRef}
                className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-4 transition focus-within:ring-2 focus-within:ring-primary"
                aria-label="Upload image or video by dropping files here"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                    aria-label="Upload image or video"
                  >
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                    <VideoIcon className="h-4 w-4 text-orange-500" />
                    Upload Image/Video
                  </Button>
                  <span className="text-sm text-muted-foreground">or drag & drop up to 4 items</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    hidden
                    onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                  />
                </div>

                {pendingMedia.length > 0 && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {pendingMedia.map((m) => (
                      <div key={m.id} className="rounded-lg bg-background p-3 border animate-in fade-in-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{m.type === "image" ? "Image" : "Video"}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            aria-label="Remove media"
                            onClick={() => setPendingMedia((prev) => prev.filter((x) => x.id !== m.id))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {m.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.previewUrl}
                            alt={m.caption || "Uploaded image"}
                            className="rounded-md shadow-sm mx-auto"
                            style={{ width: `${m.size}%`, maxHeight: 300, objectFit: "contain" }}
                          />
                        ) : (
                          <video
                            src={m.previewUrl}
                            className="rounded-md shadow-sm mx-auto"
                            style={{ width: `${m.size}%`, maxHeight: 320, objectFit: "contain" }}
                            controls
                          />
                        )}

                        <div className="mt-2 grid gap-2">
                          <Input
                            placeholder="Add an optional caption (alt text)"
                            value={m.caption}
                            aria-label="Media caption"
                            onChange={(e) =>
                              setPendingMedia((prev) =>
                                prev.map((x) => (x.id === m.id ? { ...x, caption: e.target.value } : x)),
                              )
                            }
                          />
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">Size</label>
                            <input
                              type="range"
                              min={50}
                              max={100}
                              step={5}
                              value={m.size}
                              aria-label="Resize media"
                              onChange={(e) =>
                                setPendingMedia((prev) =>
                                  prev.map((x) => (x.id === m.id ? { ...x, size: Number(e.target.value) } : x)),
                                )
                              }
                            />
                            <span className="text-xs text-muted-foreground w-8 text-right">{m.size}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">{activeTag && <Badge variant="secondary">#{activeTag}</Badge>}</div>
                <Button onClick={handleAddPost} disabled={!newPost.trim() && pendingMedia.length === 0}>
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">No posts yet. Be the first to share!</CardContent>
            </Card>
          ) : (
            filtered.map((post) => (
              <Card key={post.id} className="bg-card/50 animate-in fade-in-50 slide-in-from-bottom-2">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base leading-tight">{post.author.name}</CardTitle>
                      <CardDescription>
                        <span className="capitalize">{post.author.role}</span> • {relativeTime(post.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <Badge key={t} variant="outline" className="cursor-pointer" onClick={() => setActiveTag(t)}>
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {post.content && (
                    <p className="leading-relaxed whitespace-pre-wrap text-[1.05rem]">{post.content}</p>
                  )}

                  {/* Media display */}
                  {post.media && post.media.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {post.media.map((m) => (
                        <figure key={m.id} className="rounded-lg bg-muted/40 p-3">
                          {m.type === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.url}
                              alt={m.alt || m.caption || "Post image"}
                              className="rounded-md shadow-sm mx-auto"
                              style={{ width: `${m.size || 100}%`, maxHeight: 420, objectFit: "contain" }}
                            />
                          ) : (
                            <video
                              src={m.url}
                              className="rounded-md shadow-sm mx-auto"
                              style={{ width: `${m.size || 100}%`, maxHeight: 420, objectFit: "contain" }}
                              controls
                            />
                          )}
                          {(m.caption || m.alt) && (
                            <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                              {m.caption || m.alt}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}

                  {/* Engagement */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReact(post.id, "likes")}
                      aria-label="Like post"
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4 text-blue-600" /> {post.reactions.likes}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReact(post.id, "hearts")}
                      aria-label="Heart post"
                      className="flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4 text-rose-600" /> {post.reactions.hearts}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReact(post.id, "shares")}
                      aria-label="Share post"
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4 text-emerald-600" /> {post.reactions.shares}
                    </Button>
                    <Badge variant="secondary">{totalCommentsCount(post.comments)} comments</Badge>
                  </div>

                  <Separator className="my-2" />

                  {/* Comments */}
                  <div className="space-y-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="space-y-2 animate-in fade-in-50">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{c.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 rounded-md bg-muted/40 p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">{c.author.name}</p>
                              <span className="text-xs text-muted-foreground">{relativeTime(c.createdAt)}</span>
                            </div>
                            <p className="text-sm leading-loose whitespace-pre-wrap">{c.content}</p>
                          </div>
                        </div>
                        {c.replies && c.replies.length > 0 && (
                          <div className="pl-11 space-y-2">
                            {c.replies.map((r) => (
                              <div key={r.id} className="flex items-start gap-3 animate-in fade-in-50">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback>{r.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 rounded-md bg-muted/30 p-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">{r.author.name}</p>
                                    <span className="text-xs text-muted-foreground">{relativeTime(r.createdAt)}</span>
                                  </div>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add comment */}
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>Y</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          placeholder="Write a comment..."
                          value={commentDrafts[post.id] || ""}
                          onChange={(e) => setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleAddComment(post.id)
                            }
                          }}
                          aria-label="Write a comment"
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button type="button" size="icon" variant="ghost" onClick={() => insertEmoji(post.id, "👍")} aria-label="Insert thumbs up">
                              <span className="text-lg">👍</span>
                            </Button>
                            <Button type="button" size="icon" variant="ghost" onClick={() => insertEmoji(post.id, "❤️")} aria-label="Insert heart">
                              <span className="text-lg">❤️</span>
                            </Button>
                            <Button type="button" size="icon" variant="ghost" onClick={() => insertEmoji(post.id, "😊")} aria-label="Insert smile">
                              <Smile className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button size="sm" onClick={() => handleAddComment(post.id)} disabled={!((commentDrafts[post.id] || "").trim())}>
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right: Members & Highlights */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Members</CardTitle>
              <CardDescription>Say hi and share tips</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[260px] pr-3">
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{m.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-tight">{m.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Online</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-accent/10">
            <CardHeader>
              <CardTitle className="text-base">Weekly Highlights</CardTitle>
              <CardDescription>Top tips from the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>• Use color overlays to reduce visual stress while reading.</div>
              <div>• Break unfamiliar words into syllables: be-cause, to-geth-er.</div>
              <div>• Celebrate small wins—consistency beats intensity.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Guidelines</CardTitle>
              <CardDescription>Keep this space safe and supportive</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>• Be kind and respectful</div>
              <div>• No personal information</div>
              <div>• Encourage, don’t discourage</div>
              <div>• Report harmful content</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}