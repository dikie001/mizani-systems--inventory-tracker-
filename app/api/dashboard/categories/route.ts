import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      }
    })

    const data = categories.map(c => ({
      category: c.name,
      items: c.products.length,
      value: c.products.reduce((acc, p) => acc + (p.price * p.stock), 0)
    })).filter(c => c.items > 0)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
