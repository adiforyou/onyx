"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

type Props = { videoId: string }

const VideoShare = ({ videoId }: Props) => {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${process.env.NEXT_PUBLIC_HOST_URL ?? "http://localhost:3000"}/preview/${videoId}`

  const onCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-2 text-[#9d9d9d] uppercase tracking-wider">Share</h3>
      <div className="flex gap-2">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 bg-[#111] border border-[#2d2d2d] rounded-lg px-3 py-1.5 text-xs text-[#9d9d9d] outline-none"
        />
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-lg px-3 py-1.5 text-xs transition"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  )
}

export default VideoShare
