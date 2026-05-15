import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { computeProductStatus } from "@/lib/inventory"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const movements = await prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
      },
    })

    const formatted = movements.map((movement) => ({
      id: movement.id,
      product: movement.product.name,
      type: movement.type,
      qty: movement.quantity > 0 ? `+${movement.quantity}` : `${movement.quantity}`,
      quantity: movement.quantity,
      status: movement.status,
      date: movement.createdAt.toISOString().split("T")[0],
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to fetch stock movements:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      productId?: string
      quantity?: number | string
      type?: string
    }

    const productId =
      typeof body.productId === "string" ? body.productId.trim() : ""
    const type = typeof body.type === "string" && body.type.trim().length > 0
      ? body.type.trim()
      : "Manual Adjustment"
    const quantity =
      typeof body.quantity === "number" ? body.quantity : Number(body.quantity)

    if (!productId) {
      return NextResponse.json(
        { error: "Product is required." },
        { status: 400 },
      )
    }

    if (!Number.isInteger(quantity) || quantity === 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-zero whole number." },
        { status: 400 },
      )
    }

    const movement = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        throw new Error("Product not found.")
      }

      const nextStock = product.stock + quantity
      if (nextStock < 0) {
        throw new Error("This adjustment would make stock negative.")
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: nextStock,
          status: computeProductStatus(nextStock, product.minStock),
        },
      })

      const createdMovement = await tx.stockMovement.create({
        data: {
          productId,
          userId: session.user.id,
          type,
          quantity,
          status: "completed",
        },
      })

      await tx.auditLog.create({
        data: {
          action: "Stock Adjusted",
          entity: updatedProduct.name,
          type: "update",
          userId: session.user.id,
        },
      })

      return {
        id: createdMovement.id,
        productId,
        product: updatedProduct.name,
        quantity: createdMovement.quantity,
        type: createdMovement.type,
        status: createdMovement.status,
        createdAt: createdMovement.createdAt.toISOString(),
        stock: updatedProduct.stock,
        productStatus: updatedProduct.status,
      }
    })

    return NextResponse.json(movement, { status: 201 })
  } catch (error) {
    console.error("Failed to create stock movement:", error)
    const message =
      error instanceof Error ? error.message : "Failed to create stock movement."

    return NextResponse.json(
      { error: message },
      { status: message === "Product not found." ? 404 : 400 },
    )
  }
}
