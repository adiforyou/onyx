"use client"

import { setVideoPassword } from "@/actions/video"
import { Lock, LockOpen, Eye, EyeOff, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

// ——— Owner: set/remove password ———
export const VideoPasswordSet = ({ videoId, hasPassword }: { videoId: string; hasPassword: boolean }) => {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onSet = () => {
    if (!password.trim()) return
    startTransition(async () => {
      const res = await setVideoPassword(videoId, password.trim())
      if (res.status === 200) { toast.success("Password set"); setOpen(false); setPassword("") }
      else toast.error("Failed to set password")
    })
  }

  const onRemove = () => {
    startTransition(async () => {
      const res = await setVideoPassword(videoId, null)
      if (res.status === 200) { toast.success("Password removed"); setOpen(false) }
      else toast.error("Failed to remove password")
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-xs transition px-3 py-1.5 rounded-lg border ${
          hasPassword
            ? "text-[#7320DD] border-[#7320DD]/30 bg-[#7320DD]/10 hover:bg-[#7320DD]/20"
            : "text-[#9d9d9d] hover:text-white hover:bg-[#2d2d2d] border-transparent hover:border-[#3d3d3d]"
        }`}
      >
        {hasPassword ? <Lock size={13} /> : <LockOpen size={13} />}
        {hasPassword ? "Password protected" : "Set password"}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl shadow-xl z-20 p-4 w-72 flex flex-col gap-3">
          <p className="text-sm font-medium">
            {hasPassword ? "Update or remove password" : "Protect this video with a password"}
          </p>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSet()}
              className="w-full bg-[#111] border border-[#2d2d2d] focus:border-[#7320DD] rounded-lg px-3 py-2 text-sm outline-none text-white placeholder:text-[#555] pr-9"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2.5 top-2.5 text-[#555] hover:text-[#9d9d9d]"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSet}
              disabled={isPending || !password.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-lg py-2 text-xs font-medium transition disabled:opacity-50"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
              Set password
            </button>
            {hasPassword && (
              <button
                onClick={onRemove}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs transition"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ——— Viewer: password gate ———
export const VideoPasswordGate = ({ videoId, onUnlock }: { videoId: string; onUnlock: () => void }) => {
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(false)

  const onSubmit = async () => {
    if (!password.trim()) return
    setChecking(true)
    setError("")
    try {
      const res = await fetch(`/api/video/${videoId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        sessionStorage.setItem(`unlocked-${videoId}`, "1")
        onUnlock()
      } else {
        setError("Incorrect password. Try again.")
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="w-full aspect-video bg-[#0d0d0d] border border-[#2d2d2d] rounded-2xl flex flex-col items-center justify-center gap-5 p-8">
      <Lock size={40} className="text-[#7320DD]" />
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-1">Password Protected</h2>
        <p className="text-sm text-[#9d9d9d]">Enter the password to watch this video.</p>
      </div>
      <div className="w-full max-w-xs flex flex-col gap-3">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className="w-full bg-[#1d1d1d] border border-[#2d2d2d] focus:border-[#7320DD] rounded-lg px-4 py-3 text-sm outline-none text-white placeholder:text-[#555] pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-3 text-[#555] hover:text-[#9d9d9d]"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <button
          onClick={onSubmit}
          disabled={checking || !password.trim()}
          className="flex items-center justify-center gap-2 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
        >
          {checking ? <Loader2 size={15} className="animate-spin" /> : <LockOpen size={15} />}
          Unlock video
        </button>
      </div>
    </div>
  )
}
