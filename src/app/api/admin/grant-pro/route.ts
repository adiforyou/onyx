import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-admin-secret")
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, requestId } = await req.json()
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 })

    const user = await client.user.findUnique({
      where: { email },
      select: { id: true, firstname: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 })
    }

    await client.subscription.upsert({
      where: { userId: user.id },
      update: { plan: "PRO" },
      create: { userId: user.id, plan: "PRO" },
    })

    if (requestId) {
      await client.earlyAccessRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
      })
    }

    console.log(`[grant-pro] Granted PRO to ${user.email}`)
    return NextResponse.json({ ok: true, message: `PRO granted to ${user.firstname} (${user.email})` })
  } catch (err) {
    console.error("[grant-pro]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
