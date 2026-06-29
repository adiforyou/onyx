import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-admin-secret")
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId } = await req.json()
    if (!requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 })

    await client.earlyAccessRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[reject]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
