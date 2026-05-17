"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Layers,
  Activity,
  Key,
  Shield,
  Search,
  Clock,
  Briefcase,
  Package,
  ShoppingCart,
  User,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Database,
  Monitor,
  ExternalLink,
  Loader2
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SuperAdminPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/super-admin/data", fetcher, {
    refreshInterval: 10000 // Refresh stats every 10 seconds for real-time vibe
  })
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = (searchParams.get("tab") || "overview") as "overview" | "users" | "workspaces" | "audit"
  const [auditSearch, setAuditSearch] = useState("")
  const [auditFilterType, setAuditFilterType] = useState<string>("all")
  const [auditPage, setAuditPage] = useState(1)
  const logsPerPage = 12

  // Expanded workspace view per user ID
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Failed to Load Control Panel</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            There was an error communicating with the database or server. Ensure your database is running.
          </p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="border-border bg-background text-foreground">
          Retry Connection
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          Initializing Administrative Terminal...
        </p>
      </div>
    )
  }

  const { stats, users = [], workspaces = [], activities = [], superAdminEmail = "" } = data || {}

  // Filter audit logs based on search query and selected log type
  const filteredLogs = activities.filter((log: any) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.user.email.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.user.name.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.ip && log.ip.includes(auditSearch))
    
    const matchesType = auditFilterType === "all" || log.type === auditFilterType
    
    return matchesSearch && matchesType
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (auditPage - 1) * logsPerPage,
    auditPage * logsPerPage
  )

  const handleTabChange = (tab: "overview" | "users" | "workspaces" | "audit") => {
    router.push(`/super-admin?tab=${tab}`)
    setAuditPage(1) // Reset page on tab change
  }

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "create": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "update": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      case "delete": return "bg-destructive/10 text-destructive border-destructive/20"
      case "auth": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
      default: return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    }
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      {/* Visual Dynamic Ribbon */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Operations Dashboard
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Real-time multi-tenant health, workspace isolation metrics, and global audit trace analysis.
            System updates occur dynamically every 10 seconds.
          </p>
        </div>
        
        {/* Connection status card */}
        <div className="flex items-center gap-4 bg-background border border-border px-4 py-2.5 rounded-xl relative z-10 shadow-inner">
          <div className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background"></span>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">System Link</p>
            <p className="text-xs font-bold text-foreground">Active & Syncing</p>
          </div>
        </div>
      </div>

      {/* Modern Tab Bar Selector */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-none gap-2 pb-[1px]">
        {[
          { id: "overview", label: "Overview", icon: Database },
          { id: "users", label: "Users & Accounts", icon: Users },
          { id: "workspaces", label: "Workspaces Grid", icon: Briefcase },
          { id: "audit", label: "Global Activity Trail", icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-trigger-${tab.id}`}
            onClick={() => handleTabChange(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs tracking-wide uppercase transition duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Render Container */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Premium KPI Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Total Registered Users",
                    value: stats?.totalUsers,
                    icon: Users,
                    color: "from-blue-500 to-indigo-500",
                    badge: `${users.filter((u: any) => u.status === "active").length} Active`
                  },
                  {
                    title: "Active Workspaces",
                    value: stats?.totalWorkspaces,
                    icon: Layers,
                    color: "from-purple-500 to-indigo-500",
                    badge: "Multi-Tenant"
                  },
                  {
                    title: "Total Logins Logged",
                    value: stats?.totalLogins,
                    icon: Key,
                    color: "from-emerald-500 to-teal-500",
                    badge: "Sign-in Events"
                  },
                  {
                    title: "Global Activity Logs",
                    value: stats?.totalLogs,
                    icon: Activity,
                    color: "from-amber-500 to-orange-500",
                    badge: "Audit Trails"
                  },
                ].map((kpi) => (
                  <Card key={kpi.title} className="shadow-lg relative overflow-hidden group hover:border-primary/30 transition duration-300">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-full group-hover:scale-125 transition duration-500" />
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{kpi.title}</p>
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-md shadow-primary/10`}>
                          <kpi.icon className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-baseline justify-between">
                        <h3 className="text-3xl font-extrabold text-foreground tracking-tight font-mono">{kpi.value}</h3>
                        <Badge variant="outline" className="text-[9px] bg-background border-border font-bold uppercase tracking-wider text-foreground">
                          {kpi.badge}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Overview Details Section */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Real-time System Audit Stream */}
                <Card className="lg:col-span-2 shadow-xl flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        <Activity className="h-4.5 w-4.5 text-primary" />
                        Live Operations Stream
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        The latest user mutations, switchings, and sign-ins across all tenants.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("audit")} className="border-border bg-background/50 text-xs font-semibold hover:bg-muted">
                      View Audit Log
                    </Button>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto max-h-[360px] pr-2 scrollbar-thin">
                    {activities.length === 0 ? (
                      <div className="py-12 text-center text-xs text-muted-foreground">
                        No activity records found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activities.slice(0, 7).map((log: any) => (
                          <div key={log.id} className="flex items-start gap-3.5 p-3 rounded-xl bg-card border border-border hover:bg-muted/30 transition duration-200">
                            {/* Type indicator bubble */}
                            <Badge variant="outline" className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${getLogTypeColor(log.type)}`}>
                              {log.type}
                            </Badge>

                            <div className="flex-1 space-y-1 text-left min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{log.action}</p>
                              
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-muted-foreground">
                                <span className="text-primary">{log.user.name || log.user.email}</span>
                                {log.workspaceName && (
                                  <>
                                    <span>•</span>
                                    <span className="text-foreground">Workspace: {log.workspaceName}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex flex-col justify-between h-full text-[10px] font-mono text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              <span className="text-[9px]">{log.ip}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* System Diagnostics & Parameters */}
                <Card className="shadow-xl flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <Monitor className="h-4.5 w-4.5 text-primary" />
                      Operations Diagnostics
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Administrative specifications, variables, and health logs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold">Node Environment</span>
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-mono font-bold">production</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold">OAuth Providers</span>
                        <div className="flex gap-1.5">
                          <Badge variant="outline" className="text-[9px] bg-muted border-border text-foreground font-bold uppercase">Google OAuth</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold">DB Client Schema</span>
                        <span className="font-mono text-primary font-bold text-[10px]">Prisma (PostgreSQL)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold">Super Admin Domain</span>
                        <span className="text-foreground font-bold font-mono text-[10px]">{superAdminEmail || "Not Configured"}</span>
                      </div>
                    </div>

                    {/* Quick performance indicators */}
                    <div className="space-y-3 mt-4 text-left">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                          <span>User Densities (Active / Total)</span>
                          <span className="font-mono text-foreground">
                            {Math.round((users.filter((u: any) => u.status === "active").length / (users.length || 1)) * 100)}%
                          </span>
                        </div>
                        <Progress value={(users.filter((u: any) => u.status === "active").length / (users.length || 1)) * 100} className="h-1.5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                          <span>Workspace Load Densities</span>
                          <span className="font-mono text-foreground">
                            {Math.round((workspaces.filter((w: any) => w.productCount > 0).length / (workspaces.length || 1)) * 100)}%
                          </span>
                        </div>
                        <Progress value={(workspaces.filter((w: any) => w.productCount > 0).length / (workspaces.length || 1)) * 100} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Users statistics bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-card border border-border gap-4">
                <div className="text-left">
                  <h3 className="text-base font-bold text-foreground">Registered Accounts</h3>
                  <p className="text-xs text-muted-foreground">Manage account properties, login cycles, and tenant workspace allocations.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-background border-border text-foreground font-bold font-mono">
                  Total Users: {users.length}
                </Badge>
              </div>

              {/* Users Grid Layout */}
              <div className="grid gap-4 md:grid-cols-2">
                {users.map((user: any) => (
                  <Card
                    key={user.id}
                    className="bg-card border-border hover:border-primary/30 transition duration-300 shadow-lg text-left"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* User Header Block */}
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-11 w-11 rounded-full ring-2 ring-primary/20 object-cover"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center ring-2 ring-primary/20 text-sm">
                            {user.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground truncate text-sm">{user.name}</h4>
                            
                            {user.role === "super_admin" && (
                              <Badge variant="outline" className="px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border-destructive/20">
                                Super Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate font-mono">{user.email}</p>
                        </div>

                        {/* Interactive Expand Workspace Button */}
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge
                            variant="outline"
                            className={`px-2 py-0 text-[9px] font-bold uppercase tracking-wider ${
                              user.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {user.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-muted/50 border border-border text-xs">
                        <div className="text-left space-y-0.5">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Logins</p>
                          <span className="font-bold text-foreground font-mono text-sm">{user.loginCount}</span>
                        </div>
                        <div className="text-left space-y-0.5">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Workspaces</p>
                          <span className="font-bold text-primary font-mono text-sm">{user.workspaces.length}</span>
                        </div>
                        <div className="text-left space-y-0.5">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Joined</p>
                          <span className="font-bold text-muted-foreground font-mono text-[10px] truncate block">{user.createdAt}</span>
                        </div>
                      </div>

                      {/* Expandable Workspace memberships list */}
                      <div className="space-y-2">
                        <button
                          onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          className="w-full flex items-center justify-between text-[11px] font-bold text-muted-foreground hover:text-foreground transition duration-200 cursor-pointer"
                        >
                          <span>{expandedUser === user.id ? "Hide workspaces" : "Show workspaces"} ({user.workspaces.length})</span>
                          <ChevronRight className={`h-3.5 w-3.5 transition duration-300 ${expandedUser === user.id ? "rotate-90 text-primary" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {expandedUser === user.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-1.5 pt-1.5 border-t border-border/60"
                            >
                              {user.workspaces.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground italic">No workspaces associated with this user yet.</p>
                              ) : (
                                user.workspaces.map((ws: any) => (
                                  <div key={ws.id} className="flex justify-between items-center p-2 rounded bg-background border border-border text-xs">
                                    <span className="font-semibold text-foreground">{ws.name}</span>
                                    <Badge variant="outline" className={`px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider ${
                                      ws.role === "OWNER" 
                                        ? "bg-primary/10 text-primary border-primary/20" 
                                        : "bg-muted border-border text-muted-foreground"
                                    }`}>
                                      {ws.role}
                                    </Badge>
                                  </div>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "workspaces" && (
            <motion.div
              key="workspaces"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Workspaces statistics header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-card border border-border gap-4">
                <div className="text-left">
                  <h3 className="text-base font-bold text-foreground">Workspaces Portfolio</h3>
                  <p className="text-xs text-muted-foreground">Analyze multi-tenant operations, client business categories, and storage levels.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-background border-border text-foreground font-bold font-mono">
                  Total Workspaces: {workspaces.length}
                </Badge>
              </div>

              {/* Workspaces Cards Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((ws: any) => (
                  <Card
                    key={ws.id}
                    className="bg-card border-border hover:border-primary/30 transition duration-300 shadow-xl flex flex-col text-left"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-bold text-foreground tracking-tight">
                            {ws.name}
                          </CardTitle>
                          <span className="font-mono text-[10px] text-muted-foreground block truncate">{ws.slug}</span>
                        </div>
                        <Badge variant="outline" className="px-1.5 py-0.5 text-[8px] bg-muted border-border text-muted-foreground font-bold uppercase tracking-wider">
                          {ws.currency}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                      {/* Meta Tags Row */}
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider bg-muted/50 text-muted-foreground border-border">
                          {ws.businessType}
                        </Badge>
                        <Badge variant="outline" className="px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider bg-muted/50 text-muted-foreground border-border">
                          {ws.inventorySize} Size
                        </Badge>
                      </div>

                      {/* Workspaces quantitative stats */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/30 border border-border my-3 text-center">
                        <div className="flex flex-col items-center">
                          <Package className="h-3.5 w-3.5 text-primary mb-1" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Products</span>
                          <span className="font-mono font-bold text-foreground text-xs mt-0.5">{ws.productCount}</span>
                        </div>
                        <div className="flex flex-col items-center border-x border-border">
                          <ShoppingCart className="h-3.5 w-3.5 text-primary mb-1" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Orders</span>
                          <span className="font-mono font-bold text-foreground text-xs mt-0.5">{ws.orderCount}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Users className="h-3.5 w-3.5 text-primary mb-1" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Members</span>
                          <span className="font-mono font-bold text-foreground text-xs mt-0.5">{ws.memberCount}</span>
                        </div>
                      </div>

                      {/* Owner Details Footer */}
                      <div className="pt-3.5 border-t border-border flex flex-col gap-1 text-[11px]">
                        <span className="text-muted-foreground uppercase font-bold tracking-wider text-[9px]">Workspace Owner</span>
                        {ws.owner ? (
                          <div className="flex items-center justify-between text-foreground">
                            <span className="font-bold truncate">{ws.owner.name}</span>
                            <span className="font-mono text-muted-foreground text-[10px] truncate max-w-[130px]">{ws.owner.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">No Owner Linked</span>
                        )}
                        <span className="text-[9px] text-muted-foreground font-mono mt-1">Created: {ws.createdAt}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "audit" && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              {/* Filter controls row */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 rounded-xl bg-card border border-border shadow-lg">
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="input-audit-search"
                    type="text"
                    placeholder="Search logs by action, email, or IP address..."
                    value={auditSearch}
                    onChange={(e) => {
                      setAuditSearch(e.target.value)
                      setAuditPage(1) // Reset page on filter
                    }}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  />
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1.5 flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3" /> Log Category
                  </span>
                  {[
                    { id: "all", label: "All Logs" },
                    { id: "auth", label: "Auth" },
                    { id: "create", label: "Create" },
                    { id: "update", label: "Update" },
                    { id: "delete", label: "Delete" },
                    { id: "settings", label: "Settings" }
                  ].map((type) => (
                    <button
                      key={type.id}
                      id={`btn-log-filter-${type.id}`}
                      onClick={() => {
                        setAuditFilterType(type.id)
                        setAuditPage(1) // Reset page on filter
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition ${
                        auditFilterType === type.id
                          ? "bg-primary border-primary text-primary-foreground shadow-lg"
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-border/80"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paginated Activities Grid */}
              <div className="flex-1 flex flex-col justify-between">
                {paginatedLogs.length === 0 ? (
                  <div className="py-20 text-center text-xs text-muted-foreground bg-muted/10 border border-border rounded-xl">
                    No activity logs match your search.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {paginatedLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-border/80 hover:bg-muted/10 transition text-left"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-mono text-[9px] text-muted-foreground tracking-wider">ID: {log.id.slice(0, 8)}...</span>
                            <Badge variant="outline" className={`px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider ${getLogTypeColor(log.type)}`}>
                              {log.type}
                            </Badge>
                          </div>

                          <p className="text-xs font-bold text-foreground leading-snug">{log.action}</p>
                          <div className="h-[1px] bg-border my-2" />

                          {/* Profile block */}
                          <div className="flex items-center gap-2">
                            {log.user.image ? (
                              <img
                                src={log.user.image}
                                alt={log.user.name}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center">
                                {log.user.name[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-foreground truncate leading-none">{log.user.name}</p>
                              <span className="text-[8px] font-mono text-muted-foreground truncate block mt-0.5">{log.user.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Audit Log Footer Details */}
                        <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                          <div className="flex flex-col text-left">
                            {log.workspaceName ? (
                              <span className="text-foreground font-semibold truncate max-w-[120px]">WS: {log.workspaceName}</span>
                            ) : (
                              <span className="text-muted-foreground">Global Space</span>
                            )}
                            <span className="text-[8px] text-muted-foreground mt-0.5">IP: {log.ip}</span>
                          </div>
                          <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center border-t border-border pt-6 mt-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Showing logs {(auditPage - 1) * logsPerPage + 1} - {Math.min(auditPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length}
                    </span>

                    <div className="flex gap-1.5">
                      <Button
                        id="btn-audit-prev"
                        variant="outline"
                        size="sm"
                        disabled={auditPage === 1}
                        onClick={() => setAuditPage(auditPage - 1)}
                        className="text-[10px] font-bold uppercase tracking-wider border-border bg-background"
                      >
                        Prev
                      </Button>
                      <div className="flex items-center px-3 border border-border rounded-lg bg-background text-[10px] font-bold font-mono text-foreground">
                        Page {auditPage} / {totalPages}
                      </div>
                      <Button
                        id="btn-audit-next"
                        variant="outline"
                        size="sm"
                        disabled={auditPage === totalPages}
                        onClick={() => setAuditPage(auditPage + 1)}
                        className="text-[10px] font-bold uppercase tracking-wider border-border bg-background"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
