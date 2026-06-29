"use client"

import { useState, useTransition } from "react"
import { Zap, X, Loader2, Send, CheckCircle } from "lucide-react"
import { toast } from "sonner"

type Props = {
  userName?: string
  userEmail?: string
}

const UpgradeButton = ({ userName = "", userEmail = "" }: Props) => {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [name, setName] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  const onSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.")
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/early-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
        })
        if (res.ok) {
          setSent(true)
        } else {
          toast.error("Failed to send request. Try again.")
        }
      } catch {
        toast.error("Something went wrong.")
      }
    })
  }

  const onClose = () => {
    setOpen(false)
    // Reset after close animation
    setTimeout(() => { setSent(false); setMessage("") }, 300)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-xl py-3 font-semibold transition w-full"
      >
        <Zap size={16} />
        Get Early Access
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2d2d2d] rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#2d2d2d]">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#7320DD]" />
                <h2 className="font-semibold">Request Early Pro Access</h2>
              </div>
              <button onClick={onClose} className="text-[#9d9d9d] hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            {sent ? (
              /* Success state */
              <div className="p-8 flex flex-col items-center gap-4 text-center">
                <CheckCircle size={48} className="text-green-400" />
                <h3 className="text-lg font-semibold">Request sent!</h3>
                <p className="text-sm text-[#9d9d9d] leading-relaxed">
                  We&apos;ve received your request. We&apos;ll review it and get back to you at <strong className="text-white">{email}</strong> within 24–48 hours.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-[#1d1d1d] hover:bg-[#2d2d2d] border border-[#2d2d2d] text-sm text-[#9d9d9d] hover:text-white rounded-xl px-6 py-2.5 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form */
              <div className="p-5 flex flex-col gap-4">
                <p className="text-sm text-[#9d9d9d] leading-relaxed">
                  Onyx Pro is in early access. Fill in your details and we&apos;ll review your request personally.
                </p>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#9d9d9d] font-medium">Your name</label>
                    <input
                      type="text"
                      placeholder="Aditya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#1d1d1d] border border-[#2d2d2d] focus:border-[#7320DD] rounded-lg px-3 py-2.5 text-sm outline-none text-white placeholder:text-[#555] transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#9d9d9d] font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#1d1d1d] border border-[#2d2d2d] focus:border-[#7320DD] rounded-lg px-3 py-2.5 text-sm outline-none text-white placeholder:text-[#555] transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#9d9d9d] font-medium">Why do you want Pro access?</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us how you plan to use Onyx, your use case, or anything else..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-[#1d1d1d] border border-[#2d2d2d] focus:border-[#7320DD] rounded-lg px-3 py-2.5 text-sm outline-none text-white placeholder:text-[#555] resize-none transition"
                    />
                  </div>
                </div>

                <button
                  onClick={onSubmit}
                  disabled={isPending || !name.trim() || !email.trim() || !message.trim()}
                  className="flex items-center justify-center gap-2 bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-xl py-3 text-sm font-semibold transition disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {isPending ? "Sending..." : "Send request"}
                </button>

                <p className="text-xs text-[#555] text-center">
                  We review every request personally and reply within 24–48 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default UpgradeButton
