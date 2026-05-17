import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

import { subDays, format, startOfWeek, endOfWeek } from "date-fns"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaceId = session.user.workspaceId
  const { searchParams } = new URL(request.url)
  const interval = searchParams.get("interval") || "monthly"

  try {
    if (interval === "weekly") {
      const endDate = new Date()
      const startDate = subDays(endDate, 12 * 7) // Last 12 weeks

      const orders = await prisma.order.findMany({
        where: {
          workspaceId,
          createdAt: { gte: startDate, lte: endDate },
          status: { not: "cancelled" }
        },
        select: {
          total: true,
          createdAt: true
        },
        orderBy: { createdAt: "asc" }
      })

      // Generate the last 12 weeks starting from 11 weeks ago, ending in the current week
      const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday start
      const weeks = Array.from({ length: 12 }).map((_, i) => {
        const weekStart = subDays(startOfCurrentWeek, (11 - i) * 7)
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
        return { start: weekStart, end: weekEnd }
      })

      const data = weeks.map((wk) => {
        const wkOrders = orders.filter(
          (o) => o.createdAt >= wk.start && o.createdAt <= wk.end
        )
        const revenue = wkOrders.reduce((sum, o) => sum + o.total, 0)
        return {
          month: format(wk.start, "MMM dd"), // Label as the week's starting Monday (kept under 'month' field for chart compatibility)
          revenue,
          costs: revenue * 0.65,
          orders: wkOrders.length
        }
      })

      return NextResponse.json(data)
    }

    // Default: Monthly Interval (Exactly January to December calendar year)
    const currentYear = new Date().getFullYear()
    const startDate = new Date(currentYear, 0, 1) // Jan 1st
    const endDate = new Date(currentYear, 11, 31) // Dec 31st

    const orders = await prisma.order.findMany({
      where: {
        workspaceId,
        createdAt: { gte: startDate, lte: endDate },
        status: { not: "cancelled" }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: "asc" }
    })

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ]

    const data = months.map((monthStr, index) => {
      const monthOrders = orders.filter(
        (o) => o.createdAt.getFullYear() === currentYear && o.createdAt.getMonth() === index
      )
      const revenue = monthOrders.reduce((sum, o) => sum + o.total, 0)
      return {
        month: monthStr,
        revenue,
        costs: revenue * 0.65,
        orders: monthOrders.length
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch revenue data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
