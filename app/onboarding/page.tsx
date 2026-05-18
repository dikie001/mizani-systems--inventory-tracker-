import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import OnboardingClient from "./OnboardingClient"
import { Suspense } from "react"

export default async function OnboardingPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth")
  }

  // Check if user already has a workspace
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      memberships: {
        include: {
          workspace: {
            include: {
              subscription: true,
              selectedPlan: true
            }
          }
        }
      }
    }
  })

  const activeWorkspace = user?.memberships?.[0]?.workspace || null

  if (activeWorkspace) {
    const subStatus = activeWorkspace.subscription?.status
    // If subscription is active or trial, go to dashboard
    if (subStatus === "active" || subStatus === "trial") {
      redirect("/dashboard")
    }
    
    return (
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      }>
        <OnboardingClient 
          initialWorkspaceId={activeWorkspace.id}
          initialWorkspaceName={activeWorkspace.name}
          initialPlanName={activeWorkspace.selectedPlan?.name}
          initialBusinessType={activeWorkspace.businessType || undefined}
          initialInventorySize={activeWorkspace.inventorySize || undefined}
        />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    }>
      <OnboardingClient />
    </Suspense>
  )
}
