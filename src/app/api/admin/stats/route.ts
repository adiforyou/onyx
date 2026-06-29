import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret")
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [totalUsers, proUsers, totalVideos, viewsAgg, pendingRequests, totalComments] =
    await Promise.all([
      client.user.count(),
      client.subscription.count({ where: { plan: "PRO" } }),
      client.video.count(),
      client.video.aggregate({ _sum: { views: true } }),
      client.earlyAccessRequest.count({ where: { status: "pending" } }),
      client.comment.count(),
    ])

  return NextResponse.json({
    users: {
      total: totalUsers,
      pro: proUsers,
      free: totalUsers - proUsers,
    },
    videos: {
      total: totalVideos,
      totalViews: viewsAgg._sum.views ?? 0,
    },
    pendingRequests,
    totalComments,
  })
}
