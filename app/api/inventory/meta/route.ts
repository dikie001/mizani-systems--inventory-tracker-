import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [categories, warehouses] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.warehouse.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, location: true },
      }),
    ])

    return NextResponse.json({ categories, warehouses })
  } catch (error) {
    console.error("Failed to fetch inventory metadata:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory metadata." },
      { status: 500 },
    )
  }
}
