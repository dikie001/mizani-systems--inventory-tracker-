"use client"

import { useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  Search,
  Shield,
  Loader2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AuditLog = {
  id: string
  type: string
  action: string
  ip?: string | null
  timestamp: string
  workspaceName?: string | null
  user?: {
    name?: string | null
    email?: string | null
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
    image?: string | null
  }
}

type AuditData = {
  activities?: AuditLog[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SuperAdminAuditPage() {
  const { data, error, isLoading, mutate } = useSWR<AuditData>(
    "/api/super-admin/data",
    fetcher,
    {
      refreshInterval: 10000, // Refresh stats every 10 seconds
    }
  )

  const [auditSearch, setAuditSearch] = useState("")
  const [auditFilterType, setAuditFilterType] = useState<string>("all")
  const [auditViewMode, setAuditViewMode] = useState<"table" | "cards">("table")
  const [auditPage, setAuditPage] = useState(1)
  const logsPerPage = 12

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
    const [auditTypeSort, setAuditTypeSort] = useState<"asc" | "desc">("asc")
          <h2 className="text-xl font-bold text-foreground">
            Failed to Load Activity Logs
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
          Accessing Global Audit Logs Stream...
        </p>
      </div>
    )
  }

  const { activities = [] } = data || {}

  // Filter audit logs based on search query and selected log type
  const filteredLogs = activities.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.user?.email &&
        log.user.email.toLowerCase().includes(auditSearch.toLowerCase())) ||
      (log.user?.name &&
        log.user.name.toLowerCase().includes(auditSearch.toLowerCase())) ||
      (log.ip && log.ip.includes(auditSearch))

    const matchesType =
      auditFilterType === "all" || log.type === auditFilterType

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
      case "create":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "update":
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      const typeComparison = a.type.localeCompare(b.type)
      if (typeComparison !== 0) {
        return auditTypeSort === "asc" ? typeComparison : -typeComparison
      }

      return (
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    })

    const totalPages = Math.ceil(sortedLogs.length / logsPerPage)
    const paginatedLogs = sortedLogs.slice(
      (auditPage - 1) * logsPerPage,
      auditPage * logsPerPage
    )
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    }
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 text-left">
      {/* Header Info Banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-md sm:flex-row sm:items-center">
        <div className="space-y-1 text-left">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Global Activity Trail
          </h3>
          <p className="text-xs text-muted-foreground">
            Trace global logins, logouts, administrative mutations, and
            workspace isolations.
      <div className="flex flex-1 flex-col space-y-4 text-left">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Global Activity Trail
          </h1>
          <Badge
            variant="outline"
            className="border-border bg-background px-3 py-1 font-mono font-bold text-foreground shadow-sm"
          >
            {activities.length} logs
          </Badge>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              id="input-audit-search"
              type="text"
              placeholder="Search logs by action, email, or IP address..."
              value={auditSearch}
              onChange={(e) => {
                setAuditSearch(e.target.value)
                setAuditPage(1)
              }}
              className="h-10 w-full rounded-lg border border-border bg-background py-2 pr-4 pl-9 text-xs text-foreground placeholder-muted-foreground transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={auditFilterType}
              onValueChange={(value) => {
                setAuditFilterType(value)
                setAuditPage(1)
              }}
            >
              <SelectTrigger className="h-10 w-40 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={auditTypeSort}
              onValueChange={(value) => {
                setAuditTypeSort(value as "asc" | "desc")
                setAuditPage(1)
              }}
            >
              <SelectTrigger className="h-10 w-42.5 text-xs">
                <SelectValue placeholder="Sort by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Type A-Z</SelectItem>
                <SelectItem value="desc">Type Z-A</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={auditViewMode}
              onValueChange={(value) => setAuditViewMode(value as "table" | "cards")}
            >
              <SelectTrigger className="h-10 w-37.5 text-xs">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="cards">Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        </div>
        <Badge
          variant="outline"
          className="border-border bg-background px-3.5 py-1 font-mono font-bold text-foreground shadow-sm"
        >
          Total Logs: {activities.length}
        </Badge>
      </div>

      {/* Filter controls row */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-lg lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            id="input-audit-search"
            type="text"
            placeholder="Search logs by action, email, or IP address..."
            value={auditSearch}
            onChange={(e) => {
              setAuditSearch(e.target.value)
              setAuditPage(1) // Reset page on filter
            }}
            className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-9 text-xs text-foreground placeholder-muted-foreground transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1.5 flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
              <SlidersHorizontal className="h-3 w-3" /> Log Category
            </span>
            {[
              { id: "all", label: "All Logs" },
              { id: "auth", label: "Auth" },
              { id: "create", label: "Create" },
              { id: "update", label: "Update" },
              { id: "delete", label: "Delete" },
              { id: "settings", label: "Settings" },
            ].map((type) => (
              <button
                key={type.id}
                id={`btn-log-filter-${type.id}`}
                onClick={() => {
                  setAuditFilterType(type.id)
                  setAuditPage(1) // Reset page on filter
                }}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition ${
                  auditFilterType === type.id
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
            <button
              id="btn-audit-view-table"
              onClick={() => setAuditViewMode("table")}
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition ${
                auditViewMode === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Table
            </button>
            <button
              id="btn-audit-view-cards"
              onClick={() => setAuditViewMode("cards")}
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition ${
                auditViewMode === "cards"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Paginated Activities Grid */}
      <div className="flex flex-1 flex-col justify-between">
        <AnimatePresence mode="wait">
          {paginatedLogs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-border bg-muted/10 py-20 text-center text-xs text-muted-foreground"
            >
              No activity logs match your search.
            </motion.div>
          ) : auditViewMode === "table" ? (
            <motion.div
              key="logs-table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        Timestamp
                      </TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="whitespace-nowrap">Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="whitespace-nowrap">
                        Workspace
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        IP Address
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-xs leading-snug font-semibold text-foreground">
                              {log.action}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              ID: {log.id.slice(0, 8)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`px-1.5 py-0 text-[8px] font-bold tracking-wider uppercase ${getLogTypeColor(log.type)}`}
                          >
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.user?.image ? (
                              <Image
                                src={log.user.image ?? ""}
                                alt={log.user?.name ?? "User"}
                                width={22}
                                height={22}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                                {log.user?.name ? log.user.name[0] : "S"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {log.user?.name || "System"}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {log.user?.email ||
                                  "system@stockvault.internal"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                          {log.workspaceName || "Global Space"}
                        </TableCell>
                        <TableCell className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                          {log.ip || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logs-cards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            >
              {paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition hover:border-border/80 hover:bg-muted/10"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[9px] tracking-wider text-muted-foreground">
                        ID: {log.id.slice(0, 8)}...
                      </span>
                      <Badge
                        variant="outline"
                        className={`px-1.5 py-0 text-[8px] font-bold tracking-wider uppercase ${getLogTypeColor(log.type)}`}
                      >
                        {log.type}
                      </Badge>
                    </div>

                    <p className="text-xs leading-snug font-bold text-foreground">
                      {log.action}
                    </p>
                    <div className="my-2 h-px bg-border" />

                    {/* Profile block */}
                    <div className="flex items-center gap-2">
                      {log.user?.image ? (
                        <Image
                          src={log.user.image ?? ""}
                          alt={log.user?.name ?? "User"}
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {log.user?.name ? log.user.name[0] : "S"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[10px] leading-none font-bold text-foreground">
                          {log.user?.name || "System"}
                        </p>
                        <span className="mt-0.5 block truncate font-mono text-[8px] text-muted-foreground">
                          {log.user?.email || "system@stockvault.internal"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Log Footer Details */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5 font-mono text-[9px] text-muted-foreground">
                    <div className="flex flex-col text-left">
                      {log.workspaceName ? (
                        <span className="max-w-30 truncate font-semibold text-foreground">
                          WS: {log.workspaceName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Global Space
                        </span>
                      )}
                      <span className="mt-0.5 text-[8px] text-muted-foreground">
                        IP: {log.ip}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Showing logs {(auditPage - 1) * logsPerPage + 1} -{" "}
              {Math.min(auditPage * logsPerPage, filteredLogs.length)} of{" "}
              {filteredLogs.length}
            </span>

            <div className="flex gap-1.5">
              <Button
                id="btn-audit-prev"
                variant="outline"
                size="sm"
                disabled={auditPage === 1}
                onClick={() => setAuditPage(auditPage - 1)}
                className="border-border bg-background text-[10px] font-bold tracking-wider uppercase"
              >
                Prev
              </Button>
              <div className="flex items-center rounded-lg border border-border bg-background px-3 font-mono text-[10px] font-bold text-foreground">
                Page {auditPage} / {totalPages}
              </div>
              <Button
                id="btn-audit-next"
                variant="outline"
                size="sm"
                disabled={auditPage === totalPages}
                onClick={() => setAuditPage(auditPage + 1)}
                className="border-border bg-background text-[10px] font-bold tracking-wider uppercase"
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
