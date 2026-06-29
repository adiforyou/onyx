import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ videoId: string }> }) {
  try {
    const { videoId } = await params
    const { password } = await req.json()

    if (!password) return NextResponse.json({ error: "Missing password" }, { status: 400 })

    const video = await client.video.findUnique({
      where: { id: videoId },
      select: { password: true },
    })

    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (!video.password) return NextResponse.json({ ok: true }) // not protected
    if (video.password !== password) return NextResponse.json({ error: "Wrong password" }, { status: 401 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
