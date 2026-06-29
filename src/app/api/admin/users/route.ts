import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await client.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      image: true,
      createdAt: true,
      trial: true,
      subscription: { select: { plan: true } },
      _count: { select: { videos: true } },
    },
  })

  return NextResponse.json(users)
}
