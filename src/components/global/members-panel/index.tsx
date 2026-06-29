"use client"

import { removeMember } from "@/actions/workspace"
import { Loader2, UserMinus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

type Member = {
  id: string
  User: { id: string; firstname: string | null; lastname: string | null; image: string | null; email: string } | null
}

type Props = { members: Member[]; ownerId: string; currentUserId: string }

const MembersPanel = ({ members, ownerId, currentUserId }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const onRemove = (memberId: string) => {
    if (!confirm("Remove this member from the workspace?")) return
    setRemovingId(memberId)
    startTransition(async () => {
      const res = await removeMember(memberId)
      if (res.status === 200) {
        toast.success("Member removed")
        router.refresh()
      } else {
        toast.error("Failed to remove member")
      }
      setRemovingId(null)
    })
  }

  if (members.length === 0) return null

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Members</h2>
      <div className="flex flex-col gap-2">
        {members.map((m) => {
          const isOwner = m.User?.id === ownerId
          const isCurrentUser = m.User?.id === currentUserId
          const name = [m.User?.firstname, m.User?.lastname].filter(Boolean).join(" ") || "Unknown"

          return (
            <div
              key={m.id}
              className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {m.User?.image ? (
                  <img src={m.User.image} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#7320DD]/30 flex items-center justify-center text-xs shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{name}</p>
                  <p className="text-xs text-[#9d9d9d] truncate">{m.User?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isOwner && (
                  <span className="text-xs text-[#7320DD] bg-[#7320DD]/10 px-2 py-0.5 rounded-full">Owner</span>
                )}
                {!isOwner && !isCurrentUser && (
                  <button
                    onClick={() => onRemove(m.id)}
                    disabled={isPending && removingId === m.id}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#9d9d9d] hover:text-red-400 transition"
                    title="Remove member"
                  >
                    {isPending && removingId === m.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <UserMinus size={14} />
                    }
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default MembersPanel
