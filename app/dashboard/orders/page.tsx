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
  delivered: { style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400", label: "Delivered" },
  shipped: { style: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400", label: "Shipped" },
  processing: { style: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400", label: "Processing" },
  pending: { style: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400", label: "Pending" },
  cancelled: { style: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400", label: "Cancelled" },
}

const paymentConfig: Record<string, { style: string; label: string }> = {
  paid: { style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400", label: "Paid" },
  unpaid: { style: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400", label: "Unpaid" },
  refunded: { style: "bg-muted text-muted-foreground border-muted", label: "Refunded" },
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

  const handleUpdatePayment = async (id: string, payment: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment }),
      })

      if (!res.ok) throw new Error("Failed to update payment status")

      toast.success(`Payment marked as ${payment}`)
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
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead className="w-[120px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="w-[100px] text-right">Items</TableHead>
                  <TableHead className="w-[120px] text-right">Total</TableHead>
                  <TableHead className="w-[130px] pl-6">Status</TableHead>
                  <TableHead className="w-[130px] pl-6">Payment</TableHead>
                  <TableHead className="w-[140px]">Date</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order, index) => (
                  <TableRow 
                    key={order.id}
                    className="group transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => { setSelectedOrderId(order.id); setIsDetailsOpen(true); }}
                  >
                    <TableCell className="text-center font-mono text-xs text-muted-foreground/80 py-2.5">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-2.5 font-mono">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {order.id.slice(0, 8)}
                      </code>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-inner transition-transform group-hover:scale-105">
                          <span className="text-xs font-bold">{order.customer.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="truncate font-semibold tracking-tight text-foreground text-sm">
                          {order.customer}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-2.5 font-mono text-sm">{order.items}</TableCell>
                    <TableCell className="text-right py-2.5 font-mono font-medium text-sm">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="py-2.5 pl-6">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border
                        ${statusConfig[order.status]?.style || "bg-muted text-muted-foreground border-muted"}
                      `}>
                        {statusConfig[order.status]?.label}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 pl-6">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border
                        ${paymentConfig[order.payment]?.style || "bg-muted text-muted-foreground border-muted"}
                      `}>
                        {paymentConfig[order.payment]?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2.5">{order.date}</TableCell>
                    <TableCell className="py-2.5 w-[50px]" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1.5 space-y-0.5">
                          {/* Order Status Transitions */}
                          {order.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "processing")} className="cursor-pointer">
                              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>Mark Processing</span>
                            </DropdownMenuItem>
                          )}
                          {order.status === "processing" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "shipped")} className="cursor-pointer">
                              <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>Mark Shipped</span>
                            </DropdownMenuItem>
                          )}
                          {order.status === "shipped" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "delivered")} className="cursor-pointer">
                              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>Mark Delivered</span>
                            </DropdownMenuItem>
                          )}

                          {/* Payment status transitions */}
                          {order.payment === "unpaid" ? (
                            <DropdownMenuItem onClick={() => handleUpdatePayment(order.id, "paid")} className="text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer">
                              <DollarSign className="mr-2 h-4 w-4" />
                              <span>Mark Paid</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUpdatePayment(order.id, "unpaid")} className="text-muted-foreground cursor-pointer">
                              <DollarSign className="mr-2 h-4 w-4" />
                              <span>Mark Unpaid</span>
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive cursor-pointer"
                            disabled={order.status === "cancelled"}
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Cancel order</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {orders?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground italic">No orders found.</TableCell>
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

