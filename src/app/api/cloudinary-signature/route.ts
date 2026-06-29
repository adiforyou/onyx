import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { generateUploadSignature } from "@/lib/cloudinary"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { workspaceId, folderId } = await req.json()

    const user = await client.user.findUnique({
      where: { clerkid: userId },
      select: { id: true, trial: true, subscription: { select: { plan: true } } },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const publicId = `${user.id}-${Date.now()}`
    const folder = "onyx-videos"
    const sig = generateUploadSignature(publicId, folder)

    const isPro = user.subscription?.plan === "PRO"
    const hasTrial = user.trial === true
    const hasAI = !!process.env.GEMINI_API_KEY && (isPro || hasTrial)

    const video = await client.video.create({
      data: {
        source: `${folder}/${publicId}`,
        userId: user.id,
        workSpaceId: workspaceId,
        folderId: folderId ?? null,
        processing: false,
      },
    })

    return NextResponse.json({ ...sig, publicId, folder, videoId: video.id, hasAI })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 })
  }
}
