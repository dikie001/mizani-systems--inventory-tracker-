import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        workspaceId: session.user.workspaceId,
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Failed to fetch inventory metadata:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory metadata." },
      { status: 500 },
    )
  }
}
