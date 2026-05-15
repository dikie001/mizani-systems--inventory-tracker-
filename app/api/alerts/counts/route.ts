import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [activeAlerts, pendingOrders] = await Promise.all([
      prisma.alert.count({ where: { status: "active" } }),
      prisma.order.count({ where: { status: "pending" } })
    ])

    return NextResponse.json({
      activeAlerts,
      pendingOrders
    })
  } catch (error) {
    console.error("Failed to fetch alert counts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
