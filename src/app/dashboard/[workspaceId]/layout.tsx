import { onAuthenticateUser } from "@/actions/user"
import { verifyAccessToWorkspace, getWorkSpaces, getWorkspaceFolders } from "@/actions/workspace"
import { client } from "@/lib/prisma"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardShell from "@/components/global/dashboard-shell"
import SocketProvider from "@/components/global/socket-provider"

type Props = {
  params: Promise<{ workspaceId: string }>
  children: React.ReactNode
}

const Layout = async ({ params, children }: Props) => {
  const { workspaceId } = await params

  const auth = await onAuthenticateUser()
  if (!auth.user?.workspace) redirect("/auth/sign-in")
  if (!auth.user.workspace.length) redirect("/auth/sign-in")

  const hasAccess = await verifyAccessToWorkspace(workspaceId)
  if (hasAccess.status !== 200) redirect(`/dashboard/${auth.user.workspace[0].id}`)

  const [workspacesData, foldersData, clerkUser, dbUser] = await Promise.all([
    getWorkSpaces(),
    getWorkspaceFolders(workspaceId),
    currentUser(),
    client.user.findUnique({
      where: { clerkid: auth.user.clerkid },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        image: true,
        trial: true,
        subscription: { select: { plan: true } },
      },
    }),
  ])

  const workspaces = workspacesData?.data?.workspace ?? []
  const memberWorkspaces = (workspacesData?.data?.members ?? [])
    .map((m: { WorkSpace: { id: string; name: string; type: string } | null }) => m.WorkSpace)
    .filter(Boolean) as { id: string; name: string; type: string }[]
  const folders = foldersData?.data ?? []
  const plan = dbUser?.subscription?.plan ?? "FREE"
  const isPro = plan === "PRO"
  const hasTrial = dbUser?.trial === true

  const userName = [dbUser?.firstname, dbUser?.lastname].filter(Boolean).join(" ")
  const userImageUrl = dbUser?.image ?? clerkUser?.imageUrl ?? ""

  return (
    <>
      <SocketProvider workspaceId={workspaceId} />
      <DashboardShell
        workspaceId={workspaceId}
        workspaces={workspaces}
        memberWorkspaces={memberWorkspaces}
        folders={folders}
        plan={plan}
        user={{ name: userName, email: dbUser?.email ?? "", imageUrl: userImageUrl }}
        isPro={isPro}
        hasTrial={hasTrial}
      >
        {children}
      </DashboardShell>
    </>
  )
}

export default Layout
