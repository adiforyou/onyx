"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/global/sidebar"
import GlobalHeader from "@/components/global/header"

type Workspace = { id: string; name: string; type: string }
type Folder = { id: string; name: string; _count: { videos: number } }

type Props = {
  workspaceId: string
  workspaces: Workspace[]
  memberWorkspaces: Workspace[]
  folders: Folder[]
  plan: string
  user: { name: string; email: string; imageUrl: string }
  isPro: boolean
  hasTrial: boolean
  children: React.ReactNode
}

export default function DashboardShell({
  workspaceId,
  workspaces,
  memberWorkspaces,
  folders,
  plan,
  user,
  isPro,
  hasTrial,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed")
    setCollapsed(stored === "true")
    setMounted(true)
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem("sidebar-collapsed", String(next))
  }

  const sidebarWidth = !mounted || !collapsed ? "ml-[250px]" : "ml-16"

  return (
    <div className="flex h-screen bg-[#171717] text-white">
      <Sidebar
        workspaces={workspaces}
        memberWorkspaces={memberWorkspaces}
        folders={folders}
        activeWorkspaceId={workspaceId}
        plan={plan}
        user={user}
        collapsed={mounted ? collapsed : false}
        onToggle={toggle}
      />
      <main className={`flex-1 flex flex-col overflow-hidden transition-[margin-left] duration-300 ${sidebarWidth}`}>
        <GlobalHeader
          workspaceId={workspaceId}
          isPro={isPro}
          hasTrial={hasTrial}
          userImageUrl={user.imageUrl}
          userName={user.name}
          onToggleSidebar={toggle}
          sidebarCollapsed={mounted ? collapsed : false}
        />
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
