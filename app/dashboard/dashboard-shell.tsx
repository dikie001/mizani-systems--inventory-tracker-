"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16.5rem",
          "--sidebar-width-icon": "4.5rem",
        } as React.CSSProperties
      }
    >
      <DashboardSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
