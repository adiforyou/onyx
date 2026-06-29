"use client"

import { Search, Bell, PanelLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import VideoRecorder from "@/components/global/recording"

type Props = {
  workspaceId: string
  isPro: boolean
  hasTrial: boolean
  userImageUrl: string
  userName: string
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

export default function GlobalHeader({
  workspaceId,
  isPro,
  hasTrial,
  userImageUrl,
  userName,
  onToggleSidebar,
  sidebarCollapsed,
}: Props) {
  const pathname = usePathname()

  const pageTitle = (() => {
    if (pathname.endsWith("/notifications")) return "Notifications"
    if (pathname.endsWith("/billing")) return "Billing"
    if (pathname.endsWith("/settings")) return "Settings"
    if (pathname.includes("/folder/")) return "Folder"
    if (pathname.includes("/video/")) return "Video"
    return "Home"
  })()

  return (
    <header className="h-14 border-b border-[#2d2d2d] flex items-center justify-between px-4 sticky top-0 bg-[#171717]/95 backdrop-blur-sm z-10 shrink-0 gap-4">
      {/* Left: expand button (only when collapsed) + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {sidebarCollapsed && (
          <button
            onClick={onToggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1d1d1d] text-[#9d9d9d] hover:text-white transition shrink-0"
            title="Expand sidebar"
          >
            <PanelLeft size={16} />
          </button>
        )}
        <span className="text-sm font-semibold text-white truncate">{pageTitle}</span>
      </div>

      {/* Center: search */}
      <div className="flex items-center gap-2 bg-[#1d1d1d] border border-[#2d2d2d] rounded-lg px-3 py-1.5 w-64 shrink-0">
        <Search size={14} className="text-[#555] shrink-0" />
        <input
          type="text"
          placeholder="Search videos, folders…"
          className="bg-transparent text-sm text-white placeholder:text-[#555] outline-none w-full"
        />
      </div>

      {/* Right: record, bell, avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <VideoRecorder workspaceId={workspaceId} isPro={isPro} hasTrial={hasTrial} />

        <Link
          href={`/dashboard/${workspaceId}/notifications`}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1d1d1d] text-[#9d9d9d] hover:text-white transition"
          title="Notifications"
        >
          <Bell size={16} />
        </Link>

        <Link
          href={`/dashboard/${workspaceId}/settings`}
          className="shrink-0"
          title={userName}
        >
          {userImageUrl ? (
            <Image
              src={userImageUrl}
              alt={userName || "user"}
              width={30}
              height={30}
              className="rounded-full object-cover ring-2 ring-transparent hover:ring-[#7320DD] transition"
            />
          ) : (
            <div className="w-[30px] h-[30px] rounded-full bg-[#7320DD]/30 flex items-center justify-center text-xs font-bold text-[#a78bfa]">
              {userName?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}
