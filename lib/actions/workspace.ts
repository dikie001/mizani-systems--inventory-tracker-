"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getWorkspaces() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: session.user.id },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: {
        workspace: {
          name: 'asc'
        }
      }
    })

    return memberships.map(m => m.workspace)
  } catch (error) {
    console.error("Failed to fetch workspaces:", error)
    return []
  }
}

export async function switchWorkspace(workspaceId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify membership
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: session.user.id
      }
    }
  })

  if (!membership) {
    throw new Error("You are not a member of this workspace")
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { currentWorkspaceId: workspaceId }
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to switch workspace:", error)
    return { success: false, error: "Failed to switch workspace" }
  }
}

export async function createWorkspace(data: {
  name: string
  businessType: string
  inventorySize: string
  goals: string[]
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const slug = data.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

  // Ensure user exists in DB and get their correct ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) {
    throw new Error("User record not found in database. Please sign out and sign in again.")
  }

  const userId = user.id

  try {
    const workspace = await prisma.$transaction(async (tx) => {
      // Create the workspace
      const newWorkspace = await tx.workspace.create({
        data: {
          name: data.name.trim(),
          slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
          businessType: data.businessType,
          inventorySize: data.inventorySize,
          goals: {
            set: data.goals || []
          },
        },
      })

      // Add the user as an OWNER
      await tx.workspaceMember.create({
        data: {
          workspaceId: newWorkspace.id,
          userId: userId,
          role: "OWNER",
        },
      })

      // Update the user's current workspace
      await tx.user.update({
        where: { id: userId },
        data: { currentWorkspaceId: newWorkspace.id },
      })

      return newWorkspace
    })

    revalidatePath("/")
    return { success: true, workspaceId: workspace.id }
  } catch (error) {
    console.error("Failed to create workspace:", error)
    return { success: false, error: "Failed to create workspace. Please try again." }
  }
}

export async function updateWorkspace(workspaceId: string, data: { name?: string, businessType?: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify ownership/admin role
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: session.user.id
      }
    }
  })

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    throw new Error("Insufficient permissions")
  }

  try {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to update workspace:", error)
    return { success: false, error: "Failed to update workspace" }
  }
}
