import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import OnboardingClient from "./OnboardingClient"

export default async function OnboardingPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth")
  }

  // Check if user already has a workspace
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        take: 1
      }
    }
  })

  // If user has a workspace or membership, redirect to dashboard
  if (user?.currentWorkspaceId || (user?.memberships && user.memberships.length > 0)) {
    redirect("/dashboard")
  }

  return <OnboardingClient />
}
