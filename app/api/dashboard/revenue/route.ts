import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // For demo purposes, we will just return mock data since we don't have historical data seeded over months
    const revenueData = [
      { month: "Jan", revenue: 18600, orders: 124 },
      { month: "Feb", revenue: 22400, orders: 148 },
      { month: "Mar", revenue: 19800, orders: 137 },
      { month: "Apr", revenue: 27500, orders: 189 },
      { month: "May", revenue: 31200, orders: 215 },
      { month: "Jun", revenue: 28900, orders: 198 },
      { month: "Jul", revenue: 34100, orders: 234 },
      { month: "Aug", revenue: 29700, orders: 203 },
      { month: "Sep", revenue: 36400, orders: 251 },
      { month: "Oct", revenue: 38200, orders: 267 },
      { month: "Nov", revenue: 42100, orders: 290 },
      { month: "Dec", revenue: 45800, orders: 312 },
    ]
    return NextResponse.json(revenueData)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
