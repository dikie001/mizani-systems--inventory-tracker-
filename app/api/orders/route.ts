import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { updateProductAlerts } from "@/lib/inventory"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaceId = session.user.workspaceId
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const status = searchParams.get("status")

  type OrderWhereInput = NonNullable<
    Parameters<typeof prisma.order.findMany>[0]["where"]
  >

  const where: OrderWhereInput = {
    workspaceId,
  }

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
        orderItems: {
          include: {
            product: {
              select: {
                image: true,
              },
            },
          },
        },
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
      productImages: o.orderItems
        .map((item) => item.product?.image)
        .filter(
          (img): img is string => typeof img === "string" && img.length > 0
        ),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaceId = session.user.workspaceId

  try {
    const body = await request.json()
    const { customer, items } = body

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0
      const orderItemsToCreate = []

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: {
            id: item.productId,
            workspaceId,
          },
        })

        if (!product) {
          throw new Error(
            `Product ${item.productId} not found in this workspace`
          )
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }

        totalAmount += product.price * item.quantity

        orderItemsToCreate.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        })

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        })

        await updateProductAlerts(tx, item.productId)

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId: session.user.id as string,
            workspaceId,
            type: "Sale",
            quantity: -item.quantity,
            status: "completed",
          },
        })
      }

      // Create the order
      const order = await tx.order.create({
        data: {
          customer,
          total: totalAmount,
          status: "pending",
          payment: "unpaid",
          workspaceId,
          orderItems: {
            create: orderItemsToCreate,
          },
        },
        include: {
          orderItems: true,
        },
      })

      // Audit log
      await tx.auditLog.create({
        data: {
          action: `Created order ${order.id}`,
          entity: "Order",
          type: "create",
          userId: session.user.id as string,
          workspaceId,
        },
      })

      return order
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error("Order creation failed:", error)
    const message =
      error instanceof Error ? error.message : "Failed to create order"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
