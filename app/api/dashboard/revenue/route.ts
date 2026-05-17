import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

import { subDays, subMonths, startOfMonth, format, eachMonthOfInterval, eachDayOfInterval } from "date-fns"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaceId = session.user.workspaceId
  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "12m"

  try {
    let startDate = new Date()
    let isDaily = false

    if (range === "7d") {
      startDate = subDays(startDate, 7)
      isDaily = true
    } else if (range === "30d") {
      startDate = subDays(startDate, 30)
      isDaily = true
    } else if (range === "3m") {
      startDate = subMonths(startDate, 3)
    } else {
      startDate = subMonths(startDate, 12)
    }

    // Fetch real orders
    const orders = await prisma.order.findMany({
      where: {
        workspaceId,
        createdAt: { gte: startDate },
        status: { not: "cancelled" }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })
    let data: any[] = []

    if (isDaily) {
      const days = eachDayOfInterval({ start: startDate, end: new Date() })
      data = days.map(day => {
        const dayStr = format(day, "MMM dd")
        const dayOrders = orders.filter(o => format(o.createdAt, "MMM dd") === dayStr)
        const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0)
        return {
          month: dayStr, // Label is day but field name kept for compatibility
          revenue,
          costs: revenue * 0.65, // Estimated
          orders: dayOrders.length
        }
      })
    } else {
      const months = eachMonthOfInterval({ start: startDate, end: new Date() })
      data = months.map(month => {
        const monthStr = format(month, "MMM")
        const monthOrders = orders.filter(o => format(o.createdAt, "MMM") === monthStr)
        const revenue = monthOrders.reduce((sum, o) => sum + o.total, 0)
        
        return {
          month: monthStr,
          revenue,
          costs: revenue * 0.65,
          orders: monthOrders.length
        }
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch revenue data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
