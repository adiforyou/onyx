"use client"

import { useEffect, useState } from "react"
import { toggleReaction, getVideoReactions } from "@/actions/video"

const EMOJIS = ["👍", "❤️", "😂", "😮", "🔥", "👏"]

type Reaction = { id: string; emoji: string; count: number; videoId: string }

type Props = { videoId: string; initialReactions: Reaction[] }

const VideoReactions = ({ videoId, initialReactions }: Props) => {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions)
  const [reacted, setReacted] = useState<Set<string>>(new Set())
  const [pending, setPending] = useState<Set<string>>(new Set())

  // Load user's own reactions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`reactions-${videoId}`)
    if (stored) setReacted(new Set(JSON.parse(stored)))
  }, [videoId])

  const onReact = async (emoji: string) => {
    if (pending.has(emoji)) return
    setPending((p) => new Set(p).add(emoji))

    const hasReacted = reacted.has(emoji)
    const increment = !hasReacted

    // Optimistic update
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji)
      if (increment) {
        if (existing) return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
        return [...prev, { id: emoji, emoji, count: 1, videoId }]
      } else {
        return prev
          .map((r) => r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1) } : r)
          .filter((r) => r.count > 0)
      }
    })

    const newReacted = new Set(reacted)
    if (hasReacted) newReacted.delete(emoji)
    else newReacted.add(emoji)
    setReacted(newReacted)
    localStorage.setItem(`reactions-${videoId}`, JSON.stringify([...newReacted]))

    await toggleReaction(videoId, emoji, increment)
    setPending((p) => { const n = new Set(p); n.delete(emoji); return n })
  }

  const getCount = (emoji: string) => reactions.find((r) => r.emoji === emoji)?.count ?? 0

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {EMOJIS.map((emoji) => {
        const count = getCount(emoji)
        const active = reacted.has(emoji)
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            disabled={pending.has(emoji)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition ${
              active
                ? "bg-[#7320DD]/20 border-[#7320DD] text-white"
                : "bg-[#1d1d1d] border-[#2d2d2d] text-[#9d9d9d] hover:border-[#555] hover:text-white"
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default VideoReactions
