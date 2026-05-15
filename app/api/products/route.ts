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
  const category = searchParams.get("category")
  const status = searchParams.get("status")

  const where: any = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ]
  }
  if (category && category !== "all") {
    where.category = { name: category }
  }
  if (status && status !== "all") {
    where.status = status
  }

  try {
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        warehouse: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Flatten to match frontend expectation
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category.name,
      price: p.price,
      stock: p.stock,
      status: p.status,
      warehouse: p.warehouse.name,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // In a real app, validate body with Zod

    // Find or create category
    let category = await prisma.category.findUnique({ where: { name: body.category } })
    if (!category) {
      category = await prisma.category.create({ data: { name: body.category } })
    }

    // Default warehouse for demo
    let warehouse = await prisma.warehouse.findFirst({ where: { name: "Main" } })
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({ data: { name: "Main" } })
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        description: body.description,
        price: parseFloat(body.price),
        stock: parseInt(body.stock, 10),
        status: parseInt(body.stock, 10) > 20 ? "in-stock" : parseInt(body.stock, 10) > 5 ? "low-stock" : "critical",
        categoryId: category.id,
        warehouseId: warehouse.id,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "Product Created",
        entity: product.name,
        type: "create",
        userId: session.user?.id as string,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
