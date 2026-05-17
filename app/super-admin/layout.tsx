import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SuperAdminSidebar } from "@/components/super-admin-sidebar"
import { SuperAdminHeader } from "@/components/super-admin-header"
import { Suspense } from "react"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "Super Admin Control Center | StockVault",
  description:
    "Restricted administrative dashboard for managing registered users, multi-tenant workspaces, system performance, and complete audit trail logs.",
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth")
  }

  // Double check email matching super admin env variable
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "omondidickens255@gmail.com"
  
  if (session.user.email.toLowerCase() !== superAdminEmail.toLowerCase()) {
    redirect("/dashboard")
  }

  return (
    <div className={`${outfit.variable} font-sans min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-rose-500/30 selection:text-rose-200`}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16.5rem",
            "--sidebar-width-icon": "4.5rem",
          } as React.CSSProperties
        }
      >
        <Suspense fallback={null}>
          <SuperAdminSidebar />
        </Suspense>
        
        <SidebarInset className="h-svh overflow-hidden border-l border-slate-900/60 bg-slate-950 flex flex-col">
          <Suspense fallback={null}>
            <SuperAdminHeader />
          </Suspense>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-950 text-slate-100 relative">
            {/* Dynamic Operations Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,63,94,0.06),rgba(255,255,255,0))] pointer-events-none" />
            <div className="relative z-10 max-w-7.5xl mx-auto w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
