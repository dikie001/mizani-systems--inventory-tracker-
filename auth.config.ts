import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({}),
  ],
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
      
      if (isOnboarding) {
        if (!isLoggedIn) return false // Force redirect to /auth
        if (hasWorkspace) return Response.redirect(new URL("/dashboard", nextUrl))
      }
      
      if (isDashboard) {
        if (!isLoggedIn) return false
        if (!hasWorkspace) return Response.redirect(new URL("/onboarding", nextUrl))
      }
      
      if (isLoggedIn && (nextUrl.pathname === "/auth" || nextUrl.pathname === "/")) {
        return Response.redirect(new URL(hasWorkspace ? "/dashboard" : "/onboarding", nextUrl))
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
