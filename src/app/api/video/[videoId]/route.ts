import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { title, description, processing, summery } = await req.json()

    const video = await client.video.update({
      where: { id: params.videoId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(processing !== undefined && { processing }),
        ...(summery !== undefined && { summery }),
      },
    })

    return NextResponse.json({ video })
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await client.video.delete({ where: { id: params.videoId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
