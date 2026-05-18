"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Database,
  Users,
  Briefcase,
  Activity,
  Home,
  ShieldAlert
} from "lucide-react"

import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const adminNavItems = [
  { title: "Overview", icon: Database, href: "/super-admin" },
  { title: "Users & Accounts", icon: Users, href: "/super-admin/users" },
  { title: "Workspaces Grid", icon: Briefcase, href: "/super-admin/workspaces" },
  { title: "Global Activity Trail", icon: Activity, href: "/super-admin/audit" },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="bg-transparent">
      {/* Brand Header */}
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border/60 px-3 py-0 group-data-[collapsible=icon]:h-16">
        <div className="flex items-center gap-2.5 px-1">
          <div className="h-9 w-9 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/mizani_logo.png" alt="Admin Logo" className="h-full w-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="text-left">
              <span className="text-xs font-bold tracking-tight text-foreground">
                StockVault Admin
              </span>
              <p className="text-[9px] font-semibold text-muted-foreground tracking-widest uppercase -mt-0.5">
                Central Control
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-3 py-4 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3">
        {/* Core Administrative Links */}
        <SidebarGroup className="px-0 py-0 group-data-[collapsible=icon]:gap-2">
          <SidebarGroupLabel className="px-2.5 pb-1.5 text-[9px] font-semibold tracking-normal text-sidebar-foreground/35 uppercase">
            Console Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    size="lg"
                    className="h-9 rounded-lg px-2.5 text-[12px] font-medium text-sidebar-foreground/75 transition-all duration-200 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0 cursor-pointer hover:bg-sidebar-accent/50 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-sm"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground group-data-[active=true]:text-primary" />
                      {!isCollapsed && (
                        <span className="ml-2.5">
                          {item.title}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-3 w-auto bg-sidebar-border/60 group-data-[collapsible=icon]:hidden" />

        {/* Return to App shortcut */}
        <SidebarGroup className="px-0 py-0 group-data-[collapsible=icon]:gap-2">
          <SidebarGroupLabel className="px-2.5 pb-1.5 text-[9px] font-semibold tracking-normal text-sidebar-foreground/35 uppercase">
            System Routing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Return to App"
                  size="lg"
                  className="h-9 rounded-lg px-2.5 text-[12px] font-medium text-sidebar-foreground/75 transition-all duration-200 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                >
                  <Link href="/dashboard">
                    <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {!isCollapsed && (
                      <span className="ml-2.5">
                        Return to Dashboard
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Profiler Footer */}
      <SidebarFooter className="mt-auto border-t border-sidebar-border/60 px-2.5 py-2.5 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2.5 p-1 rounded-lg">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-border shrink-0"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  SA
                </div>
              )}
              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <p className="text-[10px] font-bold text-foreground truncate font-sans">
                    {session?.user?.name || "Super Admin"}
                  </p>
                  <p className="text-[8px] font-semibold text-muted-foreground truncate font-mono uppercase">
                    {session?.user?.email || ""}
                  </p>
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
