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
    // Get all order items for orders within the range
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: "cancelled" }
        }
      },
      include: {
        product: {
          select: { name: true }
        }
      }
    })

    // Group by product
    const productMap: Record<string, { product: string, units: number }> = {}
    
    orderItems.forEach(item => {
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          product: item.product.name,
          units: 0
        }
      }
      productMap[item.productId].units += item.quantity
    })

    // Convert to array and sort
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)

    return NextResponse.json(topProducts)
  } catch (error) {
    console.error("Failed to fetch top products:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
