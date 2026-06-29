import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { generateUploadUrl } from "@/lib/r2"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { filename, contentType, workspaceId, folderId } = await req.json()

    const user = await client.user.findUnique({
      where: { clerkid: userId },
      select: { id: true },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const key = `videos/${user.id}/${Date.now()}-${filename}`
    const uploadUrl = await generateUploadUrl(key, contentType)

    const video = await client.video.create({
      data: {
        source: key,
        userId: user.id,
        workSpaceId: workspaceId,
        folderId: folderId ?? null,
        processing: false,
      },
    })

    return NextResponse.json({ uploadUrl, videoId: video.id, key })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
