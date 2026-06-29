import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  let videoId: string | undefined

  try {
    const { userId } = await auth()
    const internalKey = req.headers.get("x-internal-key")
    const isInternal = internalKey === (process.env.INTERNAL_API_KEY ?? "onyx-internal-2025")
    if (!userId && !isInternal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    videoId = body.videoId
    const { cloudinaryPublicId } = body

    if (!videoId || !cloudinaryPublicId) {
      return NextResponse.json({ error: "Missing videoId or cloudinaryPublicId" }, { status: 400 })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${cloudinaryPublicId}`

    // Pass URL directly — Files API handles download + upload to Gemini
    const { transcribeWithGemini, generateVideoSummary } = await import("@/lib/gemini")

    const transcription = await transcribeWithGemini(videoUrl)
    const aiData = await generateVideoSummary(transcription)

    await client.video.update({
      where: { id: videoId },
      data: {
        title: aiData.title || "Untitled Video",
        description: aiData.description || "No description",
        summery: aiData.summary,
        processing: false,
      },
    })

    // Consume free trial if user is on FREE plan
    const video = await client.video.findUnique({
      where: { id: videoId },
      select: { User: { select: { id: true, subscription: { select: { plan: true } }, trial: true } } },
    })
    if (video?.User && video.User.subscription?.plan !== "PRO" && video.User.trial) {
      await client.user.update({
        where: { id: video.User.id },
        data: { trial: false },
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, transcription, ...aiData })
  } catch (err) {
    console.error("AI transcription error:", err)
    if (videoId) {
      await client.video.update({
        where: { id: videoId },
        data: { processing: false },
      }).catch(() => {})
    }
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 })
  }
}
