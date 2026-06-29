"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Props = { workspaceId: string }

const SocketProvider = ({ workspaceId }: Props) => {
  const router = useRouter()

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL
    if (!socketUrl) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let socket: any = null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import(/* webpackIgnore: true */ "socket.io-client" as any).then(({ io }: any) => {
      socket = io(socketUrl, { transports: ["websocket"] })

      socket.emit("join-workspace", workspaceId)

      socket.on("video-uploaded", (data: { title?: string }) => {
        toast.info(`New video: ${data.title ?? "Untitled"}`)
        router.refresh()
      })

      socket.on("folder-created", (data: { name?: string }) => {
        toast.info(`New folder: ${data.name ?? "Untitled"}`)
        router.refresh()
      })

      socket.on("member-joined", (data: { name?: string }) => {
        toast.info(`${data.name ?? "Someone"} joined the workspace`)
        router.refresh()
      })
    }).catch(() => {})

    return () => {
      socket?.disconnect()
    }
  }, [workspaceId, router])

  return null
}

export default SocketProvider
