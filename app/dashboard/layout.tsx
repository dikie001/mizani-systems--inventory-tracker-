import type { Metadata } from "next"

import { DashboardShell } from "./dashboard-shell"
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal"

export const metadata: Metadata = {
  title: "Dashboard | StockVault",
  description:
    "Manage your inventory, track orders, and monitor key metrics from your StockVault dashboard.",
}

import { Suspense } from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth")
  }

  // Robust check to ensure user has a workspace
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      currentWorkspaceId: true,
      memberships: {
        take: 1
      }
    }
  })

  if (!user?.currentWorkspaceId && (!user?.memberships || user.memberships.length === 0)) {
    redirect("/onboarding")
  }

  return (
    <>
      <DashboardShell>{children}</DashboardShell>
      <Suspense fallback={null}>
        <CreateWorkspaceModal />
      </Suspense>
    </>
  )
}
