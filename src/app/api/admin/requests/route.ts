import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const requests = await client.earlyAccessRequest.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(requests)
}
