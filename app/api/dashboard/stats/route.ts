import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [totalProducts, lowStock, totalRevenue, pendingOrders] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: { in: ["low-stock", "critical"] } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" } } }),
      prisma.order.count({ where: { status: "pending" } })
    ])

    return NextResponse.json({
      totalProducts,
      lowStock,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
    })
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
