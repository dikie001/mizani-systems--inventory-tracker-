import { auth } from "@/auth"
import { createProductCsv } from "@/lib/inventory"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "content-type": "application/json",
      },
    })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    type ProductWhereInput = NonNullable<
      Parameters<typeof prisma.product.findMany>[0]["where"]
    >

    const where: ProductWhereInput = {}

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

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const csv = createProductCsv(products)

    return new Response(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="inventory-products.csv"',
      },
    })
  } catch (error) {
    console.error("Failed to export products:", error)
    return new Response(
      JSON.stringify({ error: "Failed to export products." }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    )
  }
}
