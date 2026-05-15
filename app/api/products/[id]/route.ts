import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  computeProductStatus,
  formatProduct,
  normalizeProductPayload,
  productQueryInclude,
} from "@/lib/inventory"
import prisma from "@/lib/prisma"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: productQueryInclude(true),
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    return NextResponse.json(formatProduct(product))
  } catch (error) {
    console.error("Failed to fetch product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product." },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const payload = normalizeProductPayload(await request.json())

    const product = await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({
        where: { id },
      })

      if (!existingProduct) {
        throw new Error("Product not found.")
      }

      const conflictingProduct = await tx.product.findUnique({
        where: { sku: payload.sku },
        select: { id: true },
      })

      if (conflictingProduct && conflictingProduct.id !== id) {
        throw new Error("A product with that SKU already exists.")
      }

      const category = await tx.category.upsert({
        where: { name: payload.category },
        update: {},
        create: { name: payload.category },
      })



      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: payload.name,
          sku: payload.sku,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          minStock: payload.minStock,
          maxStock: payload.maxStock,
          status: computeProductStatus(payload.stock, payload.minStock),
          categoryId: category.id,

        },
        include: productQueryInclude(true),
      })

      const stockDelta = payload.stock - existingProduct.stock
      if (stockDelta !== 0) {
        await tx.stockMovement.create({
          data: {
            productId: id,
            userId: session.user.id,
            type: stockDelta > 0 ? "Manual Restock" : "Manual Reduction",
            quantity: stockDelta,
            status: "completed",
          },
        })
      }

      await tx.auditLog.create({
        data: {
          action: "Product Updated",
          entity: payload.name,
          type: "update",
          userId: session.user.id,
        },
      })

      return updatedProduct
    })

    return NextResponse.json(formatProduct(product))
  } catch (error) {
    console.error("Failed to update product:", error)
    const message =
      error instanceof Error ? error.message : "Failed to update product."

    return NextResponse.json(
      { error: message },
      {
        status:
          message === "Product not found."
            ? 404
            : message.includes("already exists")
              ? 409
              : 400,
      },
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      })

      if (!product) {
        throw new Error("Product not found.")
      }

      if (product._count.orderItems > 0) {
        throw new Error(
          "This product is linked to existing orders and cannot be deleted.",
        )
      }

      await tx.stockMovement.deleteMany({
        where: { productId: id },
      })

      await tx.product.delete({
        where: { id },
      })

      await tx.auditLog.create({
        data: {
          action: "Product Deleted",
          entity: product.name,
          type: "delete",
          userId: session.user.id,
        },
      })

      return { id: product.id, name: product.name }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to delete product:", error)
    const message =
      error instanceof Error ? error.message : "Failed to delete product."

    return NextResponse.json(
      { error: message },
      {
        status:
          message === "Product not found."
            ? 404
            : message.includes("cannot be deleted")
              ? 409
              : 400,
      },
    )
  }
}
