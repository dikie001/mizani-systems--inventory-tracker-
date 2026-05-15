import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  computeProductStatus,
  parseProductImport,
  productQueryInclude,
} from "@/lib/inventory"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const items = parseProductImport(body)

    const summary = {
      created: 0,
      updated: 0,
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const category = await tx.category.upsert({
          where: { name: item.category },
          update: {},
          create: { name: item.category },
        })



        const existingProduct = await tx.product.findUnique({
          where: { sku: item.sku },
          include: productQueryInclude(),
        })

        if (existingProduct) {
          const stockDelta = item.stock - existingProduct.stock

          await tx.product.update({
            where: { id: existingProduct.id },
            data: {
              name: item.name,
              sku: item.sku,
              description: item.description,
              price: item.price,
              stock: item.stock,
              minStock: item.minStock,
              maxStock: item.maxStock,
              status: computeProductStatus(item.stock, item.minStock),
              categoryId: category.id,

            },
          })

          if (stockDelta !== 0) {
            await tx.stockMovement.create({
              data: {
                productId: existingProduct.id,
                userId: session.user.id,
                type: "Import Adjustment",
                quantity: stockDelta,
                status: "completed",
              },
            })
          }

          await tx.auditLog.create({
            data: {
              action: "Product Imported Update",
              entity: item.name,
              type: "update",
              userId: session.user.id,
            },
          })

          summary.updated += 1
          continue
        }

        const createdProduct = await tx.product.create({
          data: {
            name: item.name,
            sku: item.sku,
            description: item.description,
            price: item.price,
            stock: item.stock,
            minStock: item.minStock,
            maxStock: item.maxStock,
            status: computeProductStatus(item.stock, item.minStock),
            categoryId: category.id,

          },
        })

        if (item.stock > 0) {
          await tx.stockMovement.create({
            data: {
              productId: createdProduct.id,
              userId: session.user.id,
              type: "Imported Stock",
              quantity: item.stock,
              status: "completed",
            },
          })
        }

        await tx.auditLog.create({
          data: {
            action: "Product Imported Create",
            entity: item.name,
            type: "create",
            userId: session.user.id,
          },
        })

        summary.created += 1
      }
    })

    return NextResponse.json({
      ...summary,
      total: items.length,
      message: `Imported ${items.length} product${items.length === 1 ? "" : "s"}.`,
    })
  } catch (error) {
    console.error("Failed to import products:", error)
    const message =
      error instanceof Error ? error.message : "Failed to import products."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
