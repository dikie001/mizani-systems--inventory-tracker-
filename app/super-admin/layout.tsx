import type { Metadata } from "next"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SuperAdminSidebar } from "@/components/super-admin-sidebar"
import { SuperAdminHeader } from "@/components/super-admin-header"
import { Suspense } from "react"

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

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  
  if (!superAdminEmail || session.user.email.toLowerCase() !== superAdminEmail.toLowerCase()) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
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
        
        <SidebarInset className="h-svh overflow-hidden flex flex-col">
          <Suspense fallback={null}>
            <SuperAdminHeader />
          </Suspense>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background text-foreground relative">
            <div className="max-w-7.5xl mx-auto w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
