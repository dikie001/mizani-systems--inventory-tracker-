import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name } = await request.json()
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 })
    }

    // Check if category already exists for this workspace
    const existing = await prisma.category.findFirst({
      where: {
        workspaceId: session.user.workspaceId,
        name: {
          equals: trimmedName,
          mode: "insensitive"
        }
      }
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        workspaceId: session.user.workspaceId,
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Failed to create category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
