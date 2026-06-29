import { client } from "@/lib/prisma"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPendingInvites } from "@/actions/invite"
import AcceptInviteButton from "@/components/global/accept-invite"
import { Bell, UserPlus } from "lucide-react"

const NotificationsPage = async () => {
  const user = await currentUser()
  if (!user) redirect("/auth/sign-in")

  const dbUser = await client.user.findUnique({
    where: { clerkid: user.id },
    select: {
      notification: { orderBy: { id: "desc" } },
    },
  })

  const invitesRes = await getPendingInvites()
  const invites = invitesRes.data ?? []

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Notifications</h1>

      {invites.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#9d9d9d] uppercase tracking-wider mb-3">Workspace Invites</h2>
          <div className="flex flex-col gap-2">
            {invites.map((invite) => (
              <div key={invite.id} className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {invite.sender?.image ? (
                    <img src={invite.sender.image} className="w-9 h-9 rounded-full" alt="" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#7320DD] flex items-center justify-center">
                      <UserPlus size={16} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{invite.sender?.firstname} {invite.sender?.lastname}</p>
                    <p className="text-xs text-[#9d9d9d]">Invited you to <span className="text-white">{invite.WorkSpace?.name}</span></p>
                  </div>
                </div>
                <AcceptInviteButton inviteId={invite.id} workspaceId={invite.WorkSpace?.id ?? ""} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-[#9d9d9d] uppercase tracking-wider mb-3">Activity</h2>
        {!dbUser?.notification?.length && invites.length === 0 ? (
          <div className="border border-dashed border-[#2d2d2d] rounded-xl p-12 flex flex-col items-center gap-2">
            <Bell size={32} className="text-[#555]" />
            <p className="text-[#9d9d9d] text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dbUser?.notification?.map((n) => (
              <div key={n.id} className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#7320DD] mt-1.5 shrink-0" />
                <p className="text-sm text-[#ccc]">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default NotificationsPage
