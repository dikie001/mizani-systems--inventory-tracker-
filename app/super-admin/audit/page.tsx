"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Clock,
  Search,
  SlidersHorizontal,
  Shield,
  Loader2
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SuperAdminAuditPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/super-admin/data", fetcher, {
    refreshInterval: 10000 // Refresh stats every 10 seconds
  })

  const [auditSearch, setAuditSearch] = useState("")
  const [auditFilterType, setAuditFilterType] = useState<string>("all")
  const [auditPage, setAuditPage] = useState(1)
  const logsPerPage = 12

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Failed to Load Activity Logs</h2>
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
          Accessing Global Audit Logs Stream...
        </p>
      </div>
    )
  }

  const { activities = [] } = data || {}

  // Filter audit logs based on search query and selected log type
  const filteredLogs = activities.filter((log: any) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.user?.email && log.user.email.toLowerCase().includes(auditSearch.toLowerCase())) ||
      (log.user?.name && log.user.name.toLowerCase().includes(auditSearch.toLowerCase())) ||
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
    <div className="space-y-6 flex-1 flex flex-col text-left">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl bg-card border border-border gap-4 shadow-md">
        <div className="text-left space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Global Activity Trail
          </h3>
          <p className="text-xs text-muted-foreground">Trace global logins, logouts, administrative mutations, and workspace isolations.</p>
        </div>
        <Badge variant="outline" className="px-3.5 py-1 bg-background border-border text-foreground font-bold font-mono shadow-sm">
          Total Logs: {activities.length}
        </Badge>
      </div>

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
        <AnimatePresence mode="wait">
          {paginatedLogs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center text-xs text-muted-foreground bg-muted/10 border border-border rounded-xl"
            >
              No activity logs match your search.
            </motion.div>
          ) : (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            >
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
                      {log.user?.image ? (
                        <img
                          src={log.user.image}
                          alt={log.user.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center">
                          {log.user?.name ? log.user.name[0] : "S"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-foreground truncate leading-none">{log.user?.name || "System"}</p>
                        <span className="text-[8px] font-mono text-muted-foreground truncate block mt-0.5">{log.user?.email || "system@stockvault.internal"}</span>
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
            </motion.div>
          )}
        </AnimatePresence>

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
    </div>
  )
}
