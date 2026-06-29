"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

type Stats = {
  users: { total: number; pro: number; free: number }
  videos: { total: number; totalViews: number }
  pendingRequests: number
  totalComments: number
}

type Request = {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

type User = {
  id: string
  firstname: string | null
  lastname: string | null
  email: string
  image: string | null
  createdAt: string
  trial: boolean
  subscription: { plan: string } | null
  _count: { videos: number }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState("")
  const [tab, setTab] = useState<"requests" | "users">("requests")
  const [stats, setStats] = useState<Stats | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [actionPending, setActionPending] = useState<string | null>(null)

  function getSecret() {
    return sessionStorage.getItem("admin-key") ?? ""
  }

  async function verify(secret: string) {
    const res = await fetch("/api/admin/ping", {
      headers: { "x-admin-secret": secret },
    })
    return res.ok
  }

  useEffect(() => {
    const stored = sessionStorage.getItem("admin-key")
    if (stored) {
      verify(stored).then((ok) => {
        if (ok) {
          setAuthed(true)
          loadAll(stored)
        }
        setChecking(false)
      })
    } else {
      setChecking(false)
    }
  }, [])

  async function loadAll(secret: string) {
    setLoading(true)
    try {
      const [s, r, u] = await Promise.all([
        fetch("/api/admin/stats", { headers: { "x-admin-secret": secret } }).then((x) => x.json()),
        fetch("/api/admin/requests", { headers: { "x-admin-secret": secret } }).then((x) => x.json()),
        fetch("/api/admin/users", { headers: { "x-admin-secret": secret } }).then((x) => x.json()),
      ])
      setStats(s)
      setRequests(Array.isArray(r) ? r : [])
      setUsers(Array.isArray(u) ? u : [])
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const ok = await verify(password)
    if (ok) {
      sessionStorage.setItem("admin-key", password)
      setAuthed(true)
      loadAll(password)
    } else {
      toast.error("Invalid admin secret")
    }
  }

  function logout() {
    sessionStorage.removeItem("admin-key")
    setAuthed(false)
    setStats(null)
    setRequests([])
    setUsers([])
  }

  async function grantPro(req: Request) {
    setActionPending(req.id)
    try {
      const res = await fetch("/api/admin/grant-pro", {
        method: "POST",
        headers: { "x-admin-secret": getSecret(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: req.email, requestId: req.id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message ?? "PRO granted!")
        setRequests((prev) =>
          prev.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r))
        )
        setStats((prev) =>
          prev
            ? { ...prev, users: { ...prev.users, pro: prev.users.pro + 1, free: prev.users.free - 1 }, pendingRequests: prev.pendingRequests - 1 }
            : prev
        )
        setUsers((prev) =>
          prev.map((u) =>
            u.email === req.email ? { ...u, subscription: { plan: "PRO" } } : u
          )
        )
      } else {
        toast.error(data.error ?? "Failed")
      }
    } finally {
      setActionPending(null)
    }
  }

  async function reject(req: Request) {
    setActionPending(req.id)
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "x-admin-secret": getSecret(), "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: req.id }),
      })
      if (res.ok) {
        toast.success("Request rejected")
        setRequests((prev) =>
          prev.map((r) => (r.id === req.id ? { ...r, status: "rejected" } : r))
        )
        setStats((prev) =>
          prev ? { ...prev, pendingRequests: Math.max(0, prev.pendingRequests - 1) } : prev
        )
      } else {
        toast.error("Failed to reject")
      }
    } finally {
      setActionPending(null)
    }
  }

  async function grantProByEmail(user: User) {
    setActionPending(user.id)
    try {
      const res = await fetch("/api/admin/grant-pro", {
        method: "POST",
        headers: { "x-admin-secret": getSecret(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message ?? "PRO granted!")
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, subscription: { plan: "PRO" } } : u))
        )
        setStats((prev) =>
          prev
            ? { ...prev, users: { ...prev.users, pro: prev.users.pro + 1, free: prev.users.free - 1 } }
            : prev
        )
      } else {
        toast.error(data.error ?? "Failed")
      }
    } finally {
      setActionPending(null)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#7320DD] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-8 flex flex-col gap-6"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-[#7320DD]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-[#9d9d9d] mt-1">Onyx · Restricted Access</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#9d9d9d]">Admin Secret</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin secret..."
              className="bg-[#111] border border-[#2d2d2d] rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#7320DD] transition-colors"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="bg-[#7320DD] hover:bg-[#8b2ff3] text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    )
  }

  const statCards = [
    { label: "Total Users", value: stats?.users.total ?? "—", color: "text-white" },
    { label: "Pro Users", value: stats?.users.pro ?? "—", color: "text-[#7320DD]" },
    { label: "Free Users", value: stats?.users.free ?? "—", color: "text-[#9d9d9d]" },
    { label: "Total Videos", value: stats?.videos.total ?? "—", color: "text-blue-400" },
    { label: "Total Views", value: stats?.videos.totalViews ?? "—", color: "text-green-400" },
    { label: "Pending Requests", value: stats?.pendingRequests ?? "—", color: stats?.pendingRequests ? "text-yellow-400" : "text-[#9d9d9d]" },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="border-b border-[#2d2d2d] bg-[#111] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#7320DD] rounded-lg flex items-center justify-center text-sm font-bold">O</div>
          <div>
            <h1 className="font-bold text-base leading-tight">Onyx Admin</h1>
            <p className="text-xs text-[#9d9d9d]">Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAll(getSecret())}
            className="text-xs text-[#9d9d9d] hover:text-white border border-[#2d2d2d] hover:border-[#444] rounded-lg px-3 py-1.5 transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={logout}
            className="text-xs text-red-400 hover:text-red-300 border border-[#2d2d2d] hover:border-red-800 rounded-lg px-3 py-1.5 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4">
              <p className="text-xs text-[#9d9d9d] mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>
                {loading ? <span className="inline-block w-8 h-6 bg-[#2d2d2d] rounded animate-pulse" /> : card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-1 w-fit">
          {(["requests", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? "bg-[#7320DD] text-white" : "text-[#9d9d9d] hover:text-white"
              }`}
            >
              {t === "requests" ? `Early Access (${requests.filter((r) => r.status === "pending").length})` : `Users (${users.length})`}
            </button>
          ))}
        </div>

        {/* Requests Tab */}
        {tab === "requests" && (
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2d2d2d]">
              <h2 className="font-semibold">Early Access Requests</h2>
              <p className="text-xs text-[#9d9d9d] mt-0.5">Users who requested Pro access via the billing page</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-[#7320DD] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-16 text-[#9d9d9d]">
                <p className="text-4xl mb-3">📬</p>
                <p>No requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2d2d2d] text-[#9d9d9d] text-xs">
                      <th className="px-6 py-3 text-left font-medium">Name</th>
                      <th className="px-6 py-3 text-left font-medium">Email</th>
                      <th className="px-6 py-3 text-left font-medium">Message</th>
                      <th className="px-6 py-3 text-left font-medium">Date</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                      <th className="px-6 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} className="border-b border-[#2d2d2d] hover:bg-[#1f1f1f] transition-colors">
                        <td className="px-6 py-4 font-medium">{req.name}</td>
                        <td className="px-6 py-4 text-[#9d9d9d]">{req.email}</td>
                        <td className="px-6 py-4 text-[#9d9d9d] max-w-xs">
                          <span title={req.message} className="cursor-help">
                            {req.message.length > 60 ? req.message.slice(0, 60) + "…" : req.message}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#9d9d9d] whitespace-nowrap text-xs">
                          {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-6 py-4">
                          {req.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => grantPro(req)}
                                disabled={actionPending === req.id}
                                className="bg-[#7320DD] hover:bg-[#8b2ff3] disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                              >
                                {actionPending === req.id ? "..." : "⚡ Grant Pro"}
                              </button>
                              <button
                                onClick={() => reject(req)}
                                disabled={actionPending === req.id}
                                className="bg-[#2d2d2d] hover:bg-red-900/40 hover:border-red-800 disabled:opacity-50 text-[#9d9d9d] hover:text-red-400 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border border-[#2d2d2d]"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {req.status !== "pending" && (
                            <span className="text-xs text-[#555]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2d2d2d]">
              <h2 className="font-semibold">All Users</h2>
              <p className="text-xs text-[#9d9d9d] mt-0.5">Everyone registered on Onyx</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border-2 border-[#7320DD] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 text-[#9d9d9d]">
                <p className="text-4xl mb-3">👤</p>
                <p>No users yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2d2d2d] text-[#9d9d9d] text-xs">
                      <th className="px-6 py-3 text-left font-medium">User</th>
                      <th className="px-6 py-3 text-left font-medium">Email</th>
                      <th className="px-6 py-3 text-left font-medium">Plan</th>
                      <th className="px-6 py-3 text-left font-medium">Videos</th>
                      <th className="px-6 py-3 text-left font-medium">AI Trial</th>
                      <th className="px-6 py-3 text-left font-medium">Joined</th>
                      <th className="px-6 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const plan = u.subscription?.plan ?? "FREE"
                      const name = [u.firstname, u.lastname].filter(Boolean).join(" ") || "—"
                      return (
                        <tr key={u.id} className="border-b border-[#2d2d2d] hover:bg-[#1f1f1f] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {u.image ? (
                                <img src={u.image} alt={name} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#7320DD]/30 flex items-center justify-center text-xs font-bold text-[#a78bfa]">
                                  {(u.firstname?.[0] ?? u.email[0]).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium">{name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#9d9d9d] text-xs">{u.email}</td>
                          <td className="px-6 py-4">
                            <PlanBadge plan={plan} />
                          </td>
                          <td className="px-6 py-4 text-[#9d9d9d]">{u._count.videos}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.trial ? "bg-green-900/40 text-green-400" : "bg-[#2d2d2d] text-[#555]"}`}>
                              {u.trial ? "Available" : "Used"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#9d9d9d] text-xs whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-6 py-4">
                            {plan !== "PRO" && (
                              <button
                                onClick={() => grantProByEmail(u)}
                                disabled={actionPending === u.id}
                                className="bg-[#7320DD]/20 hover:bg-[#7320DD] disabled:opacity-50 text-[#a78bfa] hover:text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border border-[#7320DD]/30"
                              >
                                {actionPending === u.id ? "..." : "⚡ Grant Pro"}
                              </button>
                            )}
                            {plan === "PRO" && <span className="text-xs text-[#555]">—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-900/40 text-yellow-400 border-yellow-800/40",
    approved: "bg-green-900/40 text-green-400 border-green-800/40",
    rejected: "bg-red-900/40 text-red-400 border-red-800/40",
  }
  const labels: Record<string, string> = {
    pending: "⏳ Pending",
    approved: "✓ Approved",
    rejected: "✕ Rejected",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] ?? "bg-[#2d2d2d] text-[#9d9d9d]"}`}>
      {labels[status] ?? status}
    </span>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  if (plan === "PRO") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-[#7320DD]/20 text-[#a78bfa] border border-[#7320DD]/30 font-semibold">
        ⚡ PRO
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-[#2d2d2d] text-[#9d9d9d]">
      FREE
    </span>
  )
}
