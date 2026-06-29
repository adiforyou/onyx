import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { incrementVideoViews } from "@/actions/video"
import { getVideoComments } from "@/actions/comment"
import VideoPlayer from "@/components/global/video-player"
import CommentSection from "@/components/global/comment-section"
import VideoShare from "@/components/global/video-share"
import EmbedCode from "@/components/global/embed-code"
import VideoReactions from "@/components/global/video-reactions"
import PreviewPasswordGate from "./password-gate"
import { Eye, Clock, Brain, Download } from "lucide-react"
import Link from "next/link"

type Props = { params: Promise<{ videoId: string }> }

const PreviewPage = async ({ params }: Props) => {
  const { videoId } = await params

  const video = await client.video.findUnique({
    where: { id: videoId },
    select: {
      id: true, title: true, description: true, source: true,
      createdAt: true, processing: true, views: true, summery: true,
      password: true,
      User: { select: { firstname: true, lastname: true, image: true, clerkid: true } },
      WorkSpace: { select: { name: true } },
      reactions: true,
    },
  })

  if (!video) redirect("/")

  const [user, commentsRes] = await Promise.all([
    currentUser(),
    getVideoComments(videoId),
    incrementVideoViews(videoId),
  ])

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const streamUrl = cloudName
    ? `https://res.cloudinary.com/${cloudName}/video/upload/${video.source}`
    : null

  const isOwner = video.User?.clerkid === user?.id
  const comments = commentsRes.data ?? []
  const isPasswordProtected = !!video.password && !isOwner

  const mainContent = (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Left — player + reactions + comments */}
      <div className="flex-1 flex flex-col gap-6">
        <VideoPlayer src={streamUrl} processing={video.processing} />

        {/* Title + meta */}
        <div>
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#9d9d9d]">
            <span className="flex items-center gap-1.5"><Eye size={14} />{video.views} views</span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />{new Date(video.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          {video.description && video.description !== "No Description" && (
            <p className="text-[#9d9d9d] mt-3 text-sm leading-relaxed">{video.description}</p>
          )}
        </div>

        {/* Reactions */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#9d9d9d] uppercase tracking-wider font-semibold">React</p>
          <VideoReactions videoId={videoId} initialReactions={video.reactions} />
        </div>

        {/* Comments */}
        <CommentSection
          videoId={videoId}
          comments={comments}
          currentUser={user ? { id: user.id, name: `${user.firstName} ${user.lastName}`, image: user.imageUrl } : null}
        />
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        {/* Creator */}
        {video.User && (
          <div className="bg-[#111] border border-[#2d2d2d] rounded-2xl p-4">
            <p className="text-xs text-[#9d9d9d] uppercase tracking-wider mb-3">Created by</p>
            <div className="flex items-center gap-3">
              {video.User.image && (
                <img src={video.User.image} alt="" className="w-10 h-10 rounded-full object-cover" />
              )}
              <div>
                <p className="font-medium text-sm">{video.User.firstname} {video.User.lastname}</p>
                {video.WorkSpace && <p className="text-xs text-[#9d9d9d]">{video.WorkSpace.name}</p>}
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {video.summery && (
          <div className="bg-[#111] border border-[#2d2d2d] rounded-2xl p-4">
            <p className="text-xs text-[#9d9d9d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Brain size={12} className="text-[#7320DD]" /> AI Summary
            </p>
            <p className="text-sm text-[#ccc] leading-relaxed">{video.summery}</p>
          </div>
        )}

        <VideoShare videoId={videoId} />
        <EmbedCode videoId={videoId} />

        {/* Download */}
        {streamUrl && (
          <a
            href={streamUrl}
            download
            className="flex items-center justify-center gap-2 bg-[#1d1d1d] hover:bg-[#2d2d2d] border border-[#2d2d2d] text-[#9d9d9d] hover:text-white rounded-xl px-4 py-2.5 text-sm transition"
          >
            <Download size={15} /> Download Video
          </a>
        )}

        {/* Sign up CTA for non-users */}
        {!user && (
          <div className="bg-gradient-to-br from-[#7320DD]/20 to-transparent border border-[#7320DD]/30 rounded-2xl p-5 text-center">
            <p className="font-semibold mb-1">Record your own videos</p>
            <p className="text-xs text-[#9d9d9d] mb-4">Screen, webcam, AI summaries — free forever.</p>
            <Link href="/auth/sign-up" className="block bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-xl py-2.5 text-sm font-medium transition">
              Get started free
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="border-b border-[#2d2d2d] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#7320DD] flex items-center justify-center text-white font-black text-xs">O</div>
          <span className="font-bold text-sm">Onyx</span>
        </Link>
        {!user && (
          <Link href="/auth/sign-up" className="bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-full px-4 py-1.5 text-sm font-medium transition">
            Sign up free
          </Link>
        )}
      </div>

      {isPasswordProtected ? (
        <PreviewPasswordGate videoId={videoId}>{mainContent}</PreviewPasswordGate>
      ) : (
        mainContent
      )}
    </div>
  )
}

export default PreviewPage
