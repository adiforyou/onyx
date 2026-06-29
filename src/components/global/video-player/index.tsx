"use client"

import { Loader2, PlayCircle } from "lucide-react"
import { useRef, useState } from "react"

type Props = {
  src: string | null
  processing: boolean
}

const VideoPlayer = ({ src, processing }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause(); setPlaying(false) }
    else { videoRef.current.play(); setPlaying(true) }
  }

  if (processing || !src) {
    return (
      <div className="w-full aspect-video bg-[#1d1d1d] border border-[#2d2d2d] rounded-2xl flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#7320DD]" />
        <p className="text-[#9d9d9d] text-sm">
          {processing ? "Video is processing… check back shortly" : "Video not available yet"}
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group cursor-pointer" onClick={toggle}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        controls
      />
    </div>
  )
}

export default VideoPlayer
