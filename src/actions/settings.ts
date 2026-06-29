"use server"

import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export const updateNotificationPrefs = async (notifyOnView: boolean, notifyOnInvite: boolean) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }

    await client.user.update({
      where: { clerkid: user.id },
      data: { notifyOnView, notifyOnInvite },
    })

    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}
