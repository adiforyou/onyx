"use server"

import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export const getVideoComments = async (videoId: string) => {
  try {
    const comments = await client.comment.findMany({
      where: { videoId },
      include: {
        User: { select: { id: true, firstname: true, lastname: true, image: true } },
        reply: {
          include: {
            User: { select: { id: true, firstname: true, lastname: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return { status: 200, data: comments }
  } catch {
    return { status: 500, data: [] }
  }
}

export const addComment = async (videoId: string, content: string, guestName?: string) => {
  try {
    const user = await currentUser()
    const dbUser = user
      ? await client.user.findUnique({ where: { clerkid: user.id }, select: { id: true } })
      : null

    const comment = await client.comment.create({
      data: {
        content,
        videoId,
        userId: dbUser?.id ?? null,
        guestName: !dbUser ? (guestName ?? "Anonymous") : null,
      },
      include: {
        User: { select: { id: true, firstname: true, lastname: true, image: true } },
        reply: true,
      },
    })

    revalidatePath(`/preview/${videoId}`)
    return { status: 200, data: comment }
  } catch {
    return { status: 500 }
  }
}

export const addReply = async (commentId: string, videoId: string, content: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }

    const dbUser = await client.user.findUnique({ where: { clerkid: user.id }, select: { id: true } })
    if (!dbUser) return { status: 404 }

    await client.reply.create({
      data: { content, commentId, userId: dbUser.id },
    })

    revalidatePath(`/preview/${videoId}`)
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}
