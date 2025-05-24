import { onAuthenticateUser } from '@/actions/user'
import { verifyAccessToWorkspace } from '@/actions/workspace'
import { redirect } from 'next/navigation'

import React from 'react'

type Props = {
    params:{workspaceId:string}
    children:React.ReactNode
} 
const Layout = async({params, children }:Props) => {
    const { workspaceId } = await params;
    const auth = await onAuthenticateUser()
    if(!auth.user?.workspace) redirect('/auth/sign-in')
    if(!auth.user.workspace.length ) redirect('/auth/sign-in')
    const hasAccess = await verifyAccessToWorkspace(workspaceId)
  return (
    <div>LayoutLayout</div>
  )
}

export default Layout