import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { paystack } from "@/lib/paystack"
import { getPlanById } from "@/lib/plans"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { planId, workspaceId } = await request.json()

    if (!planId || !workspaceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Look up plan from static config (planId is the plan name: trial/basic/pro)
    const staticPlan = getPlanById(planId)
    if (!staticPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      )
    }

    // Get the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      )
    }

    // If it's a free/trial plan, skip Paystack
    if (staticPlan.monthlyPrice === 0) {
      // Try to find or create a DB plan record for trial
      let dbPlan = await prisma.plan.findFirst({
        where: { name: staticPlan.id },
      })

      if (!dbPlan) {
        dbPlan = await prisma.plan.create({
          data: {
            name: staticPlan.id,
            displayName: staticPlan.displayName,
            badge: staticPlan.badge,
            description: staticPlan.description,
            monthlyPrice: staticPlan.monthlyPrice,
            features: staticPlan.features,
          },
        })
      }

      // Create or update subscription directly
      const existingSub = await prisma.subscription.findUnique({
        where: { workspaceId },
      })

      let subscription
      if (existingSub) {
        subscription = await prisma.subscription.update({
          where: { workspaceId },
          data: {
            planId: dbPlan.id,
            status: "active",
            paymentStatus: "paid",
            currentBillingCycleStart: new Date(),
            currentBillingCycleEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
          },
        })
      } else {
        subscription = await prisma.subscription.create({
          data: {
            workspaceId,
            planId: dbPlan.id,
            status: "active",
            paymentStatus: "paid",
            currentBillingCycleStart: new Date(),
            currentBillingCycleEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        })
      }

      // Update workspace with plan and subscription
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          subscriptionId: subscription.id,
          selectedPlanId: dbPlan.id,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Free trial activated",
        subscription,
      })
    }

    // Paid plan — ensure DB plan record exists
    let dbPlan = await prisma.plan.findFirst({
      where: { name: staticPlan.id },
    })

    if (!dbPlan) {
      dbPlan = await prisma.plan.create({
        data: {
          name: staticPlan.id,
          displayName: staticPlan.displayName,
          badge: staticPlan.badge,
          description: staticPlan.description,
          monthlyPrice: staticPlan.monthlyPrice,
          features: staticPlan.features,
        },
      })
    }

    // Tag the workspace with the selected plan so verify can find it
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { selectedPlanId: dbPlan.id },
    })

    // Initialize payment with Paystack
    const reference = `${workspaceId.slice(0, 8)}-${Date.now()}`
    // Paystack amounts are in the smallest currency unit (kobo/cents)
    // For KES, 1 KES = 100 cents in Paystack
    const amountInSmallestUnit = Math.round(staticPlan.monthlyPrice * 100)

    const callbackUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/payments/success`

    const paystackResponse = await paystack.initializePayment({
      email: session.user.email,
      amount: amountInSmallestUnit,
      reference,
      callback_url: callbackUrl,
      metadata: {
        workspaceId,
        planId: staticPlan.id,
        planName: staticPlan.displayName,
        custom_fields: [
          {
            display_name: "Workspace",
            variable_name: "workspace_id",
            value: workspaceId,
          },
          {
            display_name: "Plan",
            variable_name: "plan_name",
            value: staticPlan.displayName,
          },
        ],
      },
    })

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: paystackResponse.message || "Failed to initialize payment" },
        { status: 400 }
      )
    }

    // Store payment intent in database
    const payment = await prisma.payment.create({
      data: {
        workspaceId,
        amount: staticPlan.monthlyPrice,
        status: "pending",
        paystackReference: reference,
        paystackAccessCode: paystackResponse.data?.access_code,
      },
    })

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data?.authorization_url,
      accessCode: paystackResponse.data?.access_code,
      reference,
      paymentId: payment.id,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    )
  }
}
