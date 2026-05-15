"use client"

import useSWR from "swr"
import {
  AlertCircle, AlertTriangle, ArrowUpRight, Bell, CheckCircle2, Package,
  ShoppingCart, TrendingDown, XCircle, Loader2, ShieldAlert, Flame, Layers, Box
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function AlertCard({ item, severity }: { item: any; severity: "critical" | "warning" }) {
  const max = item.maxStock || 100
  const pct = Math.round((item.stock / max) * 100)
  return (
    <Card className={severity === "critical" ? "border-red-500/30" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${severity === "critical" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
              <AlertTriangle className={`h-5 w-5 ${severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
            </div>
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.sku} · {item.category}</p>
            </div>
          </div>
          <Badge variant="secondary" className={`text-xs ${severity === "critical" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
            {severity === "critical" ? "Critical" : "Low Stock"}
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stock level</span>
            <span className="font-mono font-medium">{item.stock} / {max}</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1"><ShoppingCart className="mr-1.5 h-3.5 w-3.5" />Reorder</Button>
          <Button variant="outline" size="sm">Dismiss</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AlertsPage() {
  const { data: products, isLoading } = useSWR<any[]>('/api/products?status=low-stock', fetcher)
  const { data: criticalProducts, isLoading: cLoading } = useSWR<any[]>('/api/products?status=critical', fetcher)

  const lowStockAlerts = products || []
  const criticalAlerts = criticalProducts || []
  const resolvedAlerts: any[] = [] // Demo empty for now

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Alerts</h1>
          <p className="text-sm text-muted-foreground">Monitor inventory levels and restock notifications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="auto-reorder" />
            <Label htmlFor="auto-reorder" className="text-sm">Auto-reorder</Label>
          </div>
          <Button variant="outline" size="sm"><Bell className="mr-1.5 h-3.5 w-3.5" />Configure</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Critical Alerts",
            value: cLoading ? "-" : criticalAlerts.length,
            icon: Flame,
            color: "text-rose-600 dark:text-rose-400",
          },
          {
            label: "Low Stock Warnings",
            value: isLoading ? "-" : lowStockAlerts.length,
            icon: AlertCircle,
            color: "text-orange-600 dark:text-orange-400",
          },
          {
            label: "Resolved Today",
            value: resolvedAlerts.length,
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
          },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">{metric.label}</p>
                  <h3 className={`text-lg font-bold ${metric.color}`}>{metric.value}</h3>
                </div>
                <metric.icon className={`h-4 w-4 ${metric.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({criticalAlerts.length + lowStockAlerts.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedAlerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {isLoading || cLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {criticalAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-red-500">
                    <XCircle className="h-4 w-4" /> Critical — Immediate action required
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {criticalAlerts.map((item) => (
                      <AlertCard key={item.id} item={item} severity="critical" />
                    ))}
                  </div>
                </div>
              )}

              {criticalAlerts.length > 0 && lowStockAlerts.length > 0 && <Separator />}

              {lowStockAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-500">
                    <AlertTriangle className="h-4 w-4" /> Low Stock Warnings
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {lowStockAlerts.map((item) => (
                      <AlertCard key={item.id} item={item} severity="warning" />
                    ))}
                  </div>
                </div>
              )}
              
              {criticalAlerts.length === 0 && lowStockAlerts.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">No active alerts. Inventory is healthy.</div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-3">
          <div className="text-center p-8 text-muted-foreground">No alerts resolved today.</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
