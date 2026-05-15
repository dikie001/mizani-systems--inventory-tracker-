import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaceId = session.user.workspaceId

  try {
    const [totalProducts, lowStock, totalRevenue, pendingOrders] = await Promise.all([
      prisma.product.count({ where: { workspaceId } }),
      prisma.product.count({ 
        where: { 
          workspaceId,
          status: { in: ["low-stock", "critical"] } 
        } 
      }),
      prisma.order.aggregate({ 
        _sum: { total: true }, 
        where: { 
          workspaceId,
          status: { not: "cancelled" } 
        } 
      }),
      prisma.order.count({ 
        where: { 
          workspaceId,
          status: "pending" 
        } 
      })
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
