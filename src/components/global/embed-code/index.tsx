"use client"

import { useState } from "react"
import { Code2, Copy, Check } from "lucide-react"

type Props = { videoId: string }

const EmbedCode = ({ videoId }: Props) => {
  const [copied, setCopied] = useState(false)
  const hostUrl = process.env.NEXT_PUBLIC_HOST_URL ?? "http://localhost:3000"
  const embedSrc = `${hostUrl}/preview/${videoId}`
  const code = `<iframe\n  src="${embedSrc}"\n  width="640"\n  height="360"\n  frameborder="0"\n  allowfullscreen\n  allow="autoplay; fullscreen"\n></iframe>`

  const onCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[#9d9d9d] uppercase tracking-wider flex items-center gap-1.5">
        <Code2 size={12} /> Embed
      </h3>
      <pre className="bg-[#111] rounded-lg p-3 text-xs text-[#9d9d9d] overflow-x-auto whitespace-pre-wrap break-all font-mono">
        {code}
      </pre>
      <button
        onClick={onCopy}
        className="flex items-center justify-center gap-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#9d9d9d] hover:text-white rounded-lg py-2 text-xs transition"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied!" : "Copy embed code"}
      </button>
    </div>
  )
}

export default EmbedCode
