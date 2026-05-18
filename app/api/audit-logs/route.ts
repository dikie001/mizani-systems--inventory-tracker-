import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import type { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaceId = session.user.workspaceId
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const type = searchParams.get("type")

  const where: Prisma.AuditLogWhereInput = {
    workspaceId,
  }
  
  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { entity: { contains: search, mode: "insensitive" } },
    ]
  }
  if (type && type !== "all") {
    where.type = type
  }

  try {
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const formatted = logs.map(l => ({
      id: l.id,
      action: l.action,
      entity: l.entity,
      type: l.type,
      user: l.user.name || l.user.email,
      initials: l.user.name ? l.user.name.split(" ").map(n => n[0]).join("") : "U",
      timestamp: l.createdAt.toISOString().replace("T", " ").substring(0, 19),
      ip: l.ip || "Unknown",
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to fetch audit logs:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
