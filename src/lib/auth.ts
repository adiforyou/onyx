import { cache } from "react"
import { currentUser as clerkCurrentUser } from "@clerk/nextjs/server"

export const currentUser = cache(clerkCurrentUser)
