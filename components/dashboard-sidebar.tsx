"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  BarChart3,
  Box,
  ClipboardList,
  Home,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
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

const mainNavItems = [
  { title: "Dashboard", icon: Home, href: "/dashboard", badge: null },
  {
    title: "Inventory",
    icon: Package,
    href: "/dashboard/inventory",
    badge: null,
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
    badge: "12",
  },
  {
    title: "Reports",
    icon: BarChart3,
    href: "/dashboard/reports",
    badge: null,
  },
]

const secondaryNavItems = [
  {
    title: "Stock Alerts",
    icon: TrendingUp,
    href: "/dashboard/alerts",
    badge: "3",
  },
  {
    title: "Audit Log",
    icon: ClipboardList,
    href: "/dashboard/audit",
    badge: null,
  },
]

function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="bg-transparent">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border/60 px-2.5 py-0 group-data-[collapsible=icon]:h-14">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Mizani"
              className="h-9 rounded-lg px-2 text-sidebar-foreground group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:border group-data-[collapsible=icon]:border-sidebar-border/50 group-data-[collapsible=icon]:bg-sidebar-accent/30 group-data-[collapsible=icon]:px-0 hover:bg-sidebar-accent/40 transition-all duration-200"
            >
              <Link href="/dashboard">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-950/10">
                  <Box className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="text-xs font-semibold tracking-tight">
                    Mizani
                  </span>
                  <span className="text-[8px] tracking-wider text-sidebar-foreground/40 uppercase">
                    Systems
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-2.5 py-3 group-data-[collapsible=icon]:gap-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
        <SidebarGroup className="px-0 py-0 group-data-[collapsible=icon]:gap-2">
          <SidebarGroupLabel className="px-2.5 pb-1.5 text-[9px] font-semibold tracking-widest text-sidebar-foreground/35 uppercase">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, item.href)}
                    tooltip={item.title}
                    size="lg"
                    className="min-h-10 rounded-xl px-3 text-[13px] font-medium text-sidebar-foreground/80 transition-colors duration-200 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:px-0 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-950 data-[active=true]:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)] dark:data-[active=true]:bg-emerald-950/30 dark:data-[active=true]:text-emerald-50"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 text-sidebar-foreground/55 group-data-[active=true]/menu-button:text-emerald-700 dark:group-data-[active=true]/menu-button:text-emerald-300" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                      {item.badge && !isCollapsed && (
                        <Badge
                          variant="secondary"
                          className="ml-auto h-[18px] min-w-[18px] justify-center rounded-full px-1.5 text-[10px]"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-3 w-auto bg-sidebar-border/70 group-data-[collapsible=icon]:hidden" />

        <SidebarGroup className="px-0 py-0 group-data-[collapsible=icon]:gap-2">
          <SidebarGroupLabel className="px-2.5 pb-1.5 text-[9px] font-semibold tracking-widest text-sidebar-foreground/35 uppercase">
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, item.href)}
                    tooltip={item.title}
                    size="lg"
                    className="h-9 rounded-lg px-2.5 text-[12px] font-medium text-sidebar-foreground/75 transition-all duration-200 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-950 data-[active=true]:shadow-sm dark:data-[active=true]:bg-emerald-950/40 dark:data-[active=true]:text-emerald-100"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 text-sidebar-foreground/55 group-data-[active=true]/menu-button:text-emerald-700 dark:group-data-[active=true]/menu-button:text-emerald-300" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                      {item.badge && !isCollapsed && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-[18px] min-w-[18px] justify-center rounded-full px-1.5 text-[10px]"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border/60 px-2.5 py-2.5 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isNavItemActive(pathname, "/dashboard/settings")}
              tooltip="Settings"
              size="lg"
              className="h-9 rounded-lg border border-sidebar-border/50 bg-sidebar-accent/25 px-2.5 text-[12px] font-medium text-sidebar-foreground/80 transition-all duration-200 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:border-sidebar-border/40 hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent/60 data-[active=true]:text-sidebar-foreground data-[active=true]:border-sidebar-accent/50"
            >
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 text-sidebar-foreground/65 transition-transform duration-300 group-hover/menu-button:rotate-90 group-data-[active=true]/menu-button:rotate-90" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Settings
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
