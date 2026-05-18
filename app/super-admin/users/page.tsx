"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { Users, ChevronRight, Shield, Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type WorkspaceMembership = {
  id: string
  name: string
  role: string
}

type SuperAdminUser = {
  id: string
  name: string
  email: string
  image?: string | null
  role: string
  status: string
  loginCount: number
  createdAt: string
  workspaces: WorkspaceMembership[]
}

type SuperAdminUsersData = {
  users?: SuperAdminUser[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SuperAdminUsersPage() {
  const { data, error, isLoading, mutate } = useSWR<SuperAdminUsersData>(
    "/api/super-admin/data",
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  )

  // Expanded workspace view per user ID
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Failed to Load Users Directory
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
          Loading Administrative User Directory...
        </p>
      </div>
    )
  }

  const { users = [] } = data || {}

  return (
    <div className="flex flex-1 flex-col space-y-6 text-left">
      {/* Users statistics bar */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-md sm:flex-row sm:items-center">
        <div className="space-y-1 text-left">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Registered Accounts Directory
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage user system properties, access metrics, and multi-tenant
            workspace allocations.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-border bg-background px-3.5 py-1 font-mono font-bold text-foreground shadow-sm"
        >
          Total Users: {users.length}
        </Badge>
      </div>

      {/* Users Grid Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {users.map((user) => (
          <Card
            key={user.id}
            className="border-border bg-card text-left shadow-lg transition duration-300 hover:border-primary/30"
          >
            <CardContent className="space-y-4 p-5">
              {/* User Header Block */}
              <div className="flex items-center gap-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-2 ring-primary/20">
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-bold text-foreground">
                      {user.name}
                    </h4>

                    {user.role === "super_admin" && (
                      <Badge
                        variant="outline"
                        className="border-destructive/20 bg-destructive/10 px-1.5 py-0 text-[8px] font-bold tracking-wider text-destructive uppercase"
                      >
                        Super Admin
                      </Badge>
                    )}
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-1.5">
                  <Badge
                    variant="outline"
                    className={`px-2 py-0 text-[9px] font-bold tracking-wider uppercase ${
                      user.status === "active"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>

              {/* Middle Details Grid */}
              <div className="grid grid-cols-3 gap-2.5 rounded-lg border border-border bg-muted/50 p-3 text-xs">
                <div className="space-y-0.5 text-left">
                  <p className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                    Logins
                  </p>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {user.loginCount}
                  </span>
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                    Workspaces
                  </p>
                  <span className="font-mono text-sm font-bold text-primary">
                    {user.workspaces.length}
                  </span>
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                    Joined
                  </p>
                  <span className="block truncate font-mono text-[10px] font-bold text-muted-foreground">
                    {user.createdAt}
                  </span>
                </div>
              </div>

              {/* Expandable Workspace memberships list */}
              <div className="space-y-2">
                <button
                  onClick={() =>
                    setExpandedUser(expandedUser === user.id ? null : user.id)
                  }
                  className="flex w-full cursor-pointer items-center justify-between text-[11px] font-bold text-muted-foreground transition duration-200 hover:text-foreground"
                >
                  <span>
                    {expandedUser === user.id
                      ? "Hide workspaces"
                      : "Show workspaces"}{" "}
                    ({user.workspaces.length})
                  </span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition duration-300 ${expandedUser === user.id ? "rotate-90 text-primary" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {expandedUser === user.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden border-t border-border/60 pt-1.5"
                    >
                      {user.workspaces.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground italic">
                          No workspaces associated with this user yet.
                        </p>
                      ) : (
                        user.workspaces.map((ws) => (
                          <div
                            key={ws.id}
                            className="flex items-center justify-between rounded border border-border bg-background p-2 text-xs"
                          >
                            <span className="font-semibold text-foreground">
                              {ws.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`px-1.5 py-0 text-[8px] font-bold tracking-wider uppercase ${
                                ws.role === "OWNER"
                                  ? "border-primary/20 bg-primary/10 text-primary"
                                  : "border-border bg-muted text-muted-foreground"
                              }`}
                            >
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
    </div>
  )
}
