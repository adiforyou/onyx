"use server"

import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export const getVideoById = async (videoId: string) => {
  try {
    const video = await client.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        description: true,
        source: true,
        createdAt: true,
        processing: true,
        views: true,
        summery: true,
        User: { select: { id: true, firstname: true, lastname: true, image: true, clerkid: true } },
        WorkSpace: { select: { id: true, name: true } },
        Folder: { select: { id: true, name: true } },
      },
    })
    if (!video) return { status: 404 }
    return { status: 200, data: video }
  } catch {
    return { status: 500 }
  }
}

export const incrementVideoViews = async (videoId: string) => {
  try {
    const video = await client.video.findUnique({
      where: { id: videoId },
      select: {
        views: true, title: true, source: true,
        User: { select: { email: true, firstname: true } },
      },
    })
    if (!video) return

    await client.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } },
    })

    // Fire-and-forget to API route — keeps resend out of the page bundle
    if (video.views === 0 && video.User?.email) {
      const hostUrl = process.env.NEXT_PUBLIC_HOST_URL ?? "http://localhost:3000"
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME
      const thumbnailUrl = cloudName
        ? `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_640,h_360,c_fill/${video.source}.jpg`
        : undefined

      fetch(`${hostUrl}/api/email/first-viewer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail: video.User.email,
          ownerName: video.User.firstname ?? "there",
          videoTitle: video.title ?? "Your video",
          videoUrl: `${hostUrl}/preview/${videoId}`,
          thumbnailUrl,
        }),
      }).catch(() => {})
    }
  } catch {}
}

export const updateVideoTitle = async (videoId: string, title: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    await client.video.update({ where: { id: videoId }, data: { title } })
    revalidatePath(`/dashboard`)
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const updateVideoDescription = async (videoId: string, description: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    await client.video.update({ where: { id: videoId }, data: { description } })
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const deleteVideo = async (videoId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    await client.video.delete({ where: { id: videoId } })
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const moveVideoToFolder = async (videoId: string, folderId: string | null) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    await client.video.update({
      where: { id: videoId },
      data: { folderId: folderId ?? null },
    })
    revalidatePath("/dashboard")
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const setVideoPassword = async (videoId: string, password: string | null) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    await client.video.update({
      where: { id: videoId },
      data: { password: password ?? null },
    })
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const getVideoReactions = async (videoId: string) => {
  try {
    const reactions = await client.videoReaction.findMany({ where: { videoId } })
    return { status: 200, data: reactions }
  } catch {
    return { status: 500, data: [] }
  }
}

export const toggleReaction = async (videoId: string, emoji: string, increment: boolean) => {
  try {
    if (increment) {
      await client.videoReaction.upsert({
        where: { videoId_emoji: { videoId, emoji } },
        update: { count: { increment: 1 } },
        create: { videoId, emoji, count: 1 },
      })
    } else {
      const reaction = await client.videoReaction.findUnique({
        where: { videoId_emoji: { videoId, emoji } },
      })
      if (reaction && reaction.count > 1) {
        await client.videoReaction.update({
          where: { videoId_emoji: { videoId, emoji } },
          data: { count: { decrement: 1 } },
        })
      } else if (reaction) {
        await client.videoReaction.delete({ where: { videoId_emoji: { videoId, emoji } } })
      }
    }
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}
