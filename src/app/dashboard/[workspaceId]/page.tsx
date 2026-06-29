import { getAllUserVideos, getWorkspaceFolders, getWorkSpaces } from "@/actions/workspace"
import { getWorkspaceMembers } from "@/actions/invite"
import CreateFolder from "@/components/global/create-folder"
import FolderCard from "@/components/global/folders/folder-card"
import MembersPanel from "@/components/global/members-panel"
import { Video, Clock, Eye, FolderOpen } from "lucide-react"
import Link from "next/link"
import { currentUser } from "@/lib/auth"
import { client } from "@/lib/prisma"

type Props = { params: Promise<{ workspaceId: string }> }

const Page = async ({ params }: Props) => {
  const { workspaceId } = await params

  const [foldersRes, videosRes, workspacesRes, user] = await Promise.all([
    getWorkspaceFolders(workspaceId),
    getAllUserVideos(workspaceId),
    getWorkSpaces(),
    currentUser(),
  ])

  const folders = foldersRes?.data ?? []
  const videos = videosRes?.data ?? []
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const workspace = workspacesRes?.data?.workspace?.find(
    (w: { id: string; name: string; type: string }) => w.id === workspaceId
  )

  // Load members for team workspaces
  const isTeamWorkspace = workspace?.type === "PUBLIC"
  const membersRes = isTeamWorkspace ? await getWorkspaceMembers(workspaceId) : null
  const members = membersRes?.data ?? []
  const dbUser = user ? await client.user.findUnique({ where: { clerkid: user.id }, select: { id: true } }) : null
  const workspaceOwnerId = workspacesRes?.data?.workspace?.find(
    (w: { id: string }) => w.id === workspaceId
  ) ? (await client.workSpace.findUnique({ where: { id: workspaceId }, select: { userId: true } }))?.userId ?? "" : ""

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{workspace?.name ?? "Workspace"}</h1>
        <p className="text-[#9d9d9d] text-sm mt-1">
          {folders.length} folder{folders.length !== 1 ? "s" : ""} · {videos.length} video{videos.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Folders Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Folders</h2>
          <CreateFolder workspaceId={workspaceId} />
        </div>
        {folders.length === 0 ? (
          <div className="border border-dashed border-[#2d2d2d] rounded-xl p-10 flex flex-col items-center justify-center text-center gap-2">
            <FolderOpen size={32} className="text-[#555]" />
            <p className="text-[#9d9d9d] text-sm">No folders yet</p>
            <p className="text-[#555] text-xs">Click &quot;New Folder&quot; to organize your videos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {folders.map((folder: { id: string; name: string; _count: { videos: number } }) => (
              <FolderCard key={folder.id} folder={folder} workspaceId={workspaceId} />
            ))}
          </div>
        )}
      </section>

      {/* Videos Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Videos</h2>
        {videos.length === 0 ? (
          <div className="border border-dashed border-[#2d2d2d] rounded-xl p-10 flex flex-col items-center justify-center text-center gap-2">
            <Video size={32} className="text-[#555]" />
            <p className="text-[#9d9d9d] text-sm">No videos yet</p>
            <p className="text-[#555] text-xs">Record your first video to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video: {
              id: string; title: string | null; views: number; createdAt: Date;
              source: string; processing: boolean;
              Folder: { id: string; name: string } | null;
              User: { firstname: string | null; lastname: string | null; image: string | null } | null;
            }) => {
              const thumbUrl = cloudName
                ? `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_400,h_225,c_fill/${video.source}.jpg`
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
                    {video.Folder && (
                      <span className="text-xs text-[#555] mt-1 block truncate">📁 {video.Folder.name}</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
      {/* Members section for team workspaces */}
      {isTeamWorkspace && members.length > 0 && (
        <MembersPanel
          members={members as Parameters<typeof MembersPanel>[0]["members"]}
          ownerId={workspaceOwnerId}
          currentUserId={dbUser?.id ?? ""}
        />
      )}
    </div>
  )
}

export default Page
