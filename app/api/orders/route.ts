import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const status = searchParams.get("status")

  const where: any = {}
  
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { customer: { contains: search, mode: "insensitive" } },
    ]
  }
  if (status && status !== "all") {
    where.status = status
  }

  try {
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const formatted = orders.map((o) => ({
      id: o.id,
      customer: o.customer,
      items: o.orderItems.reduce((acc, item) => acc + item.quantity, 0),
      total: o.total,
      status: o.status,
      payment: o.payment,
      date: o.createdAt.toISOString().split("T")[0],
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
