"use client"

import { acceptInvite } from "@/actions/invite"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Check, X } from "lucide-react"

type Props = { inviteId: string; workspaceId: string }

const AcceptInviteButton = ({ inviteId, workspaceId }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const onAccept = () => {
    startTransition(async () => {
      const res = await acceptInvite(inviteId)
      if (res.status === 200) {
        toast.success("Joined workspace!")
        router.push(`/dashboard/${workspaceId}`)
        router.refresh()
      } else {
        toast.error("Failed to accept invite")
      }
    })
  }

  return (
    <button
      onClick={onAccept}
      disabled={isPending}
      className="flex items-center gap-1.5 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 shrink-0"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      Accept
    </button>
  )
}

export default AcceptInviteButton
