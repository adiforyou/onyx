import React from "react"

type Props = { children: React.ReactNode }

const Layout = ({ children }: Props) => {
  return <div className="min-h-screen bg-[#0a0a0a] text-white">{children}</div>
}

export default Layout
