import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await client.user.findUnique({
      where: { clerkid: userId },
      select: { id: true, email: true },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { createCheckoutSession } = await import("@/lib/stripe")
    const session = await createCheckoutSession(user.id, user.email)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Stripe not configured yet" }, { status: 500 })
  }
}
