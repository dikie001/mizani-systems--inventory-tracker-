import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { subDays, subMonths, startOfDay } from "date-fns"

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "12m"

  let startDate = new Date()
  if (range === "7d") startDate = subDays(startDate, 7)
  else if (range === "30d") startDate = subDays(startDate, 30)
  else if (range === "3m") startDate = subMonths(startDate, 3)
  else startDate = subMonths(startDate, 12)

  startDate = startOfDay(startDate)

  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "cancelled" }
      },
      select: { total: true }
    })

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const orderCount = orders.length
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0
    
    // For now, estimate costs as 65% of revenue as costPrice is not in schema
    const estimatedCosts = totalRevenue * 0.65
    const netProfit = totalRevenue - estimatedCosts

    // Mocking "change" percentages for UI demo consistency
    // In a real app, you'd compare with the previous period
    const mockChanges = {
      revenue: "+18.3%",
      costs: "+12.1%",
      profit: "+27.4%",
      aov: "+5.8%"
    }

    return NextResponse.json({
      revenue: { value: totalRevenue, change: mockChanges.revenue },
      costs: { value: estimatedCosts, change: mockChanges.costs },
      profit: { value: netProfit, change: mockChanges.profit },
      aov: { value: avgOrderValue, change: mockChanges.aov },
      orderCount
    })
  } catch (error) {
    console.error("Failed to fetch report stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
