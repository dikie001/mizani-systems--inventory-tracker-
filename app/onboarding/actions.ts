"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
  // Sometimes session.user.id is stale or incorrect after DB resets
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
