import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email, role } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // If user doesn't exist, create a placeholder user
    // In a real app, you'd send an email invite. 
    // Here we'll just link them so they see the workspace when they sign up.
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          status: "pending",
        }
      })
    }

    // Check if already a member
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: session.user.workspaceId,
          userId: user.id
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 400 })
    }

    // Create membership
    await prisma.workspaceMember.create({
      data: {
        workspaceId: session.user.workspaceId,
        userId: user.id,
        role: role || "MEMBER",
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to invite member:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
