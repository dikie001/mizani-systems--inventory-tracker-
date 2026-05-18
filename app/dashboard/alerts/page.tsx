"use client"

import useSWR, { mutate } from "swr"
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Flame,
  Loader2,
  ShoppingCart,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Link from "next/link"

type AlertItem = {
  id: string
  name: string
  sku: string
  category: string
  stock: number
  maxStock?: number | null
  severity: "critical" | "warning" | string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Request failed")
  }
  return response.json()
}

function AlertCard({ item, onDismiss }: { item: AlertItem; onDismiss: (id: string) => void }) {
  const max = item.maxStock || 100
  const pct = Math.round((item.stock / max) * 100)
  const severity = item.severity

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
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/dashboard/inventory?search=${item.sku}`}>
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />Restock
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDismiss(item.id)}>Dismiss</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AlertsPage() {
  const { data: activeAlerts, isLoading } = useSWR<AlertItem[]>('/api/alerts?status=active', fetcher)
  const { data: resolvedAlerts, isLoading: rLoading } = useSWR<AlertItem[]>('/api/alerts?status=resolved', fetcher)

  const alerts = Array.isArray(activeAlerts) ? activeAlerts : []
  const resolved = Array.isArray(resolvedAlerts) ? resolvedAlerts : []
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical')
  const lowStockAlerts = alerts.filter(a => a.severity === 'warning')

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' })
      })
      if (res.ok) {
        toast.success("Alert dismissed")
        mutate('/api/alerts?status=active')
        mutate('/api/alerts/counts')
      }
    } catch (error) {
      toast.error("Failed to dismiss alert")
    }
  }

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
            value: isLoading ? "-" : criticalAlerts.length,
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
            label: "Resolved Recently",
            value: rLoading ? "-" : resolved.length,
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
          <TabsTrigger value="active">Active ({alerts.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {isLoading ? (
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
                      <AlertCard key={item.id} item={item} onDismiss={handleDismiss} />
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
                      <AlertCard key={item.id} item={item} onDismiss={handleDismiss} />
                    ))}
                  </div>
                </div>
              )}
              
              {alerts.length === 0 && (
                <div className="text-center p-12 border rounded-xl border-dashed">
                  <div className="flex justify-center mb-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500/20" />
                  </div>
                  <p className="text-muted-foreground">No active alerts. Inventory is healthy.</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-3">
          {resolved.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {resolved.map((item) => (
                 <Card key={item.id} className="opacity-70">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Stock replenished · {item.stock} in stock</p>
                        </div>
                      </div>
                    </CardContent>
                 </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">No alerts resolved recently.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
