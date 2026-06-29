"use client"

import { createFolder } from "@/actions/workspace"
import { FolderPlus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

type Props = {
  workspaceId: string
}

const CreateFolder = ({ workspaceId }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const onCreate = () => {
    startTransition(async () => {
      const res = await createFolder(workspaceId)
      if (res.status === 200) {
        toast.success("Folder created")
        router.refresh()
      } else {
        toast.error("Failed to create folder")
      }
    })
  }

  return (
    <button
      onClick={onCreate}
      disabled={isPending}
      className="flex items-center gap-2 bg-[#1d1d1d] border border-[#2d2d2d] hover:border-[#7320DD] text-[#9d9d9d] hover:text-white rounded-lg px-3 py-2 text-sm transition disabled:opacity-50"
    >
      {isPending ? <Loader2 size={15} className="animate-spin" /> : <FolderPlus size={15} />}
      New Folder
    </button>
  )
}

export default CreateFolder
