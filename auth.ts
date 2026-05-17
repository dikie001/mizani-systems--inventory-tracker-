import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user, isNewUser }) {
      if (!user?.email) return

      try {
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
        const isSuperAdmin = user.email.toLowerCase() === superAdminEmail.toLowerCase()

        // 1. Increment loginCount and upgrade role if super admin
        await prisma.user.update({
          where: { email: user.email },
          data: {
            loginCount: { increment: 1 },
            ...(isSuperAdmin ? { role: "super_admin" } : {})
          }
        })

        // 2. Create Audit Log for login
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, currentWorkspaceId: true }
        })

        if (dbUser) {
          await prisma.auditLog.create({
            data: {
              action: isNewUser ? "User Registered and Signed In" : "User Signed In via Google",
              entity: "Auth",
              type: "auth",
              userId: dbUser.id,
              workspaceId: dbUser.currentWorkspaceId || null,
            }
          })
        }
      } catch (err) {
        console.error("Error in signIn event:", err)
      }
    },
    async signOut(message) {
      // In Auth.js v5 events, signOut message contains token and/or session
      const token = (message as any).token
      const session = (message as any).session
      const email = session?.user?.email || token?.email
      
      if (!email) return

      try {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, currentWorkspaceId: true }
        })

        if (dbUser) {
          await prisma.auditLog.create({
            data: {
              action: "User Signed Out",
              entity: "Auth",
              type: "auth",
              userId: dbUser.id,
              workspaceId: dbUser.currentWorkspaceId || null,
            }
          })
        }
      } catch (err) {
        console.error("Error in signOut event:", err)
      }
    }
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!user.email) {
        return false
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.email || (token.sub && !token.workspaceId)) {
        const dbUser = await prisma.user.findUnique({
          where: token.sub 
            ? { id: token.sub } 
            : { email: (user?.email || token.email) as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            status: true,
            currentWorkspaceId: true,
            memberships: {
              select: {
                workspaceId: true,
                workspace: {
                  select: {
                    name: true
                  }
                }
              },
              take: 1
            }
          },
        })

        if (dbUser) {
          const currentMembership = dbUser.memberships.find(m => m.workspaceId === dbUser.currentWorkspaceId) || dbUser.memberships[0]
          
          token.sub = dbUser.id
          token.email = dbUser.email
          token.name = dbUser.name
          token.picture = dbUser.image
          token.role = dbUser.role
          token.status = dbUser.status
          token.workspaceId = dbUser.currentWorkspaceId || currentMembership?.workspaceId
          token.workspaceName = currentMembership?.workspace?.name
        }
      }

      if (trigger === "update" && session) {
        if (session.workspaceId) token.workspaceId = session.workspaceId
        if (session.workspaceName) token.workspaceName = session.workspaceName
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id
        session.user.role = typeof token.role === "string" ? token.role : "user"
        session.user.status =
          typeof token.status === "string" ? token.status : "active"
        session.user.workspaceId = 
          typeof token.workspaceId === "string" ? token.workspaceId : undefined
        session.user.workspaceName = 
          typeof token.workspaceName === "string" ? token.workspaceName : undefined
        session.user.name =
          typeof token.name === "string" ? token.name : session.user.name
        session.user.email =
          typeof token.email === "string" ? token.email : session.user.email
        session.user.image =
          typeof token.picture === "string"
            ? token.picture
            : session.user.image
      }

      return session
    },
  },
})
