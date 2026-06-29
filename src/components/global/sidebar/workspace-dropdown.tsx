"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Check, PlusCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Workspace = {
  id: string
  name: string
  type: string
}

type Props = {
  workspaces: Workspace[]
  memberWorkspaces: Workspace[]
  activeWorkspaceId: string
}

const WorkspaceDropdown = ({ workspaces, memberWorkspaces, activeWorkspaceId }: Props) => {
  const router = useRouter()
  const allWorkspaces = [...workspaces, ...memberWorkspaces]
  const active = allWorkspaces.find((w) => w.id === activeWorkspaceId)
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#1d1d1d] transition group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-[#7320DD] flex items-center justify-center text-xs font-bold shrink-0">
              {active?.name?.[0]?.toUpperCase() ?? "W"}
            </div>
            <span className="text-sm font-medium truncate">{active?.name ?? "Workspace"}</span>
          </div>
          <ChevronDown size={14} className="text-[#9d9d9d] shrink-0 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1d1d1d] border-[#2d2d2d] text-white" align="start">
        {workspaces.length > 0 && (
          <>
            <DropdownMenuLabel className="text-[#9d9d9d] text-xs font-normal">My Workspaces</DropdownMenuLabel>
            {workspaces.map((w) => (
              <DropdownMenuItem
                key={w.id}
                onClick={() => { router.push(`/dashboard/${w.id}`); setOpen(false) }}
                className="flex items-center justify-between cursor-pointer hover:bg-[#2d2d2d] focus:bg-[#2d2d2d]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#7320DD] flex items-center justify-center text-xs font-bold">
                    {w.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm">{w.name}</span>
                </div>
                {w.id === activeWorkspaceId && <Check size={14} className="text-[#7320DD]" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
        {memberWorkspaces.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-[#2d2d2d]" />
            <DropdownMenuLabel className="text-[#9d9d9d] text-xs font-normal">Joined Workspaces</DropdownMenuLabel>
            {memberWorkspaces.map((w) => (
              <DropdownMenuItem
                key={w.id}
                onClick={() => { router.push(`/dashboard/${w.id}`); setOpen(false) }}
                className="flex items-center justify-between cursor-pointer hover:bg-[#2d2d2d] focus:bg-[#2d2d2d]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#3d3d3d] flex items-center justify-center text-xs font-bold">
                    {w.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm">{w.name}</span>
                </div>
                {w.id === activeWorkspaceId && <Check size={14} className="text-[#7320DD]" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WorkspaceDropdown
