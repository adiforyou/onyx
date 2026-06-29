"use client"

import { renameFolder, deleteFolder } from "@/actions/workspace"
import { FolderOpen, Pencil, Trash2, Check, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition, useRef, useEffect } from "react"
import { toast } from "sonner"

type Props = {
  folder: { id: string; name: string; _count: { videos: number } }
  workspaceId: string
}

const FolderCard = ({ folder, workspaceId }: Props) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(folder.name)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const onRename = () => {
    if (!name.trim() || name === folder.name) { setEditing(false); return }
    startTransition(async () => {
      const res = await renameFolder(folder.id, name.trim())
      if (res.status === 200) {
        toast.success("Folder renamed")
        router.refresh()
      } else {
        toast.error("Failed to rename")
        setName(folder.name)
      }
      setEditing(false)
    })
  }

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await deleteFolder(folder.id)
      if (res.status === 200) {
        toast.success("Folder deleted")
        router.refresh()
      } else {
        toast.error("Failed to delete folder")
      }
    })
  }

  return (
    <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4 hover:border-[#7320DD] transition group relative">
      <Link href={`/dashboard/${workspaceId}/folder/${folder.id}`} className="flex items-center gap-3">
        <FolderOpen size={20} className="text-[#7320DD] shrink-0" />
        <div className="min-w-0 flex-1" onClick={(e) => editing && e.preventDefault()}>
          {editing ? (
            <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
              <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onRename(); if (e.key === "Escape") { setEditing(false); setName(folder.name) } }}
                className="bg-[#2d2d2d] text-white text-sm rounded px-2 py-0.5 outline-none w-full"
              />
              <button onClick={onRename} className="text-green-500 hover:text-green-400"><Check size={14} /></button>
              <button onClick={() => { setEditing(false); setName(folder.name) }} className="text-red-500 hover:text-red-400"><X size={14} /></button>
            </div>
          ) : (
            <p className="text-sm font-medium truncate">{folder.name}</p>
          )}
          <p className="text-xs text-[#9d9d9d]">{folder._count.videos} video{folder._count.videos !== 1 ? "s" : ""}</p>
        </div>
      </Link>

      {/* Actions — show on hover */}
      {!editing && (
        <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
          <button
            onClick={(e) => { e.preventDefault(); setEditing(true) }}
            className="p-1 rounded hover:bg-[#2d2d2d] text-[#9d9d9d] hover:text-white"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="p-1 rounded hover:bg-[#2d2d2d] text-[#9d9d9d] hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

export default FolderCard
