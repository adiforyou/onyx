"use client"

import { moveVideoToFolder } from "@/actions/video"
import { FolderInput, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

type Folder = { id: string; name: string }

type Props = {
  videoId: string
  currentFolderId: string | null
  folders: Folder[]
  workspaceId: string
}

const VideoMoveToFolder = ({ videoId, currentFolderId, folders, workspaceId }: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onMove = (folderId: string | null) => {
    if (folderId === currentFolderId) { setOpen(false); return }
    startTransition(async () => {
      const res = await moveVideoToFolder(videoId, folderId)
      if (res.status === 200) {
        toast.success(folderId ? "Video moved to folder" : "Video removed from folder")
        setOpen(false)
        router.refresh()
      } else {
        toast.error("Failed to move video")
      }
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-[#9d9d9d] hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-[#2d2d2d] border border-transparent hover:border-[#3d3d3d]"
      >
        <FolderInput size={13} />
        Move to folder
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl shadow-xl z-20 py-1 min-w-[180px]">
          <div
            onClick={() => onMove(null)}
            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition ${
              !currentFolderId ? "text-[#7320DD]" : "text-[#9d9d9d] hover:text-white hover:bg-[#2d2d2d]"
            }`}
          >
            No folder {!currentFolderId && "✓"}
          </div>
          {folders.length === 0 && (
            <p className="px-3 py-2 text-xs text-[#555]">No folders in this workspace</p>
          )}
          {folders.map((f) => (
            <div
              key={f.id}
              onClick={() => onMove(f.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition ${
                currentFolderId === f.id ? "text-[#7320DD]" : "text-[#9d9d9d] hover:text-white hover:bg-[#2d2d2d]"
              }`}
            >
              📁 {f.name} {currentFolderId === f.id && "✓"}
            </div>
          ))}
          {isPending && (
            <div className="flex justify-center py-2">
              <Loader2 size={14} className="animate-spin text-[#9d9d9d]" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoMoveToFolder
