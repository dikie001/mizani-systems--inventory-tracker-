"use client"

import useSWR from "swr"
import {
  Briefcase,
  Package,
  ShoppingCart,
  Users,
  Shield,
  Loader2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SuperAdminWorkspacesPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/super-admin/data", fetcher, {
    refreshInterval: 10000 // Refresh stats every 10 seconds
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Failed to Load Workspaces Grid</h2>
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
          Opening Administrative Workspaces Directory...
        </p>
      </div>
    )
  }

  const { workspaces = [] } = data || {}

  return (
    <div className="space-y-6 flex-1 flex flex-col text-left">
      {/* Workspaces statistics header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl bg-card border border-border gap-4 shadow-md">
        <div className="text-left space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Workspaces Portfolio
          </h3>
          <p className="text-xs text-muted-foreground">Analyze tenant business classifications, inventory levels, currencies, and membership counts.</p>
        </div>
        <Badge variant="outline" className="px-3.5 py-1 bg-background border-border text-foreground font-bold font-mono shadow-sm">
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
    </div>
  )
}
