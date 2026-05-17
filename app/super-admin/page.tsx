"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  Users,
  Layers,
  Key,
  Activity,
  Clock,
  Monitor,
  Shield,
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
  
  const router = useRouter()

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

      {/* Premium KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Registered Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "from-blue-500 to-indigo-500",
            badge: `${users.filter((u: any) => u.status === "active").length} Active`
          },
          {
            title: "Active Workspaces",
            value: stats?.totalWorkspaces || 0,
            icon: Layers,
            color: "from-purple-500 to-indigo-500",
            badge: "Multi-Tenant"
          },
          {
            title: "Total Logins Logged",
            value: stats?.totalLogins || 0,
            icon: Key,
            color: "from-emerald-500 to-teal-500",
            badge: "Sign-in Events"
          },
          {
            title: "Global Activity Logs",
            value: stats?.totalLogs || 0,
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
            <Button variant="outline" size="sm" onClick={() => router.push("/super-admin/audit")} className="border-border bg-background/50 text-xs font-semibold hover:bg-muted">
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
                        <span className="text-primary">{log.user?.name || log.user?.email}</span>
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
                    {users.length > 0 ? Math.round((users.filter((u: any) => u.status === "active").length / users.length) * 100) : 0}%
                  </span>
                </div>
                <Progress value={users.length > 0 ? (users.filter((u: any) => u.status === "active").length / users.length) * 100 : 0} className="h-1.5" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Workspace Load Densities</span>
                  <span className="font-mono text-foreground">
                    {workspaces.length > 0 ? Math.round((workspaces.filter((w: any) => w.productCount > 0).length / workspaces.length) * 100) : 0}%
                  </span>
                </div>
                <Progress value={workspaces.length > 0 ? (workspaces.filter((w: any) => w.productCount > 0).length / workspaces.length) * 100 : 0} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
