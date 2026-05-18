import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        selectedPlan: true,
        subscription: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const billingWorkspaces = workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      planName: workspace.selectedPlan?.displayName || null,
      subscriptionStatus: workspace.subscription?.status || null,
      paymentStatus: workspace.subscription?.paymentStatus || null,
      monthlyPrice: workspace.selectedPlan?.monthlyPrice || null,
      nextBillingDate: workspace.subscription?.nextBillingDate?.toISOString() || null,
      createdAt: workspace.createdAt.toISOString(),
    }))

    const summary = {
      totalWorkspaces: workspaces.length,
      activeSubscriptions: workspaces.filter(
        (workspace) => workspace.subscription?.status === "active"
      ).length,
      pendingPayments: workspaces.filter(
        (workspace) => workspace.subscription?.paymentStatus === "pending"
      ).length,
      totalMonthlyRevenue: workspaces.reduce((sum, workspace) => {
        return sum + (workspace.selectedPlan?.monthlyPrice || 0)
      }, 0),
      paidThisMonth: workspaces.reduce((sum, workspace) => {
        return sum +
          (workspace.subscription?.paymentStatus === "paid"
            ? workspace.selectedPlan?.monthlyPrice || 0
            : 0)
      }, 0),
    }

    return NextResponse.json({
      workspaces: billingWorkspaces,
      summary,
    })
  } catch (error) {
    console.error("Super admin billing error:", error)
    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 }
    )
  }
}
