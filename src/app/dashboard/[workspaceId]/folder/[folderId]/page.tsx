import { client } from "@/lib/prisma"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Video, Clock, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Props = {
  params: Promise<{ workspaceId: string; folderId: string }>
}

const FolderPage = async ({ params }: Props) => {
  const { workspaceId, folderId } = await params
  const user = await currentUser()
  if (!user) redirect("/auth/sign-in")

  const folder = await client.folder.findUnique({
    where: { id: folderId },
    include: {
      videos: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, createdAt: true,
          source: true, processing: true, views: true,
          User: { select: { firstname: true, lastname: true, image: true } },
        },
      },
    },
  })

  if (!folder) redirect(`/dashboard/${workspaceId}`)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  return (
    <div className="flex flex-col gap-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${workspaceId}`} className="text-[#9d9d9d] hover:text-white transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{folder.name}</h1>
          <p className="text-[#9d9d9d] text-sm">{folder.videos.length} video{folder.videos.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Videos */}
      {folder.videos.length === 0 ? (
        <div className="border border-dashed border-[#2d2d2d] rounded-xl p-16 flex flex-col items-center justify-center gap-2">
          <Video size={36} className="text-[#555]" />
          <p className="text-[#9d9d9d]">No videos in this folder yet</p>
          <p className="text-[#555] text-sm">Record a video and move it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folder.videos.map((video) => {
            const thumbUrl = cloudName
              ? `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_640,h_360,c_fill/${video.source}.jpg`
              : null

            return (
              <Link
                key={video.id}
                href={`/dashboard/${workspaceId}/video/${video.id}`}
                className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl overflow-hidden hover:border-[#7320DD] transition group"
              >
                <div className="aspect-video bg-[#2d2d2d] relative overflow-hidden">
                  {thumbUrl ? (
                    <img src={thumbUrl} alt={video.title ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video size={24} className="text-[#555]" />
                    </div>
                  )}
                  {video.processing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-xs text-white bg-[#7320DD] px-2 py-0.5 rounded-full">Processing</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{video.title ?? "Untitled Video"}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9d9d9d]">
                    <span className="flex items-center gap-1"><Eye size={12} />{video.views}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FolderPage
