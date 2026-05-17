"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  ChevronRight,
  Shield,
  Loader2
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SuperAdminUsersPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/super-admin/data", fetcher, {
    refreshInterval: 10000 // Refresh every 10 seconds
  })

  // Expanded workspace view per user ID
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Failed to Load Users Directory</h2>
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
          Loading Administrative User Directory...
        </p>
      </div>
    )
  }

  const { users = [] } = data || {}

  return (
    <div className="space-y-6 flex-1 flex flex-col text-left">
      {/* Users statistics bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl bg-card border border-border gap-4 shadow-md">
        <div className="text-left space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Registered Accounts Directory
          </h3>
          <p className="text-xs text-muted-foreground">Manage user system properties, access metrics, and multi-tenant workspace allocations.</p>
        </div>
        <Badge variant="outline" className="px-3.5 py-1 bg-background border-border text-foreground font-bold font-mono shadow-sm">
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

                {/* Status Badge */}
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
    </div>
  )
}
