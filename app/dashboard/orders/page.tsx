"use client"

import { useState, useEffect } from "react"
import useSWR, { useSWRConfig } from "swr"
import { toast } from "sonner"
import {
  ChevronDown, Clock, DollarSign, Eye, Filter, MoreHorizontal,
  Package, Search, ShoppingCart, Truck, Loader2, Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

// New Dialogs
import { CreateOrderDialog } from "@/components/orders/create-order-dialog"
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusConfig: Record<string, { style: string; label: string }> = {
  delivered: { style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Delivered" },
  shipped: { style: "bg-blue-500/10 text-blue-600 dark:text-blue-400", label: "Shipped" },
  processing: { style: "bg-violet-500/10 text-violet-600 dark:text-violet-400", label: "Processing" },
  pending: { style: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Pending" },
  cancelled: { style: "bg-red-500/10 text-red-600 dark:text-red-400", label: "Cancelled" },
}

const paymentConfig: Record<string, { style: string; label: string }> = {
  paid: { style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Paid" },
  unpaid: { style: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Unpaid" },
  refunded: { style: "bg-muted text-muted-foreground", label: "Refunded" },
}

export default function OrdersPage() {
  const { mutate } = useSWRConfig()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("action") === "create") {
        setIsCreateOpen(true)
        const newUrl = window.location.pathname
        window.history.replaceState({}, "", newUrl)
      }
    }
  }, [])

  let url = `/api/orders?`
  if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`
  if (statusFilter !== "all") url += `status=${encodeURIComponent(statusFilter)}&`

  const { data: orders, error, isLoading } = useSWR<any[]>(url, fetcher)

  const totalRevenue = orders?.filter((o) => o.payment === "paid").reduce((s, o) => s + o.total, 0) || 0

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this order? This will restore product stock.")) return

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (!res.ok) throw new Error("Failed to cancel order")

      toast.success("Order cancelled and stock restored")
      mutate((key: any) => typeof key === "string" && key.startsWith("/api/orders"))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("Failed to update status")

      toast.success(`Order marked as ${status}`)
      mutate((key: any) => typeof key === "string" && key.startsWith("/api/orders"))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />Create Order
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Orders", value: isLoading ? "-" : orders?.length.toString(), icon: Package, color: "text-primary", bg: "bg-primary/10" },
          { label: "Pending", value: isLoading ? "-" : orders?.filter((o) => o.status === "pending").length.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "In Transit", value: isLoading ? "-" : orders?.filter((o) => o.status === "shipped").length.toString(), icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Revenue", value: isLoading ? "-" : `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Order History</CardTitle>
              <CardDescription>{isLoading ? "Loading..." : `${orders?.length || 0} orders`}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search orders..." className="h-8 w-48 pl-8 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-36 text-sm"><Filter className="mr-1.5 h-3 w-3" /><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : error ? (
            <div className="text-center text-red-500 p-8">Failed to load orders</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium">{order.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell className="text-right font-mono">{order.items}</TableCell>
                    <TableCell className="text-right font-mono">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${statusConfig[order.status]?.style}`}>
                        {statusConfig[order.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${paymentConfig[order.payment]?.style}`}>
                        {paymentConfig[order.payment]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedOrderId(order.id); setIsDetailsOpen(true); }}><Eye className="mr-2 h-3.5 w-3.5" />View details</DropdownMenuItem>
                          
                          {order.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "shipped")}><Truck className="mr-2 h-3.5 w-3.5" />Mark Shipped</DropdownMenuItem>
                          )}
                          {order.status === "shipped" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "delivered")}><Package className="mr-2 h-3.5 w-3.5" />Mark Delivered</DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            disabled={order.status === "cancelled"}
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            <span>Cancel order</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {orders?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic">No orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateOrderDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <OrderDetailsDialog orderId={selectedOrderId} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
    </div>
  )
}

