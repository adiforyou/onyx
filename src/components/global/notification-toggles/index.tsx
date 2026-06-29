"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateNotificationPrefs } from "@/actions/settings"

type Props = {
  notifyOnView: boolean
  notifyOnInvite: boolean
}

export default function NotificationToggles({ notifyOnView: initView, notifyOnInvite: initInvite }: Props) {
  const [notifyOnView, setNotifyOnView] = useState(initView)
  const [notifyOnInvite, setNotifyOnInvite] = useState(initInvite)
  const [saving, setSaving] = useState(false)

  const toggle = async (field: "view" | "invite") => {
    const newView = field === "view" ? !notifyOnView : notifyOnView
    const newInvite = field === "invite" ? !notifyOnInvite : notifyOnInvite

    if (field === "view") setNotifyOnView(newView)
    else setNotifyOnInvite(newInvite)

    setSaving(true)
    const result = await updateNotificationPrefs(newView, newInvite)
    setSaving(false)

    if (result.status !== 200) {
      if (field === "view") setNotifyOnView(!newView)
      else setNotifyOnInvite(!newInvite)
      toast.error("Failed to save preference")
    } else {
      toast.success("Preference saved")
    }
  }

  const prefs = [
    { key: "view" as const, label: "Email me when someone watches my video for the first time", value: notifyOnView },
    { key: "invite" as const, label: "Email me when I receive a workspace invite", value: notifyOnInvite },
  ]

  return (
    <div className="flex flex-col gap-4">
      {prefs.map(({ key, label, value }) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <p className="text-sm text-[#ccc]">{label}</p>
          <button
            onClick={() => toggle(key)}
            disabled={saving}
            aria-label={value ? "Disable" : "Enable"}
            className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${value ? "bg-[#7320DD]" : "bg-[#2d2d2d]"} disabled:opacity-60`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${value ? "right-0.5" : "left-0.5"}`} />
          </button>
        </div>
      ))}
    </div>
  )
}
