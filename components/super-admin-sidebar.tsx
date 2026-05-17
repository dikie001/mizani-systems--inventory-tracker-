"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
  { title: "Overview", icon: Database, id: "overview" },
  { title: "Users & Accounts", icon: Users, id: "users" },
  { title: "Workspaces Grid", icon: Briefcase, id: "workspaces" },
  { title: "Global Activity Trail", icon: Activity, id: "audit" },
]

export function SuperAdminSidebar() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"
  const { data: session } = useSession()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="bg-transparent border-r border-slate-900 bg-slate-950">
      {/* Brand Header */}
      <SidebarHeader className="h-16 justify-center border-b border-slate-900 px-3 py-0 group-data-[collapsible=icon]:h-16">
        <div className="flex items-center gap-2.5 px-1">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/10 ring-1 ring-white/10 shrink-0">
            <ShieldAlert className="h-4.5 w-4.5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="text-left">
              <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-100 to-rose-300 bg-clip-text text-transparent">
                StockVault Admin
              </span>
              <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase -mt-0.5">
                Central Control
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-3 py-4 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3">
        {/* Core Administrative Links */}
        <SidebarGroup className="px-0 py-0 group-data-[collapsible=icon]:gap-2">
          <SidebarGroupLabel className="px-2.5 pb-1.5 text-[9px] font-semibold tracking-normal text-slate-500 uppercase">
            Console Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    size="lg"
                    className={`h-9 rounded-lg px-2.5 text-[12px] font-semibold transition-all duration-200 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0 cursor-pointer ${
                      activeTab === item.id
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <Link href={`/super-admin?tab=${item.id}`}>
                      <item.icon className={`h-4 w-4 ${activeTab === item.id ? "text-rose-400" : "text-slate-500"}`} />
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

        <Separator className="mx-3 w-auto bg-slate-900 group-data-[collapsible=icon]:hidden" />

        {/* Return to App shortcut */}
        <SidebarGroup className="px-0 py-0 group-data-[collapsible=icon]:gap-2">
          <SidebarGroupLabel className="px-2.5 pb-1.5 text-[9px] font-semibold tracking-normal text-slate-500 uppercase">
            System Routing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Return to App"
                  size="lg"
                  className="h-9 rounded-lg px-2.5 text-[12px] font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-200 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:px-0"
                >
                  <Link href="/dashboard">
                    <Home className="h-4 w-4 text-slate-500" />
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
      <SidebarFooter className="mt-auto border-t border-slate-900 px-2.5 py-2.5 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2.5 p-1 rounded-lg">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-rose-500/20 shrink-0"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-rose-500/10 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
                  SA
                </div>
              )}
              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <p className="text-[10px] font-bold text-slate-200 truncate font-sans">
                    {session?.user?.name || "Super Admin"}
                  </p>
                  <p className="text-[8px] font-semibold text-rose-400 truncate font-mono">
                    OMONDIDICKENS255@GMAIL.COM
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
