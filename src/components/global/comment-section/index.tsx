"use client"

import { addComment, addReply } from "@/actions/comment"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MessageSquare, Send, Loader2, Reply, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

type CommentUser = { id: string; firstname: string | null; lastname: string | null; image: string | null } | null
type ReplyType = { id: string; content: string; createdAt: Date; User: CommentUser }
type CommentType = { id: string; content: string; createdAt: Date; guestName: string | null; User: CommentUser; reply: ReplyType[] }

type Props = {
  videoId: string
  comments: CommentType[]
  currentUser: { id: string; name: string; image: string } | null
}

const Avatar = ({ image, name }: { image?: string | null; name: string }) => (
  <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-[#7320DD] flex items-center justify-center text-xs font-bold">
    {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : name[0]?.toUpperCase()}
  </div>
)

const CommentItem = ({ comment, videoId, currentUser }: { comment: CommentType; videoId: string; currentUser: Props["currentUser"] }) => {
  const router = useRouter()
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [isPending, startTransition] = useTransition()

  const displayName = comment.User ? `${comment.User.firstname ?? ""} ${comment.User.lastname ?? ""}`.trim() : (comment.guestName ?? "Anonymous")
  const avatar = comment.User?.image

  const onReply = () => {
    if (!replyText.trim() || !currentUser) return
    startTransition(async () => {
      const res = await addReply(comment.id, videoId, replyText.trim())
      if (res.status === 200) {
        setReplyText("")
        setShowReplyBox(false)
        setShowReplies(true)
        router.refresh()
      } else toast.error("Failed to post reply")
    })
  }

  return (
    <div className="flex gap-3">
      <Avatar image={avatar} name={displayName} />
      <div className="flex-1 min-w-0">
        <div className="bg-[#1d1d1d] rounded-xl px-4 py-3">
          <p className="text-sm font-medium text-white">{displayName}</p>
          <p className="text-sm text-[#ccc] mt-0.5 leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 px-1">
          <span className="text-xs text-[#555]">{new Date(comment.createdAt).toLocaleDateString()}</span>
          {currentUser && (
            <button onClick={() => setShowReplyBox(!showReplyBox)} className="text-xs text-[#9d9d9d] hover:text-white flex items-center gap-1 transition">
              <Reply size={11} /> Reply
            </button>
          )}
          {comment.reply.length > 0 && (
            <button onClick={() => setShowReplies(!showReplies)} className="text-xs text-[#9d9d9d] hover:text-white flex items-center gap-1 transition">
              {showReplies ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {comment.reply.length} {comment.reply.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Reply box */}
        {showReplyBox && (
          <div className="flex gap-2 mt-2">
            <input
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onReply()}
              placeholder="Write a reply..."
              className="flex-1 bg-[#1d1d1d] border border-[#2d2d2d] focus:border-[#7320DD] rounded-lg px-3 py-2 text-sm outline-none placeholder:text-[#555]"
            />
            <button onClick={onReply} disabled={isPending || !replyText.trim()} className="bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-lg px-3 disabled:opacity-50 transition">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        )}

        {/* Replies */}
        {showReplies && comment.reply.length > 0 && (
          <div className="mt-2 flex flex-col gap-2 pl-2 border-l border-[#2d2d2d]">
            {comment.reply.map((r) => {
              const rName = r.User ? `${r.User.firstname ?? ""} ${r.User.lastname ?? ""}`.trim() : "User"
              return (
                <div key={r.id} className="flex gap-2">
                  <Avatar image={r.User?.image} name={rName} />
                  <div className="bg-[#1d1d1d] rounded-xl px-3 py-2 flex-1">
                    <p className="text-xs font-medium">{rName}</p>
                    <p className="text-sm text-[#ccc] mt-0.5">{r.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const CommentSection = ({ videoId, comments, currentUser }: Props) => {
  const router = useRouter()
  const [text, setText] = useState("")
  const [guestName, setGuestName] = useState("")
  const [isPending, startTransition] = useTransition()

  const onSubmit = () => {
    if (!text.trim()) return
    if (!currentUser && !guestName.trim()) { toast.error("Please enter your name"); return }
    startTransition(async () => {
      const res = await addComment(videoId, text.trim(), guestName.trim() || undefined)
      if (res.status === 200) {
        setText("")
        setGuestName("")
        router.refresh()
      } else toast.error("Failed to post comment")
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare size={18} /> Comments <span className="text-[#9d9d9d] text-sm font-normal">({comments.length})</span>
      </h2>

      {/* Comment box */}
      <div className="flex flex-col gap-2">
        {!currentUser && (
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name (optional)"
            className="bg-[#1d1d1d] border border-[#2d2d2d] focus:border-[#7320DD] rounded-lg px-4 py-2.5 text-sm outline-none placeholder:text-[#555]"
          />
        )}
        <div className="flex gap-2">
          {currentUser && <Avatar image={currentUser.image} name={currentUser.name} />}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder={currentUser ? "Add a comment..." : "Add a comment as guest..."}
            className="flex-1 bg-[#1d1d1d] border border-[#2d2d2d] focus:border-[#7320DD] rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#555]"
          />
          <button
            onClick={onSubmit}
            disabled={isPending || !text.trim()}
            className="bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-xl px-4 disabled:opacity-50 transition flex items-center"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-[#555] text-sm">No comments yet. Be the first!</div>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} videoId={videoId} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection
