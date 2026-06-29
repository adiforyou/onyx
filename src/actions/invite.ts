"use server"

import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export const inviteMember = async (workspaceId: string, email: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }

    const sender = await client.user.findUnique({
      where: { clerkid: user.id },
      include: { subscription: true },
    })
    if (!sender) return { status: 404 }

    if (sender.subscription?.plan !== "PRO") {
      return { status: 401, message: "Upgrade to Pro to invite team members." }
    }

    const receiver = await client.user.findUnique({ where: { email } })
    if (!receiver) return { status: 404, message: "No user found with that email. They must sign up first." }

    const existingMember = await client.member.findFirst({
      where: { userId: receiver.id, workSpaceId: workspaceId },
    })
    if (existingMember) return { status: 409, message: "User is already a member of this workspace" }

    const existingInvite = await client.invite.findFirst({
      where: { senderId: sender.id, recieverId: receiver.id, workSpaceId: workspaceId, accepted: false },
    })
    if (existingInvite) return { status: 409, message: "Invite already sent" }

    await client.invite.create({
      data: {
        senderId: sender.id,
        recieverId: receiver.id,
        workSpaceId: workspaceId,
        content: `${sender.firstname} invited you to join their workspace`,
      },
    })

    await client.notification.create({
      data: {
        userId: receiver.id,
        content: `${sender.firstname} ${sender.lastname} invited you to a workspace`,
      },
    })

    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const acceptInvite = async (inviteId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }

    const invite = await client.invite.update({
      where: { id: inviteId },
      data: { accepted: true },
      include: { reciever: true },
    })

    await client.member.create({
      data: {
        userId: invite.reciever?.id,
        workSpaceId: invite.workSpaceId!,
      },
    })

    return { status: 200, workspaceId: invite.workSpaceId }
  } catch {
    return { status: 500 }
  }
}

export const getPendingInvites = async () => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403, data: [] }

    const dbUser = await client.user.findUnique({ where: { clerkid: user.id } })
    if (!dbUser) return { status: 404, data: [] }

    const invites = await client.invite.findMany({
      where: { recieverId: dbUser.id, accepted: false },
      include: {
        sender: { select: { firstname: true, lastname: true, image: true } },
        WorkSpace: { select: { id: true, name: true } },
      },
    })

    return { status: 200, data: invites }
  } catch {
    return { status: 500, data: [] }
  }
}

export const getWorkspaceMembers = async (workspaceId: string) => {
  try {
    const members = await client.member.findMany({
      where: { workSpaceId: workspaceId },
      include: {
        User: { select: { id: true, firstname: true, lastname: true, image: true, email: true } },
      },
    })
    return { status: 200, data: members }
  } catch {
    return { status: 500, data: [] }
  }
}
