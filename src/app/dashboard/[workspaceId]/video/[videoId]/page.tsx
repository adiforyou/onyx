import { getVideoById } from "@/actions/video"
import { incrementVideoViews } from "@/actions/video"
import { getWorkspaceFolders } from "@/actions/workspace"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import VideoPlayer from "@/components/global/video-player"
import VideoInfo from "@/components/global/video-info"
import VideoShare from "@/components/global/video-share"
import EmbedCode from "@/components/global/embed-code"
import VideoMoveToFolder from "@/components/global/video-move"
import { VideoPasswordSet } from "@/components/global/video-password"
import { Eye, Clock, MessageSquare } from "lucide-react"
import { client } from "@/lib/prisma"

type Props = {
  params: Promise<{ videoId: string; workspaceId: string }>
}

const VideoPage = async ({ params }: Props) => {
  const { videoId, workspaceId } = await params
  const [videoRes, user, foldersRes] = await Promise.all([
    getVideoById(videoId),
    currentUser(),
    getWorkspaceFolders(workspaceId),
  ])

  if (videoRes.status === 404) redirect(`/dashboard/${workspaceId}`)
  if (!videoRes.data) redirect(`/dashboard/${workspaceId}`)

  const video = videoRes.data
  const isOwner = video.User?.clerkid === user?.id

  await incrementVideoViews(videoId)

  const [commentCount, fullVideo] = await Promise.all([
    client.comment.count({ where: { videoId } }),
    client.video.findUnique({ where: { id: videoId }, select: { password: true, folderId: true } }),
  ])

  const streamUrl = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${video.source}`
    : null

  const folders = (foldersRes?.data ?? []).map((f: { id: string; name: string }) => ({ id: f.id, name: f.name }))

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Left — video player */}
      <div className="flex-1 flex flex-col gap-4">
        <VideoPlayer src={streamUrl} processing={video.processing} />
        <VideoInfo video={video} isOwner={isOwner} workspaceId={workspaceId} />

        {/* Owner tools row */}
        {isOwner && (
          <div className="flex items-center gap-2 flex-wrap">
            <VideoMoveToFolder
              videoId={videoId}
              currentFolderId={fullVideo?.folderId ?? null}
              folders={folders}
              workspaceId={workspaceId}
            />
            <VideoPasswordSet videoId={videoId} hasPassword={!!fullVideo?.password} />
          </div>
        )}
      </div>

      {/* Right — sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
        {/* Analytics */}
        <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 text-[#9d9d9d] uppercase tracking-wider">Analytics</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#111] rounded-lg p-3 text-center">
              <Eye size={14} className="text-[#7320DD] mx-auto mb-1" />
              <p className="text-xl font-bold">{video.views}</p>
              <p className="text-xs text-[#9d9d9d] mt-0.5">Views</p>
            </div>
            <div className="bg-[#111] rounded-lg p-3 text-center">
              <MessageSquare size={14} className="text-[#7320DD] mx-auto mb-1" />
              <p className="text-xl font-bold">{commentCount}</p>
              <p className="text-xs text-[#9d9d9d] mt-0.5">Comments</p>
            </div>
            <div className="bg-[#111] rounded-lg p-3 text-center">
              <Clock size={14} className="text-[#7320DD] mx-auto mb-1" />
              <p className="text-sm font-bold">{new Date(video.createdAt).toLocaleDateString("en", { day: "2-digit", month: "short" })}</p>
              <p className="text-xs text-[#9d9d9d] mt-0.5">Created</p>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {video.summery && (
          <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2 text-[#9d9d9d] uppercase tracking-wider">AI Summary</h3>
            <p className="text-sm text-[#ccc] leading-relaxed">{video.summery}</p>
          </div>
        )}

        {/* Creator */}
        {video.User && (
          <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 text-[#9d9d9d] uppercase tracking-wider">Created by</h3>
            <div className="flex items-center gap-3">
              {video.User.image && (
                <img src={video.User.image} alt="creator" className="w-9 h-9 rounded-full object-cover" />
              )}
              <div>
                <p className="text-sm font-medium">{video.User.firstname} {video.User.lastname}</p>
                {video.WorkSpace && <p className="text-xs text-[#9d9d9d]">{video.WorkSpace.name}</p>}
              </div>
            </div>
          </div>
        )}

        <VideoShare videoId={videoId} />
        <EmbedCode videoId={videoId} />
      </div>
    </div>
  )
}

export default VideoPage
