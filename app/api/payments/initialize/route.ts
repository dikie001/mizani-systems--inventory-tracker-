import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { paystack } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

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

    // Get the plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
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

    // If it's a free plan, skip Paystack
    if (plan.monthlyPrice === 0) {
      // Create subscription directly
      const subscription = await prisma.subscription.create({
        data: {
          workspaceId,
          planId,
          status: "active",
          paymentStatus: "paid",
          currentBillingCycleStart: new Date(),
          currentBillingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      // Update workspace
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          subscriptionId: subscription.id,
          selectedPlanId: planId,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Free trial activated",
        subscription,
      })
    }

    // Initialize payment with Paystack
    const reference = `${workspace.id}-${Date.now()}`
    const amountInKobo = Math.round(plan.monthlyPrice * 100)

    const paystackResponse = await paystack.initializePayment({
      email: session.user.email,
      amount: amountInKobo,
      reference,
      metadata: {
        workspaceId,
        planId,
        planName: plan.name,
      },
    })

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: paystackResponse.message },
        { status: 400 }
      )
    }

    // Store payment intent in database
    const payment = await prisma.payment.create({
      data: {
        workspaceId,
        amount: plan.monthlyPrice,
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
