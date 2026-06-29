"use client"

import { useEffect, useState } from "react"
import { VideoPasswordGate } from "@/components/global/video-password"

type Props = { videoId: string; children: React.ReactNode }

const PreviewPasswordGate = ({ videoId, children }: Props) => {
  const [unlocked, setUnlocked] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const isUnlocked = sessionStorage.getItem(`unlocked-${videoId}`) === "1"
    setUnlocked(isUnlocked)
    setChecked(true)
  }, [videoId])

  if (!checked) return null

  if (!unlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <VideoPasswordGate videoId={videoId} onUnlock={() => setUnlocked(true)} />
      </div>
    )
  }

  return <>{children}</>
}

export default PreviewPasswordGate
