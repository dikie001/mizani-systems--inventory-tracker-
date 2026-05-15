import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) {
        return false
      }

      const syncedUser = await prisma.user.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          name: user.name,
          image: user.image,
        },
        update: {
          name: user.name,
          image: user.image,
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      })

      user.id = syncedUser.id
      user.role = syncedUser.role
      user.status = syncedUser.status

      return true
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            status: true,
            currentWorkspaceId: true,
            memberships: {
              where: {
                workspaceId: { not: null }
              },
              include: {
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
