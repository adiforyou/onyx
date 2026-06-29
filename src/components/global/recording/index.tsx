"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import {
  Monitor, Camera, Video, Square, Circle, Loader2, X,
  Zap, Brain, AlertTriangle, Pause, Play, Trash2, Upload, PictureInPicture,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

type RecordMode  = "screen" | "camera" | "both"
type RecordState = "idle" | "preview" | "recording" | "paused" | "review" | "processing"

type Props = { workspaceId: string; isPro: boolean; hasTrial: boolean }

const FREE_LIMIT = 300

export default function VideoRecorder({ workspaceId, isPro, hasTrial }: Props) {
  const router = useRouter()
  const [open,  setOpen]  = useState(false)
  const [mode,  setMode]  = useState<RecordMode>("screen")
  const [state, setState] = useState<RecordState>("idle")
  const [duration, setDuration] = useState(0)
  const [reviewUrl, setReviewUrl] = useState<string | null>(null)

  const screenRef        = useRef<HTMLVideoElement>(null)
  const cameraRef        = useRef<HTMLVideoElement>(null)
  const pipVideoRef      = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const reviewBlobRef    = useRef<Blob | null>(null)
  const screenStreamRef  = useRef<MediaStream | null>(null)
  const cameraStreamRef  = useRef<MediaStream | null>(null)
  const timerRef         = useRef<NodeJS.Timeout | null>(null)

  const maxDuration = isPro ? null : FREE_LIMIT
  const remaining   = maxDuration !== null ? maxDuration - duration : null
  const isNearLimit = remaining !== null && remaining <= 60 && remaining > 0
  const isAtLimit   = remaining !== null && remaining <= 0

  // Assign srcObject after React renders video elements into DOM
  useEffect(() => {
    if (state === "preview" || state === "recording" || state === "paused") {
      if (screenRef.current && screenStreamRef.current)
        screenRef.current.srcObject = screenStreamRef.current
      if (cameraRef.current && cameraStreamRef.current)
        cameraRef.current.srcObject = cameraStreamRef.current
    }
  }, [state])

  const stopAllStreams = () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop())
    screenStreamRef.current = null
    cameraStreamRef.current = null
  }

  // PiP: floating camera/screen window that follows you across tabs
  const requestPiP = async () => {
    const pip = pipVideoRef.current
    if (!pip) return
    // Prefer camera stream (show your face); fall back to screen stream
    const stream = cameraStreamRef.current || screenStreamRef.current
    if (!stream) return
    pip.srcObject = stream
    try {
      await pip.play()
      await pip.requestPictureInPicture()
    } catch {
      // PiP blocked or not supported — not critical
    }
  }

  const exitPiP = () => {
    try {
      if (document.pictureInPictureElement) document.exitPictureInPicture()
    } catch {}
  }

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const stopRecording = useCallback(() => {
    clearTimer()
    exitPiP()
    mediaRecorderRef.current?.stop()   // triggers onstop → review
    stopAllStreams()
  }, [])

  // Auto-stop at free-tier limit
  useEffect(() => {
    if (state === "recording" && isAtLimit) {
      stopRecording()
      toast.warning("5-minute limit reached. Upgrade to Pro for unlimited recording.")
    }
  }, [isAtLimit, state, stopRecording])

  // When recorder stops, move to review
  const handleRecordingStop = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" })
    reviewBlobRef.current = blob
    const url = URL.createObjectURL(blob)
    setReviewUrl(url)
    setState("review")
  }

  // Upload after review
  const handleUpload = async () => {
    const blob = reviewBlobRef.current
    if (!blob) return
    setState("processing")

    try {
      const sigRes = await fetch("/api/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      })
      if (!sigRes.ok) throw new Error("Signature failed")
      const { timestamp, signature, apiKey, cloudName, publicId, folder, videoId, hasAI } = await sigRes.json()

      const formData = new FormData()
      formData.append("file", blob, "recording.webm")
      formData.append("public_id", publicId)
      formData.append("folder", folder)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("api_key", apiKey)
      formData.append("resource_type", "video")

      const uploadRes  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, { method: "POST", body: formData })
      const uploadData = await uploadRes.json()

      if (hasAI && uploadData.public_id && videoId) {
        fetch("/api/ai/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, cloudinaryPublicId: uploadData.public_id }),
        }).catch(() => {})
      }

      toast.success("Recording saved!")
      router.refresh()
    } catch {
      toast.error("Upload failed — saving video locally instead.")
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = `recording-${Date.now()}.webm`; a.click()
      URL.revokeObjectURL(url)
    }

    cleanup()
  }

  const handleDiscard = () => {
    toast("Recording discarded.")
    cleanup()
  }

  const cleanup = () => {
    exitPiP()
    if (reviewUrl) { URL.revokeObjectURL(reviewUrl); setReviewUrl(null) }
    reviewBlobRef.current = null
    setState("idle")
    setDuration(0)
  }

  const startPreview = async () => {
    try {
      if (mode === "screen" || mode === "both") {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: { width: 1920, height: 1080 }, audio: true })
        screenStreamRef.current = screen
        screen.getVideoTracks()[0].onended = () => stopRecording()
      }
      if (mode === "camera" || mode === "both") {
        const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        cameraStreamRef.current = cam
      }
      setState("preview")
    } catch (err) {
      stopAllStreams()
      const msg = err instanceof Error ? err.message : ""
      if (msg.includes("Permission") || msg.includes("NotAllowed") || msg.includes("denied")) {
        toast.error("Permission denied. Allow screen/camera access and try again.")
      } else if (msg.includes("NotFound")) {
        toast.error("No camera or microphone found.")
      } else {
        toast.error("Could not access screen/camera.")
      }
    }
  }

  const startRecording = () => {
    let stream: MediaStream
    if (mode === "both" && screenStreamRef.current && cameraStreamRef.current) {
      stream = new MediaStream([
        ...screenStreamRef.current.getVideoTracks(),
        ...cameraStreamRef.current.getAudioTracks(),
      ])
    } else {
      stream = (screenStreamRef.current || cameraStreamRef.current)!
    }

    const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" })
    chunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = handleRecordingStop
    recorder.start(1000)
    mediaRecorderRef.current = recorder

    setState("recording")
    setOpen(false)   // close modal → floating bar takes over
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    requestPiP()
  }

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause()
    pipVideoRef.current?.pause()
    clearTimer()
    setState("paused")
  }

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume()
    pipVideoRef.current?.play()
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    setState("recording")
  }

  // Reset if modal closed mid-preview
  useEffect(() => {
    if (!open && state === "preview") {
      stopAllStreams()
      setState("idle")
      setDuration(0)
    }
  }, [open])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const modes: { value: RecordMode; icon: typeof Monitor; label: string; desc: string }[] = [
    { value: "screen", icon: Monitor, label: "Screen", desc: "Tab or window" },
    { value: "camera", icon: Camera,  label: "Camera", desc: "Webcam only"  },
    { value: "both",   icon: Video,   label: "Both",   desc: "Screen + cam" },
  ]

  const aiStatus = isPro
    ? { label: "AI enabled",  color: "text-[#7320DD] bg-[#7320DD]/10 border-[#7320DD]/30" }
    : hasTrial
    ? { label: "1 AI credit", color: "text-green-400 bg-green-500/10 border-green-500/30" }
    : { label: "No AI",       color: "text-[#555] bg-[#1d1d1d] border-[#2d2d2d]" }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Hidden video element used for Picture-in-Picture floating window */}
      <video ref={pipVideoRef} className="hidden" playsInline muted />

      {/* Trigger button */}
      <button
        onClick={() => { if (state === "idle") setOpen(true) }}
        disabled={state === "processing"}
        className="flex items-center gap-2 bg-[#7320DD] hover:bg-[#8b2ff3] disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
      >
        <Circle size={14} className="fill-white" />
        Record
      </button>

      {/* ── Floating bar: recording / paused / uploading ── */}
      {(state === "recording" || state === "paused" || state === "processing") && createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-[#111]/95 border border-[#2d2d2d] rounded-full px-5 py-3 shadow-2xl backdrop-blur-md select-none">
          {state === "processing" ? (
            <>
              <Loader2 size={16} className="animate-spin text-[#7320DD] shrink-0" />
              <span className="text-[#9d9d9d] text-sm">Uploading…</span>
            </>
          ) : (
            <>
              {/* Status dot */}
              <div className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                state === "recording" ? "bg-red-500 animate-pulse" : "bg-yellow-500"
              )} />

              {/* Timer */}
              <span className="text-white font-mono text-sm font-semibold tabular-nums w-[46px]">
                {formatTime(duration)}
              </span>

              {/* Remaining */}
              {remaining !== null && (
                <span className={cn(
                  "text-xs font-mono tabular-nums",
                  isNearLimit ? "text-red-400 font-semibold animate-pulse" : "text-[#555]"
                )}>
                  -{formatTime(Math.max(0, remaining))}
                </span>
              )}

              {state === "paused" && (
                <span className="text-xs text-yellow-500 font-semibold">PAUSED</span>
              )}

              {/* Re-open PiP if user closed it */}
              <button
                onClick={requestPiP}
                title="Float camera window"
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#2d2d2d] text-[#9d9d9d] hover:text-white transition"
              >
                <PictureInPicture size={13} />
              </button>

              <div className="w-px h-4 bg-[#2d2d2d]" />

              {/* Pause / Resume */}
              {state === "recording" ? (
                <button
                  onClick={pauseRecording}
                  title="Pause"
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#2d2d2d] text-[#9d9d9d] hover:text-white transition"
                >
                  <Pause size={13} />
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  title="Resume"
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#2d2d2d] text-[#9d9d9d] hover:text-white transition"
                >
                  <Play size={13} />
                </button>
              )}

              {/* Stop → goes to review */}
              <button
                onClick={stopRecording}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
              >
                <Square size={10} className="fill-white" />
                Stop
              </button>
            </>
          )}
        </div>,
        document.body
      )}

      {/* ── Review modal: shown after stopping ── */}
      {state === "review" && reviewUrl && createPortal(
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2d2d2d] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d2d]">
              <h2 className="font-semibold">Review Recording</h2>
              <span className="text-xs text-[#555] font-mono">{formatTime(duration)}</span>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Video preview */}
              <div className="bg-black rounded-xl overflow-hidden aspect-video">
                <video
                  src={reviewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDiscard}
                  className="flex items-center justify-center gap-2 flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#9d9d9d] hover:text-white rounded-xl py-2.5 text-sm font-medium transition"
                >
                  <Trash2 size={15} />
                  Discard
                </button>
                <button
                  onClick={handleUpload}
                  className="flex items-center justify-center gap-2 flex-[2] bg-[#7320DD] hover:bg-[#8b2ff3] text-white rounded-xl py-2.5 text-sm font-semibold transition"
                >
                  <Upload size={15} />
                  Save to Onyx
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Picker / Preview modal ── */}
      {open && createPortal(
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2d2d2d] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d2d]">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold">
                  {state === "preview" ? "Preview" : "New Recording"}
                </h2>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${aiStatus.color}`}>
                  <Brain size={10} />
                  {aiStatus.label}
                </span>
                {!isPro && state === "idle" && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-[#2d2d2d] text-[#555]">
                    Free · 5 min
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2d2d2d] text-[#9d9d9d] hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">

              {/* Free tier warning */}
              {state === "idle" && !isPro && (
                <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-[#9d9d9d]">
                    <AlertTriangle size={14} className="text-yellow-500 shrink-0" />
                    <span>5-min limit · {hasTrial ? "1 AI credit left" : "no AI credits"}</span>
                  </div>
                  <Link
                    href={`/dashboard/${workspaceId}/billing`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1 text-xs text-[#7320DD] hover:text-[#9b6dff] font-semibold whitespace-nowrap ml-3"
                  >
                    <Zap size={11} /> Upgrade
                  </Link>
                </div>
              )}

              {/* Mode selector — only in idle */}
              {state === "idle" && (
                <div>
                  <p className="text-xs text-[#555] uppercase tracking-wider font-medium mb-3">What to record</p>
                  <div className="grid grid-cols-3 gap-2">
                    {modes.map(({ value, icon: Icon, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => setMode(value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border transition",
                          mode === value
                            ? "border-[#7320DD] bg-[#7320DD]/10 text-white"
                            : "border-[#2d2d2d] text-[#9d9d9d] hover:border-[#444] hover:text-white"
                        )}
                      >
                        <Icon size={22} />
                        <div className="text-center">
                          <p className="text-xs font-semibold">{label}</p>
                          <p className="text-[10px] text-[#555] mt-0.5">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live preview — shown in preview state */}
              {state === "preview" && (
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                  {(mode === "screen" || mode === "both") && (
                    <video ref={screenRef} className="w-full h-full object-contain" autoPlay muted playsInline />
                  )}
                  {mode === "camera" && (
                    <video ref={cameraRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  )}
                  {mode === "both" && (
                    <video
                      ref={cameraRef}
                      className="absolute bottom-3 right-3 w-32 h-24 rounded-lg object-cover border-2 border-[#7320DD]"
                      autoPlay muted playsInline
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-black/60 rounded-full px-3 py-1 text-xs text-[#9d9d9d]">
                    Preview
                  </div>
                </div>
              )}

              {/* Action button */}
              {state === "idle" && (
                <button
                  onClick={startPreview}
                  className="w-full flex items-center justify-center gap-2 bg-[#7320DD] hover:bg-[#8b2ff3] text-white rounded-xl py-3 text-sm font-semibold transition"
                >
                  <Monitor size={15} />
                  Start Preview
                </button>
              )}

              {state === "preview" && (
                <button
                  onClick={startRecording}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white rounded-xl py-3 text-sm font-semibold transition"
                >
                  <Circle size={14} className="fill-white" />
                  Start Recording
                </button>
              )}

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
