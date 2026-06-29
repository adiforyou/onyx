import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ skipped: true })
    }

    const { ownerEmail, ownerName, videoTitle, videoUrl, thumbnailUrl } = await req.json()

    const owner = await client.user.findUnique({
      where: { email: ownerEmail },
      select: { notifyOnView: true },
    })

    if (owner?.notifyOnView === false) {
      return NextResponse.json({ skipped: true })
    }

    const { sendFirstViewerEmail } = await import("@/lib/resend")
    await sendFirstViewerEmail({ ownerEmail, ownerName, videoTitle, videoUrl, thumbnailUrl })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Email error:", err)
    return NextResponse.json({ error: "Email failed" }, { status: 500 })
  }
}
