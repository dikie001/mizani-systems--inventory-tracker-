import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { auth } from "@/auth"
import {
  computeProductStatus,
  formatProduct,
  normalizeProductPayload,
  productQueryInclude,
} from "@/lib/inventory"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const category = searchParams.get("category")
  const status = searchParams.get("status")
  const warehouse = searchParams.get("warehouse")

  const where: Prisma.ProductWhereInput = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (category && category !== "all") {
    where.category = {
      name: category,
    }
  }

  if (status && status !== "all") {
    where.status = status
  }

  if (warehouse && warehouse !== "all") {
    where.warehouse = {
      name: warehouse,
    }
  }

  try {
    const products = await prisma.product.findMany({
      where,
      include: productQueryInclude(),
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products.map(formatProduct))
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products." },
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
    const payload = normalizeProductPayload(await request.json())

    const product = await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({
        where: { sku: payload.sku },
        select: { id: true },
      })

      if (existingProduct) {
        throw new Error("A product with that SKU already exists.")
      }

      const category = await tx.category.upsert({
        where: { name: payload.category },
        update: {},
        create: { name: payload.category },
      })

      const warehouse = await tx.warehouse.upsert({
        where: { name: payload.warehouse },
        update: {},
        create: { name: payload.warehouse },
      })

      const createdProduct = await tx.product.create({
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
          warehouseId: warehouse.id,
        },
        include: productQueryInclude(),
      })

      if (payload.stock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: createdProduct.id,
            userId: session.user.id,
            type: "Initial Stock",
            quantity: payload.stock,
            status: "completed",
          },
        })
      }

      await tx.auditLog.create({
        data: {
          action: "Product Created",
          entity: payload.name,
          type: "create",
          userId: session.user.id,
        },
      })

      return createdProduct
    })

    return NextResponse.json(formatProduct(product), { status: 201 })
  } catch (error) {
    console.error("Failed to create product:", error)
    const message =
      error instanceof Error ? error.message : "Failed to create product."

    return NextResponse.json(
      { error: message },
      { status: message.includes("already exists") ? 409 : 400 },
    )
  }
}
