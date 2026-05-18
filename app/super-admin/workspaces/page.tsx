"use client"

import useSWR from "swr"
import {
  Briefcase,
  Package,
  ShoppingCart,
  Users,
  Shield,
  Loader2,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type WorkspaceSummary = {
  id: string
  name: string
  slug: string
  currency: string
  businessType: string
  inventorySize: string
  productCount: number
  orderCount: number
  memberCount: number
  createdAt: string
  owner?: {
    name: string
    email: string
  } | null
}

type SuperAdminWorkspacesData = {
  workspaces?: WorkspaceSummary[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SuperAdminWorkspacesPage() {
  const { data, error, isLoading, mutate } = useSWR<SuperAdminWorkspacesData>(
    "/api/super-admin/data",
    fetcher,
    {
      refreshInterval: 10000, // Refresh stats every 10 seconds
    }
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Failed to Load Workspaces Grid
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
          Opening Administrative Workspaces Directory...
        </p>
      </div>
    )
  }

  const { workspaces = [] } = data || {}

  return (
    <div className="flex flex-1 flex-col space-y-6 text-left">
      {/* Workspaces statistics header */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-md sm:flex-row sm:items-center">
        <div className="space-y-1 text-left">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Briefcase className="h-5 w-5 text-primary" />
            Workspaces Portfolio
          </h3>
          <p className="text-xs text-muted-foreground">
            Analyze tenant business classifications, inventory levels,
            currencies, and membership counts.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-border bg-background px-3.5 py-1 font-mono font-bold text-foreground shadow-sm"
        >
          Total Workspaces: {workspaces.length}
        </Badge>
      </div>

      {/* Workspaces Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((ws) => (
          <Card
            key={ws.id}
            className="flex flex-col border-border bg-card text-left shadow-xl transition duration-300 hover:border-primary/30"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-bold tracking-tight text-foreground">
                    {ws.name}
                  </CardTitle>
                  <span className="block truncate font-mono text-[10px] text-muted-foreground">
                    {ws.slug}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-border bg-muted px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-muted-foreground uppercase"
                >
                  {ws.currency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4">
              {/* Meta Tags Row */}
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="border-border bg-muted/50 px-1.5 py-0 text-[8px] font-bold tracking-wider text-muted-foreground uppercase"
                >
                  {ws.businessType}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-border bg-muted/50 px-1.5 py-0 text-[8px] font-bold tracking-wider text-muted-foreground uppercase"
                >
                  {ws.inventorySize} Size
                </Badge>
              </div>

              {/* Workspaces quantitative stats */}
              <div className="my-3 grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-center">
                <div className="flex flex-col items-center">
                  <Package className="mb-1 h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Products
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-foreground">
                    {ws.productCount}
                  </span>
                </div>
                <div className="flex flex-col items-center border-x border-border">
                  <ShoppingCart className="mb-1 h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Orders
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-foreground">
                    {ws.orderCount}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="mb-1 h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Members
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-foreground">
                    {ws.memberCount}
                  </span>
                </div>
              </div>

              {/* Owner Details Footer */}
              <div className="flex flex-col gap-1 border-t border-border pt-3.5 text-[11px]">
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                  Workspace Owner
                </span>
                {ws.owner ? (
                  <div className="flex items-center justify-between text-foreground">
                    <span className="truncate font-bold">{ws.owner.name}</span>
                    <span className="max-w-[130px] truncate font-mono text-[10px] text-muted-foreground">
                      {ws.owner.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">
                    No Owner Linked
                  </span>
                )}
                <span className="mt-1 font-mono text-[9px] text-muted-foreground">
                  Created: {ws.createdAt}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
