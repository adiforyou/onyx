import { client } from "@/lib/prisma"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Check, Zap } from "lucide-react"
import UpgradeButton from "@/components/global/upgrade-button"

const BillingPage = async () => {
  const user = await currentUser()
  if (!user) redirect("/auth/sign-in")

  const dbUser = await client.user.findUnique({
    where: { clerkid: user.id },
    select: { firstname: true, lastname: true, email: true, subscription: { select: { plan: true } } },
  })

  const plan = dbUser?.subscription?.plan ?? "FREE"
  const isPro = plan === "PRO"
  const userName = [dbUser?.firstname, dbUser?.lastname].filter(Boolean).join(" ")
  const userEmail = dbUser?.email ?? user.emailAddresses[0]?.emailAddress ?? ""

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-[#9d9d9d] text-sm mt-1">
          Current plan: <span className={isPro ? "text-[#7320DD] font-semibold" : "text-white"}>{plan}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free Plan */}
        <div className={`bg-[#1d1d1d] border rounded-2xl p-6 flex flex-col gap-4 ${!isPro ? "border-[#7320DD]" : "border-[#2d2d2d]"}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Free</h2>
            {!isPro && <span className="text-xs bg-[#7320DD]/20 text-[#7320DD] px-2 py-0.5 rounded-full">Current</span>}
          </div>
          <p className="text-3xl font-bold">$0 <span className="text-sm text-[#9d9d9d] font-normal">/month</span></p>
          <ul className="flex flex-col gap-2 text-sm text-[#9d9d9d]">
            {["5 min video limit", "1 workspace", "AI trial (1 use)", "720p recording"].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check size={14} className="text-[#555]" />{f}</li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className={`bg-[#7320DD]/10 border rounded-2xl p-6 flex flex-col gap-4 ${isPro ? "border-[#7320DD]" : "border-[#7320DD]/40"}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2"><Zap size={16} className="text-[#7320DD]" />Pro</h2>
            {isPro && <span className="text-xs bg-[#7320DD]/20 text-[#7320DD] px-2 py-0.5 rounded-full">Current</span>}
          </div>
          <div>
            <p className="text-2xl font-bold text-[#7320DD]">Early Access</p>
            <p className="text-xs text-[#9d9d9d] mt-0.5">Free during beta · paid plan coming soon</p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-[#9d9d9d]">
            {["Unlimited video length", "Unlimited workspaces", "Full AI features", "1080p recording", "Team invites", "Priority support"].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check size={14} className="text-[#7320DD]" />{f}</li>
            ))}
          </ul>
          {!isPro && <UpgradeButton userName={userName} userEmail={userEmail} />}
          {isPro && <p className="text-sm text-[#9d9d9d] text-center mt-auto">You&apos;re on Pro — enjoy all features!</p>}
        </div>
      </div>
    </div>
  )
}

export default BillingPage
