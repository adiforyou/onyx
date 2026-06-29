"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { Home, Bell, CreditCard, Settings, LogOut, PanelLeftClose, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import WorkspaceDropdown from "./workspace-dropdown"
import FolderList from "./folder-list"
import InviteMember from "@/components/global/invite-member"

type Workspace = { id: string; name: string; type: string }
type Folder = { id: string; name: string; _count: { videos: number } }

type Props = {
  workspaces: Workspace[]
  memberWorkspaces: Workspace[]
  folders: Folder[]
  activeWorkspaceId: string
  plan: string
  user: { name: string; email: string; imageUrl: string }
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({
  workspaces,
  memberWorkspaces,
  folders,
  activeWorkspaceId,
  plan,
  user,
  collapsed,
  onToggle,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()

  const navItems = [
    { href: `/dashboard/${activeWorkspaceId}`, icon: Home, label: "Home", exact: true },
    { href: `/dashboard/${activeWorkspaceId}/notifications`, icon: Bell, label: "Notifications", exact: false },
    { href: `/dashboard/${activeWorkspaceId}/billing`, icon: CreditCard, label: "Billing", exact: false },
    { href: `/dashboard/${activeWorkspaceId}/settings`, icon: Settings, label: "Settings", exact: false },
  ]

  const isPro = plan === "PRO"
  const initials = user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U"

  return (
    <aside
      className={cn(
        "bg-[#111111] flex flex-col h-full fixed left-0 top-0 border-r border-[#2d2d2d] z-20 transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-[250px]"
      )}
    >
      {/* Logo row — matches header height exactly */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-[#2d2d2d] shrink-0">
        {collapsed ? (
          <Link href="/" className="w-full flex justify-center">
            <Image src="/opal-logo.svg" alt="Onyx" width={26} height={26} />
          </Link>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <Image src="/opal-logo.svg" alt="Onyx" width={26} height={26} />
              <span className="text-lg font-bold tracking-tight">Onyx</span>
            </Link>
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2d2d2d] text-[#555] hover:text-white transition shrink-0"
            >
              <PanelLeftClose size={15} />
            </button>
          </>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 flex flex-col gap-1">

          {/* Workspace switcher */}
          {!collapsed ? (
            <WorkspaceDropdown
              workspaces={workspaces}
              memberWorkspaces={memberWorkspaces}
              activeWorkspaceId={activeWorkspaceId}
            />
          ) : (
            <div className="flex justify-center py-1">
              <div
                title={[...workspaces, ...memberWorkspaces].find(w => w.id === activeWorkspaceId)?.name ?? "Workspace"}
                className="w-9 h-9 rounded-lg bg-[#7320DD]/20 border border-[#7320DD]/30 flex items-center justify-center text-xs font-bold text-[#a78bfa]"
              >
                {[...workspaces, ...memberWorkspaces].find(w => w.id === activeWorkspaceId)?.name?.[0]?.toUpperCase() ?? "W"}
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="h-px bg-[#2d2d2d] my-2 mx-1" />

          {/* Nav items */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ href, icon: Icon, label, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={label}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center rounded-lg px-2 py-2 text-sm transition-colors",
                    collapsed ? "justify-center px-0 mx-1" : "gap-3",
                    active
                      ? "bg-[#7320DD]/15 text-white"
                      : "text-[#9d9d9d] hover:bg-[#1d1d1d] hover:text-white"
                  )}
                >
                  <Icon size={16} className={active ? "text-[#7320DD] shrink-0" : "shrink-0"} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Folders — hidden when collapsed */}
          {!collapsed && (
            <div className="flex-1 overflow-y-auto mt-2 min-h-0">
              <FolderList folders={folders} workspaceId={activeWorkspaceId} />
            </div>
          )}
        </div>

        {/* Invite member */}
        {!collapsed && (
          <div className="px-2 pb-2 border-t border-[#2d2d2d] pt-2">
            <InviteMember workspaceId={activeWorkspaceId} isPro={isPro} />
          </div>
        )}

        {/* User footer */}
        <div className={cn(
          "border-t border-[#2d2d2d] p-2 shrink-0",
          collapsed ? "flex flex-col items-center gap-1" : "flex items-center gap-2"
        )}>
          {collapsed ? (
            <>
              {/* Expand button */}
              <button
                onClick={onToggle}
                title="Expand sidebar"
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#1d1d1d] text-[#555] hover:text-white transition"
              >
                <PanelLeft size={15} />
              </button>
              {/* Avatar */}
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.name || "user"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#7320DD]/30 flex items-center justify-center text-xs font-bold text-[#a78bfa]">
                  {initials}
                </div>
              )}
              {/* Logout */}
              <button
                onClick={() => signOut(() => router.push("/"))}
                title="Sign out"
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-900/20 text-[#555] hover:text-red-400 transition"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              {/* Avatar */}
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.name || "user"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#7320DD]/30 flex items-center justify-center text-xs font-bold text-[#a78bfa] shrink-0">
                  {initials}
                </div>
              )}

              {/* Name + plan */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate leading-tight">{user.name || "User"}</span>
                <span className={cn(
                  "text-xs font-medium leading-tight",
                  isPro ? "text-[#7320DD]" : "text-[#555]"
                )}>
                  {isPro ? "⚡ Pro" : "Free"}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={() => signOut(() => router.push("/"))}
                title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-900/20 text-[#555] hover:text-red-400 transition shrink-0"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
