import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Verify super admin access
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
    if (
      !superAdminEmail ||
      session.user.email.toLowerCase() !== superAdminEmail.replace(/"/g, "").toLowerCase()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const workspaces = await prisma.workspace.findMany({
      include: {
        selectedPlan: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const billingWorkspaces = workspaces.map((workspace: any) => ({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      planName: workspace.subscription?.plan?.displayName || workspace.selectedPlan?.displayName || null,
      subscriptionStatus: workspace.subscription?.status || null,
      paymentStatus: workspace.subscription?.paymentStatus || null,
      monthlyPrice: workspace.subscription?.plan?.monthlyPrice || workspace.selectedPlan?.monthlyPrice || null,
      nextBillingDate: workspace.subscription?.nextBillingDate?.toISOString() || null,
      lastPaymentStatus: workspace.payments[0]?.status || null,
      createdAt: workspace.createdAt.toISOString(),
    }))

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const paidThisMonth = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "success",
        paidAt: { gte: startOfMonth },
      },
    })

    const summary = {
      totalWorkspaces: workspaces.length,
      activeSubscriptions: workspaces.filter(
        (workspace: any) => workspace.subscription?.status === "active"
      ).length,
      pendingPayments: workspaces.filter(
        (workspace: any) => workspace.subscription?.paymentStatus === "unpaid" ||
          workspace.payments[0]?.status === "pending"
      ).length,
      totalMonthlyRevenue: workspaces.reduce((sum: number, workspace: any) => {
        const price = workspace.subscription?.plan?.monthlyPrice ||
          workspace.selectedPlan?.monthlyPrice || 0
        const isActive = workspace.subscription?.status === "active"
        return sum + (isActive ? price : 0)
      }, 0),
      paidThisMonth: paidThisMonth._sum.amount || 0,
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
