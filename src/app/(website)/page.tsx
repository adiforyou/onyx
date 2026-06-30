import Link from "next/link"
import { ArrowRight, Video, Brain, Users, Zap, Shield, BarChart3, Check, Circle, Folder, Bell } from "lucide-react"

const features = [
  { icon: Video, title: "Record Instantly", desc: "Screen, webcam, or both. No downloads, no setup. Just hit record." },
  { icon: Brain, title: "AI-Powered", desc: "Auto transcription, smart titles, descriptions and summaries generated instantly." },
  { icon: Users, title: "Team Workspaces", desc: "Invite teammates, share videos, collaborate in real-time." },
  { icon: Zap, title: "Instant Sharing", desc: "Share a link. Anyone can watch — no account needed." },
  { icon: BarChart3, title: "View Analytics", desc: "See who watched, when, and how many times." },
  { icon: Shield, title: "Secure Storage", desc: "Videos stored securely on Cloudflare. Fast worldwide delivery." },
]

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["5 minute video limit", "1 workspace", "AI transcription (1 free trial)", "720p recording", "Basic analytics"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Free",
    period: "during beta",
    features: ["Unlimited video length", "Unlimited workspaces", "Full AI features", "1080p recording", "Advanced analytics", "Team invites", "Priority support"],
    cta: "Request Early Access",
    highlighted: true,
  },
]

// Fake dashboard preview built with pure CSS/HTML — no image needed
const DashboardPreview = () => (
  <div className="w-full rounded-2xl border border-[#2d2d2d] overflow-hidden shadow-2xl shadow-[#7320DD]/10 bg-[#111]">
    {/* Browser chrome */}
    <div className="bg-[#0a0a0a] px-4 py-2.5 flex items-center gap-3 border-b border-[#2d2d2d]">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
      </div>
      <div className="flex-1 bg-[#1d1d1d] rounded px-3 py-1 text-xs text-[#555]">onyx.app/dashboard</div>
    </div>

    {/* App layout */}
    <div className="flex h-[420px]">
      {/* Sidebar */}
      <div className="w-48 bg-[#0d0d0d] border-r border-[#2d2d2d] p-3 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-2 p-1">
          <div className="w-5 h-5 rounded bg-[#7320DD] flex items-center justify-center text-white text-xs font-bold">O</div>
          <span className="text-white text-sm font-bold">Onyx</span>
        </div>
        <div className="bg-[#1d1d1d] rounded-lg px-2 py-1.5 text-xs text-white flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#7320DD] text-white text-[9px] flex items-center justify-center font-bold">A</div>
          Aditya&apos;s Workspace
        </div>
        {["Home", "Notifications", "Billing", "Settings"].map((item, i) => (
          <div key={item} className={`text-xs px-2 py-1.5 rounded-lg flex items-center gap-2 ${i === 0 ? "bg-[#1d1d1d] text-white" : "text-[#555]"}`}>
            <div className="w-3 h-3 rounded bg-[#2d2d2d]" />
            {item}
          </div>
        ))}
        <div className="mt-2 text-[10px] text-[#555] uppercase tracking-wider px-2">Folders</div>
        {["Product Demos", "Onboarding"].map((f) => (
          <div key={f} className="text-xs px-2 py-1 rounded-lg text-[#555] flex items-center gap-2">
            <Folder size={10} />
            {f}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-5 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-lg px-3 py-1.5 text-xs text-[#555] w-48">Search videos...</div>
          <div className="flex items-center gap-2">
            <div className="bg-[#7320DD] rounded-lg px-3 py-1.5 text-xs text-white flex items-center gap-1.5">
              <Circle size={9} className="fill-white" /> Record
            </div>
            <Bell size={14} className="text-[#555]" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7320DD] to-purple-400" />
          </div>
        </div>

        {/* Workspace title */}
        <div>
          <div className="text-white font-semibold text-sm">Aditya&apos;s Workspace</div>
          <div className="text-[#555] text-xs">2 folders · 5 videos</div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: "Product walkthrough", views: 24, color: "from-[#7320DD]/40 to-purple-900/40" },
            { title: "Team onboarding", views: 12, color: "from-blue-900/40 to-blue-600/20" },
            { title: "Feature demo v2", views: 8, color: "from-emerald-900/40 to-emerald-600/20" },
          ].map((v) => (
            <div key={v.title} className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl overflow-hidden">
              <div className={`aspect-video bg-gradient-to-br ${v.color} flex items-center justify-center`}>
                <Video size={16} className="text-white/30" />
              </div>
              <div className="p-2">
                <div className="text-white text-[10px] font-medium truncate">{v.title}</div>
                <div className="text-[#555] text-[9px] mt-0.5">{v.views} views</div>
              </div>
            </div>
          ))}
        </div>

        {/* AI badge */}
        <div className="flex items-center gap-2 bg-[#7320DD]/10 border border-[#7320DD]/20 rounded-lg px-3 py-2 w-fit">
          <Brain size={12} className="text-[#7320DD]" />
          <span className="text-[10px] text-[#a855f7]">AI generated title &amp; summary for &quot;Product walkthrough&quot;</span>
        </div>
      </div>
    </div>
  </div>
)

const Page = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2d2d2d]/50 bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7320DD] flex items-center justify-center text-white font-black text-sm">O</div>
          <span className="text-lg font-bold">Onyx</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#9d9d9d]">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/sign-in" className="text-sm text-[#9d9d9d] hover:text-white transition">Sign in</Link>
          <Link href="/auth/sign-up" className="bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-full px-4 py-2 text-sm font-medium transition">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7320DD]/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#7320DD]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-[#7320DD]/10 border border-[#7320DD]/30 rounded-full px-4 py-1.5 text-sm text-[#a855f7] mb-6">
          <Zap size={13} /> AI-Powered Video Messaging
        </div>

        <h1 className="text-5xl md:text-7xl font-black max-w-4xl leading-[1.1] mb-6 tracking-tight">
          Record. Share.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7320DD] to-[#a855f7]">
            Let AI do the rest.
          </span>
        </h1>

        <p className="text-xl text-[#9d9d9d] max-w-2xl mb-10 leading-relaxed">
          The async video tool your team will actually use. Record your screen and camera, share instantly, and let AI generate transcripts and summaries automatically.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/auth/sign-up"
            className="flex items-center gap-2 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-full px-8 py-3.5 font-semibold text-lg transition shadow-lg shadow-[#7320DD]/30"
          >
            Start for free <ArrowRight size={18} />
          </Link>
          <Link
            href="/auth/sign-in"
            className="flex items-center gap-2 border border-[#2d2d2d] hover:border-[#555] rounded-full px-8 py-3.5 text-[#9d9d9d] hover:text-white text-lg transition"
          >
            Sign in
          </Link>
        </div>

        <p className="text-sm text-[#555] mt-4">No credit card required · Free forever plan</p>

        <div className="mt-16 w-full max-w-5xl mx-auto">
          <DashboardPreview />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">Everything you need to communicate faster</h2>
          <p className="text-[#9d9d9d] text-lg max-w-xl mx-auto">Replace long meetings and back-and-forth emails with a quick video.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#111] border border-[#2d2d2d] rounded-2xl p-6 hover:border-[#7320DD]/50 transition group">
              <div className="w-10 h-10 rounded-xl bg-[#7320DD]/10 flex items-center justify-center mb-4 group-hover:bg-[#7320DD]/20 transition">
                <Icon size={20} className="text-[#7320DD]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-[#9d9d9d] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-[#9d9d9d] text-lg">Start free. Pro is free during early access — paid plan coming soon.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col gap-6 border ${
                plan.highlighted
                  ? "bg-gradient-to-b from-[#7320DD]/15 to-transparent border-[#7320DD] shadow-lg shadow-[#7320DD]/10"
                  : "bg-[#111] border-[#2d2d2d]"
              }`}
            >
              {plan.highlighted && (
                <span className="text-xs font-bold text-[#7320DD] uppercase tracking-widest">Early Access · Paid plan coming soon</span>
              )}
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-[#9d9d9d] mb-1.5 text-sm">/{plan.period}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check size={15} className="text-[#7320DD] shrink-0" />
                    <span className="text-[#ccc]">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/sign-up"
                className={`mt-auto text-center rounded-xl py-3 font-semibold transition ${
                  plan.highlighted
                    ? "bg-[#7320DD] hover:bg-[#7320DD]/80 text-white shadow-md shadow-[#7320DD]/30"
                    : "bg-[#1d1d1d] hover:bg-[#2d2d2d] text-white border border-[#2d2d2d]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#7320DD]/20 via-[#7320DD]/5 to-transparent border border-[#7320DD]/30 rounded-3xl p-14">
          <h2 className="text-4xl font-bold mb-4">Ready to record your first video?</h2>
          <p className="text-[#9d9d9d] mb-8 text-lg">Join teams using Onyx to communicate faster and smarter.</p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-full px-8 py-3.5 font-semibold text-lg transition shadow-lg shadow-[#7320DD]/30"
          >
            Get started free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2d2d2d] px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#7320DD] flex items-center justify-center text-white font-black text-xs">O</div>
          <span className="font-bold text-white">Onyx</span>
        </div>
        <p className="text-[#555] text-sm">© 2026 Onyx. All rights reserved.</p>
        <div className="flex gap-6 text-sm text-[#555]">
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>
      </footer>
    </div>
  )
}

export default Page
