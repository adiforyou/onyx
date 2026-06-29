"use server"

import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export const verifyAccessToWorkspace = async (workspaceId : string) => {
    try{
        const user = await currentUser()
        if(!user) return {status:403}
        const isUserInWorkspace = await client.workSpace.findUnique({
            where: {
              id: workspaceId,
              OR: [
                {
                  User: {
                    clerkid: user.id,
                  },
                },
                {
                  members: {
                    every: {
                      User: {
                        clerkid: user.id,
                      },
                    },
                  },
                },
              ],
            },
          })
          return {
            status: 200,
            data: { workspace: isUserInWorkspace },
          }
    } catch(error){
        return {
            status: 403,
            data: { workspace: null },
          }
    }
}
export const getWorkspaceFolders = async(workSpaceId:string) => {
    try {
        const isFolders = await client.folder.findMany({
            where:{
                workSpaceId,
            },
            include: {
                _count:{
                    select:{
                        videos:true,
                    }
                }
            },
        })
        if(isFolders && isFolders.length > 0){
            return {status : 200,data:isFolders}
        }
        return {status:404, data:[]}
    } catch (error) {
        return {status : 403, data:[]}
    }
}
export const getAllUserVideos = async (workSpaceId:string) => {
    try {
        const user = await  currentUser();
        if(!user) return {status:403}
        const videos = await client.video.findMany({
            where:{
                OR:[{workSpaceId},{folderId:workSpaceId}],
            },
            select:{
                id:true,
                title:true,
                createdAt:true,
                source:true,
                processing:true,
                views:true,
                Folder:{
                    select:{
                        id:true,
                        name:true,
                    },
                },
                User:{
                    select:{
                        firstname:true,
                        lastname: true,
                        image:true,
                    },
                },

            },
            orderBy:{
                createdAt: "asc",
            },
        })
        if(videos && videos.length > 0){
            return {status:200, data: videos }
        }
        return {status:404}
    } catch (error) {
        return {status: 400}
    }
}
export const createFolder = async (workspaceId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    const folder = await client.folder.create({
      data: { workSpaceId: workspaceId },
    })
    return { status: 200, data: folder }
  } catch {
    return { status: 500 }
  }
}

export const renameFolder = async (folderId: string, name: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    await client.folder.update({
      where: { id: folderId },
      data: { name },
    })
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const deleteFolder = async (folderId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    await client.folder.delete({ where: { id: folderId } })
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const createWorkspace = async (name: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    const dbUser = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { id: true, subscription: { select: { plan: true } } },
    })
    if (!dbUser) return { status: 404 }
    if (dbUser.subscription?.plan !== "PRO") return { status: 401, message: "Upgrade to Pro to create team workspaces" }
    const workspace = await client.workSpace.create({
      data: { name, type: "PUBLIC", userId: dbUser.id },
    })
    return { status: 200, data: workspace }
  } catch {
    return { status: 500 }
  }
}

export const removeMember = async (memberId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 403 }
    await client.member.delete({ where: { id: memberId } })
    return { status: 200 }
  } catch {
    return { status: 500 }
  }
}

export const getWorkSpaces = async () => {
    try {
      const user = await currentUser()
  
      if (!user) return { status: 404 }
  
      const workspaces = await client.user.findUnique({
        where: {
          clerkid: user.id,
        },
        select: {
          subscription: {
            select: {
              plan: true,
            },
          },
          workspace: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          members: {
            select: {
              WorkSpace: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      })
  
      if (workspaces) {
        return { status: 200, data: workspaces }
      }
    } catch (error) {
      return { status: 400 }
    }
  }