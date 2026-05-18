import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaceId = session.user.workspaceId
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "active"

  try {
    const alerts = await prisma.alert.findMany({
      where: {
        workspaceId,
        ...(status === "all" ? {} : { status })
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const formatted = alerts.map((a: typeof alerts[number]) => ({
      id: a.id,
      productId: a.productId,
      name: a.product.name,
      sku: a.product.sku,
      category: a.product.category.name,
      stock: a.product.stock,
      minStock: a.product.minStock,
      maxStock: a.product.maxStock,
      severity: a.severity,
      status: a.status,
      createdAt: a.createdAt.toISOString()
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to fetch alerts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
