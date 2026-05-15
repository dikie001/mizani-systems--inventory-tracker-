import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import LandingClient from "./LandingClient"

export default async function LandingPage() {
  const session = await auth()
  
  if (session?.user?.email) {
    // Check if user has a workspace
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        currentWorkspaceId: true,
        memberships: {
          take: 1
        }
      }
    })

    if (user?.currentWorkspaceId || (user?.memberships && user.memberships.length > 0)) {
      redirect("/dashboard")
    } else {
      redirect("/onboarding")
    }
  }

  return <LandingClient />
}
