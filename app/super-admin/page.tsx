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
  Loader2,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/stat-card"

type SuperAdminStats = {
  totalUsers?: number
  totalWorkspaces?: number
  totalLogins?: number
  totalLogs?: number
}

type SuperAdminUser = {
  id: string
  status: string
}

type SuperAdminWorkspace = {
  id: string
  productCount: number
}

type SuperAdminActivity = {
  id: string
  type: string
  action: string
  user?: { name?: string | null; email?: string | null }
  workspaceName?: string | null
  timestamp: string
  ip?: string | null
}

type SuperAdminData = {
  stats?: SuperAdminStats
  users?: SuperAdminUser[]
  workspaces?: SuperAdminWorkspace[]
  activities?: SuperAdminActivity[]
  superAdminEmail?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SuperAdminPage() {
  const { data, error, isLoading, mutate } = useSWR<SuperAdminData>(
    "/api/super-admin/data",
    fetcher,
    {
      refreshInterval: 10000, // Refresh stats every 10 seconds for real-time vibe
    }
  )

  const router = useRouter()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Failed to Load Control Panel
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            There was an error communicating with the database or server. Ensure
            your database is running.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => mutate()}
          className="border-border bg-background text-foreground"
        >
          Retry Connection
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Initializing Administrative Terminal...
        </p>
      </div>
    )
  }

  const {
    stats,
    users = [],
    workspaces = [],
    activities = [],
    superAdminEmail = "",
  } = data || {}
  const activeUsers = users.filter((user) => user.status === "active")
  const workspacesWithProducts = workspaces.filter(
    (workspace) => workspace.productCount > 0
  )

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "update":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      case "delete":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "auth":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    }
  }

  return (
    <div className="flex flex-1 flex-col space-y-8">
      {/* Visual Dynamic Ribbon */}
      <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl backdrop-blur-md md:flex-row md:items-center md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent" />
        <div className="relative z-10 space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Operations Dashboard
          </h2>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Real-time multi-tenant health, workspace isolation metrics, and
            global audit trace analysis. System updates occur dynamically every
            10 seconds.
          </p>
        </div>

        {/* Connection status card */}
        <div className="relative z-10 flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-2.5 shadow-inner">
          <div className="relative flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500"></span>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              System Link
            </p>
            <p className="text-xs font-bold text-foreground">
              Active & Syncing
            </p>
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
            valColor: "text-blue-500",
            iconColor: "text-blue-500",
            description: `${activeUsers.length} active users`,
          },
          {
            title: "Active Workspaces",
            value: stats?.totalWorkspaces || 0,
            icon: Layers,
            valColor: "text-indigo-500",
            iconColor: "text-indigo-500",
            description: "Multi-tenant workspaces",
          },
          {
            title: "Total Logins Logged",
            value: stats?.totalLogins || 0,
            icon: Key,
            valColor: "text-emerald-500",
            iconColor: "text-emerald-500",
            description: "Google & email authentications",
          },
          {
            title: "Global Activity Logs",
            value: stats?.totalLogs || 0,
            icon: Activity,
            valColor: "text-orange-500",
            iconColor: "text-orange-500",
            description: "Immutable operations audit logs",
          },
        ].map((kpi) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            valColor={kpi.valColor}
            iconColor={kpi.iconColor}
            description={kpi.description}
          />
        ))}
      </div>

      {/* Overview Details Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Real-time System Audit Stream */}
        <Card className="flex flex-col shadow-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Activity className="h-4.5 w-4.5 text-primary" />
                Live Operations Stream
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                The latest user mutations, switchings, and sign-ins across all
                tenants.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/super-admin/audit")}
              className="border-border bg-background/50 text-xs font-semibold hover:bg-muted"
            >
              View Audit Log
            </Button>
          </CardHeader>
          <CardContent className="max-h-[360px] flex-1 scrollbar-thin overflow-auto pr-2">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No activity records found.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 7).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3.5 rounded-xl border border-border bg-card p-3 transition duration-200 hover:bg-muted/30"
                  >
                    {/* Type indicator bubble */}
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase ${getLogTypeColor(log.type)}`}
                    >
                      {log.type}
                    </Badge>

                    <div className="min-w-0 flex-1 space-y-1 text-left">
                      <p className="truncate text-xs font-bold text-foreground">
                        {log.action}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold text-muted-foreground">
                        <span className="text-primary">
                          {log.user?.name || log.user?.email}
                        </span>
                        {log.workspaceName && (
                          <>
                            <span>•</span>
                            <span className="text-foreground">
                              Workspace: {log.workspaceName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex h-full flex-col justify-between text-right font-mono text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                      <span className="text-[9px]">{log.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Diagnostics & Parameters */}
        <Card className="flex flex-col shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Monitor className="h-4.5 w-4.5 text-primary" />
              Operations Diagnostics
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Administrative specifications, variables, and health logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-3.5 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">
                  Node Environment
                </span>
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/10 font-mono text-[10px] font-bold text-primary"
                >
                  production
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">
                  OAuth Providers
                </span>
                <div className="flex gap-1.5">
                  <Badge
                    variant="outline"
                    className="border-border bg-muted text-[9px] font-bold text-foreground uppercase"
                  >
                    Google OAuth
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">
                  DB Client Schema
                </span>
                <span className="font-mono text-[10px] font-bold text-primary">
                  Prisma (PostgreSQL)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">
                  Super Admin Domain
                </span>
                <span className="font-mono text-[10px] font-bold text-foreground">
                  {superAdminEmail || "Not Configured"}
                </span>
              </div>
            </div>

            {/* Quick performance indicators */}
            <div className="mt-4 space-y-3 text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>User Densities (Active / Total)</span>
                  <span className="font-mono text-foreground">
                    {users.length > 0
                      ? Math.round((activeUsers.length / users.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    users.length > 0
                      ? (activeUsers.length / users.length) * 100
                      : 0
                  }
                  className="h-1.5"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Workspace Load Densities</span>
                  <span className="font-mono text-foreground">
                    {workspaces.length > 0
                      ? Math.round(
                          (workspacesWithProducts.length / workspaces.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    workspaces.length > 0
                      ? (workspacesWithProducts.length / workspaces.length) *
                        100
                      : 0
                  }
                  className="h-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
