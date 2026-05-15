import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const movements = await prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
      }
    })

    const formatted = movements.map(m => ({
      id: m.id,
      product: m.product.name,
      type: m.type,
      qty: m.quantity > 0 ? `+${m.quantity}` : `${m.quantity}`,
      status: m.status,
      date: m.createdAt.toISOString().split("T")[0],
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to fetch stock movements:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
