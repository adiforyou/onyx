"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FolderOpen, Folder, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Folder = {
  id: string
  name: string
  _count: { videos: number }
}

type Props = {
  folders: Folder[]
  workspaceId: string
}

const FolderList = ({ folders, workspaceId }: Props) => {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[#9d9d9d] text-xs font-medium uppercase tracking-wider px-2 mb-1">
        Folders
      </p>
      {folders.length === 0 ? (
        <p className="text-[#555] text-xs px-2 py-1">No folders yet</p>
      ) : (
        folders.map((folder) => {
          const href = `/dashboard/${workspaceId}/folder/${folder.id}`
          const isActive = pathname === href
          return (
            <Link
              key={folder.id}
              href={href}
              className={cn(
                "flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-[#1d1d1d] transition group",
                isActive && "bg-[#1d1d1d]"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isActive ? (
                  <FolderOpen size={16} className="text-[#7320DD] shrink-0" />
                ) : (
                  <Folder size={16} className="text-[#9d9d9d] shrink-0" />
                )}
                <span className="text-sm truncate text-[#9d9d9d] group-hover:text-white transition">
                  {folder.name}
                </span>
              </div>
              <span className="text-xs text-[#555] shrink-0">{folder._count.videos}</span>
            </Link>
          )
        })
      )}
    </div>
  )
}

export default FolderList
