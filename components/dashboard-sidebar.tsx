"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { useSession } from "next-auth/react"

import {
  BarChart3,
  Box,
  ClipboardList,
  Home,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Shield,
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
import { WorkspaceSwitcher } from "@/components/workspace-switcher"

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
  const { data: session } = useSession()
  const { state, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  function handleNavClick() {
    setOpenMobile(false)
  }

  const { data: counts } = useSWR("/api/alerts/counts", (url) =>
    fetch(url).then((res) => (res.ok ? res.json() : null))
  )

  const mainNav = mainNavItems.map((item) => {
    if (item.title === "Orders") {
      return {
        ...item,
        badge: counts?.pendingOrders > 0 ? String(counts.pendingOrders) : null,
      }
    }
    return item
  })

  const secondaryNav = secondaryNavItems.map((item) => {
    if (item.title === "Stock Alerts") {
      return {
        ...item,
        badge: counts?.activeAlerts > 0 ? String(counts.activeAlerts) : null,
      }
    }
    return item
  })

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="bg-transparent">
      {/* Centered the header content to fix WorkspaceSwitcher misalignment */}
      <SidebarHeader className="flex h-16 items-center justify-center border-b border-sidebar-border/60 px-3 py-0 group-data-[collapsible=icon]:!px-0">
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-4 px-3 py-4 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-2">
        <SidebarGroup className="px-0 py-0 group-data-[collapsible=icon]:gap-2">
          <SidebarGroupLabel className="px-2.5 pb-1.5 text-xs font-semibold tracking-normal text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:gap-1">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, item.href)}
                    tooltip={item.title}
                    size="lg"
                    // Fixed alignment: Changed h-8/w-8 to h-10/w-10, added !justify-center and !p-0
                    className="flex h-10 w-full items-center rounded-lg px-3 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:!p-0 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm"
                  >
                    <Link href={item.href} onClick={handleNavClick}>
                      {/* Added !m-0 to prevent flex gaps from pushing the icon off-center */}
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground group-data-[active=true]/menu-button:text-sidebar-primary-foreground group-data-[collapsible=icon]:!m-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                      {item.badge && !isCollapsed && (
                        <Badge
                          variant="secondary"
                          className="ml-auto h-4.5 min-w-4.5 justify-center rounded-full px-1.5 text-[10px]"
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
          <SidebarGroupLabel className="px-2.5 pb-1.5 text-xs font-semibold tracking-normal text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:gap-1">
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, item.href)}
                    tooltip={item.title}
                    size="lg"
                    // Applied the exact same structural fixes here
                    className="flex h-10 w-full items-center rounded-lg px-3 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:!p-0 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm"
                  >
                    <Link href={item.href} onClick={handleNavClick}>
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground group-data-[active=true]/menu-button:text-sidebar-primary-foreground group-data-[collapsible=icon]:!m-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                      {item.badge && !isCollapsed && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-4.5 min-w-4.5 justify-center rounded-full px-1.5 text-[10px]"
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
              // Removed borders when collapsed to prevent that squished outline look
              className="flex h-10 w-full items-center rounded-lg border border-sidebar-border/50 bg-sidebar-accent/25 px-3 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:!p-0 hover:bg-sidebar-accent/50 data-[active=true]:border-sidebar-primary/25 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm"
            >
              <Link href="/dashboard/settings" onClick={handleNavClick}>
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover/menu-button:rotate-90 group-data-[active=true]/menu-button:rotate-90 group-data-[active=true]/menu-button:text-sidebar-primary-foreground group-data-[collapsible=icon]:!m-0" />
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
