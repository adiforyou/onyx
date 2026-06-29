"use client"

import { inviteMember } from "@/actions/invite"
import { UserPlus, Loader2, Lock, Zap } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"

type Props = { workspaceId: string; isPro: boolean }

const InviteMember = ({ workspaceId, isPro }: Props) => {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()

  // Free user — show locked state with upgrade CTA
  if (!isPro) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-[#555]">
          <Lock size={13} />
          <span>Invite Members</span>
        </div>
        <Link
          href="/dashboard/billing"
          className="flex items-center gap-1 text-xs text-[#7320DD] hover:text-[#7320DD]/80 font-medium transition"
        >
          <Zap size={11} /> Pro
        </Link>
      </div>
    )
  }

  const onInvite = () => {
    if (!email.trim()) return
    startTransition(async () => {
      const res = await inviteMember(workspaceId, email.trim())
      if (res.status === 200) {
        toast.success("Invite sent!")
        setEmail("")
        setOpen(false)
      } else {
        toast.error((res as { message?: string }).message ?? "Failed to send invite")
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-[#9d9d9d] hover:text-white transition"
      >
        <UserPlus size={15} /> Invite Member
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2d2d2d] rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Invite to Workspace</h2>
            <p className="text-sm text-[#9d9d9d]">Enter the email of someone already signed up on Onyx.</p>
            <input
              autoFocus
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onInvite()}
              className="bg-[#1d1d1d] border border-[#2d2d2d] focus:border-[#7320DD] rounded-lg px-3 py-2.5 text-sm outline-none text-white placeholder:text-[#555]"
            />
            <div className="flex gap-2">
              <button
                onClick={onInvite}
                disabled={isPending || !email.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                Send Invite
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-[#1d1d1d] hover:bg-[#2d2d2d] text-sm text-[#9d9d9d] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InviteMember
