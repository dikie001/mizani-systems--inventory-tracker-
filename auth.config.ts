import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
  providers: [Google({})],
  trustHost: true,
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const hasWorkspace = !!auth?.user?.workspaceId
      const isDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnboarding = nextUrl.pathname === "/onboarding"
      
      if (isDashboard) {
        if (isLoggedIn) {
          if (!hasWorkspace) return Response.redirect(new URL("/onboarding", nextUrl))
          return true
        }
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname === "/auth" || (isOnboarding && hasWorkspace)) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
      }
      return true
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
}
