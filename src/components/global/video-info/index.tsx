"use client"

import { updateVideoTitle, updateVideoDescription, deleteVideo } from "@/actions/video"
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

type Video = {
  id: string
  title: string | null
  description: string | null
  WorkSpace: { id: string; name: string } | null
}

type Props = {
  video: Video
  isOwner: boolean
  workspaceId: string
}

const VideoInfo = ({ video, isOwner, workspaceId }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [title, setTitle] = useState(video.title ?? "Untitled Video")
  const [desc, setDesc] = useState(video.description ?? "")

  const saveTitle = () => {
    if (!title.trim()) return
    startTransition(async () => {
      const res = await updateVideoTitle(video.id, title.trim())
      if (res.status === 200) { toast.success("Title updated"); router.refresh() }
      else toast.error("Failed to update title")
      setEditingTitle(false)
    })
  }

  const saveDesc = () => {
    startTransition(async () => {
      const res = await updateVideoDescription(video.id, desc)
      if (res.status === 200) { toast.success("Description updated"); router.refresh() }
      else toast.error("Failed to update description")
      setEditingDesc(false)
    })
  }

  const onDelete = () => {
    if (!confirm("Delete this video? This cannot be undone.")) return
    startTransition(async () => {
      const res = await deleteVideo(video.id)
      if (res.status === 200) {
        toast.success("Video deleted")
        router.push(`/dashboard/${workspaceId}`)
      } else toast.error("Failed to delete video")
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-start gap-2 group">
        {editingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false) }}
              className="flex-1 bg-[#1d1d1d] border border-[#7320DD] text-white text-xl font-bold rounded-lg px-3 py-1.5 outline-none"
            />
            <button onClick={saveTitle} className="text-green-500"><Check size={18} /></button>
            <button onClick={() => setEditingTitle(false)} className="text-red-500"><X size={18} /></button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <h1 className="text-xl font-bold">{title}</h1>
            {isOwner && (
              <button onClick={() => setEditingTitle(true)} className="opacity-0 group-hover:opacity-100 text-[#9d9d9d] hover:text-white transition">
                <Pencil size={14} />
              </button>
            )}
          </div>
        )}
        {isOwner && !editingTitle && (
          <button onClick={onDelete} disabled={isPending} className="text-[#9d9d9d] hover:text-red-400 transition ml-auto">
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        )}
      </div>

      {/* Description */}
      <div className="group">
        {editingDesc ? (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full bg-[#1d1d1d] border border-[#7320DD] text-white text-sm rounded-lg px-3 py-2 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button onClick={saveDesc} className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400"><Check size={12} /> Save</button>
              <button onClick={() => setEditingDesc(false)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400"><X size={12} /> Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <p className="text-sm text-[#9d9d9d] flex-1">{desc || "No description"}</p>
            {isOwner && (
              <button onClick={() => setEditingDesc(true)} className="opacity-0 group-hover:opacity-100 text-[#9d9d9d] hover:text-white transition shrink-0">
                <Pencil size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoInfo
