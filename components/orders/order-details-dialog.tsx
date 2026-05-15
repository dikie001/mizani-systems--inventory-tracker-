"use client"

import useSWR from "swr"
import { Loader2, Package, User, Calendar, CreditCard, Activity, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

export function OrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: order, isLoading } = useSWR(
    orderId ? `/api/orders/${orderId}` : null,
    fetcher
  )

  if (!orderId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              Order <span className="font-mono text-primary">#{orderId.slice(0, 8)}</span>
            </DialogTitle>
          </div>
          <DialogDescription>Full breakdown and status of the selected order.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
          </div>
        ) : order ? (
          <div className="grid gap-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Customer</span>
                </div>
                <p className="font-medium text-sm truncate">{order.customer}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Date</span>
                </div>
                <p className="font-medium text-sm">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Status</span>
                </div>
                <div>
                  <Badge variant="secondary" className={`text-[10px] uppercase font-bold px-2 ${statusConfig[order.status]?.style || ""}`}>
                    {statusConfig[order.status]?.label || order.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Payment</span>
                </div>
                <div>
                  <Badge variant="secondary" className={`text-[10px] uppercase font-bold px-2 ${paymentConfig[order.payment]?.style || ""}`}>
                    {paymentConfig[order.payment]?.label || order.payment}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="bg-primary/5" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" /> 
                  Items Included
                </h4>
                <Badge variant="outline" className="text-[10px] font-mono">{order.orderItems.length} Products</Badge>
              </div>
              
              <div className="rounded-lg border shadow-sm overflow-hidden bg-muted/5">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-[10px] uppercase font-bold">Product</TableHead>
                      <TableHead className="text-right text-[10px] uppercase font-bold">Qty</TableHead>
                      <TableHead className="text-right text-[10px] uppercase font-bold">Unit</TableHead>
                      <TableHead className="text-right text-[10px] uppercase font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-primary/5">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{item.product.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">SKU: {item.product.sku}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right font-mono text-sm">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 bg-muted/20 p-4 rounded-lg">
              <div className="flex justify-between w-full max-w-[200px] text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full max-w-[200px] text-xs text-muted-foreground">
                <span>Tax (0%)</span>
                <span className="font-mono">$0.00</span>
              </div>
              <Separator className="w-full max-w-[200px] my-1" />
              <div className="flex justify-between w-full max-w-[200px] items-baseline">
                <span className="font-bold text-sm uppercase">Total</span>
                <span className="font-bold text-2xl font-mono tracking-tighter text-primary">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-destructive py-12 space-y-2">
            <p className="font-bold">Error loading order</p>
            <p className="text-xs text-muted-foreground">Please try again or contact support.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
