"use client"
// Install on personal network: npm install socket.io-client
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export const useSocket = (workspaceId: string) => {
  const router = useRouter()
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (!workspaceId) return

    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000"

    import("socket.io-client").then(({ io }) => {
      const socket = io(serverUrl, { transports: ["websocket"] })
      socketRef.current = socket

      socket.emit("join-workspace", workspaceId)

      socket.on("video-ready", ({ videoId, title }: { videoId: string; title: string }) => {
        toast.success(`Video "${title}" is ready!`)
        router.refresh()
      })

      socket.on("new-video", () => router.refresh())
      socket.on("new-folder", () => router.refresh())
      socket.on("new-member", ({ user }: any) => {
        toast.info(`${user?.firstname} joined the workspace`)
        router.refresh()
      })
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [workspaceId])

  return socketRef
}
