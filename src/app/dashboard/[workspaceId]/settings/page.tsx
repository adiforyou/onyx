import { client } from "@/lib/prisma"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { UserCog, Bell, Shield, Zap } from "lucide-react"
import Link from "next/link"
import NotificationToggles from "@/components/global/notification-toggles"

type Props = { params: Promise<{ workspaceId: string }> }

const SettingsPage = async ({ params }: Props) => {
  const { workspaceId } = await params
  const user = await currentUser()
  if (!user) redirect("/auth/sign-in")

  const dbUser = await client.user.findUnique({
    where: { clerkid: user.id },
    select: {
      firstname: true, lastname: true, email: true, image: true,
      subscription: { select: { plan: true } },
      trial: true,
      notifyOnView: true,
      notifyOnInvite: true,
    },
  })

  const isPro = dbUser?.subscription?.plan === "PRO"

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <section className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 mb-1">
          <UserCog size={16} className="text-[#7320DD]" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="flex items-center gap-4">
          {dbUser?.image ? (
            <Image src={dbUser.image} alt="avatar" width={64} height={64} className="rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#7320DD]/30 flex items-center justify-center text-2xl font-bold text-[#a78bfa]">
              {(dbUser?.firstname?.[0] ?? dbUser?.email?.[0] ?? "?").toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-lg">{dbUser?.firstname} {dbUser?.lastname}</p>
            <p className="text-sm text-[#9d9d9d]">{dbUser?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${isPro ? "bg-[#7320DD]/20 text-[#7320DD]" : "bg-[#2d2d2d] text-[#9d9d9d]"}`}>
              {isPro ? "⚡ PRO" : "FREE"}
            </span>
          </div>
        </div>
        <p className="text-sm text-[#555]">
          Profile details are managed through Clerk. Visit your{" "}
          <a href="https://accounts.clerk.dev" target="_blank" rel="noopener noreferrer" className="text-[#7320DD] hover:underline">
            account settings
          </a>{" "}
          to update your name, email or profile picture.
        </p>
      </section>

      {/* Notifications */}
      <section className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} className="text-[#7320DD]" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <NotificationToggles
          notifyOnView={dbUser?.notifyOnView ?? true}
          notifyOnInvite={dbUser?.notifyOnInvite ?? true}
        />
      </section>

      {/* AI Trial */}
      <section className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-2xl p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-[#7320DD]" />
          <h2 className="font-semibold">AI Features</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#ccc]">Free AI trial</p>
            <p className="text-xs text-[#555]">1 complimentary AI transcription for new users</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${dbUser?.trial ? "bg-green-500/20 text-green-400" : "bg-[#2d2d2d] text-[#555]"}`}>
            {dbUser?.trial ? "Available" : "Used"}
          </span>
        </div>
      </section>

      {/* Upgrade CTA */}
      {!isPro && (
        <section className="bg-[#7320DD]/10 border border-[#7320DD]/30 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold flex items-center gap-2"><Zap size={16} className="text-[#7320DD]" />Upgrade to Pro</p>
            <p className="text-sm text-[#9d9d9d] mt-1">Unlock unlimited recording, AI features &amp; team invites</p>
          </div>
          <Link
            href={`/dashboard/${workspaceId}/billing`}
            className="bg-[#7320DD] hover:bg-[#8b2ff3] text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            View Plans →
          </Link>
        </section>
      )}
    </div>
  )
}

export default SettingsPage
