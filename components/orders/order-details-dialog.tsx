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
import { Button } from "@/components/ui/button"
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Order <span className="font-mono text-primary font-semibold">#{orderId.slice(0, 8)}</span>
          </DialogTitle>
          <DialogDescription>Full breakdown and status of the selected order.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : order ? (
          <div className="space-y-6 pt-4">
            {/* Metadata Preview Box */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/5 p-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</span>
                <p className="font-semibold text-sm text-foreground truncate">{order.customer}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Date</span>
                <p className="font-semibold text-sm text-foreground">
                  {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                <div>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border
                    ${statusConfig[order.status]?.style || "bg-muted text-muted-foreground border-muted"}
                  `}>
                    {statusConfig[order.status]?.label || order.status}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment</span>
                <div>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border
                    ${paymentConfig[order.payment]?.style || "bg-muted text-muted-foreground border-muted"}
                  `}>
                    {paymentConfig[order.payment]?.label || order.payment}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items Included</span>
                <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{order.orderItems.length} Products</span>
              </div>
              
              <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-xs font-medium">Product</TableHead>
                      <TableHead className="text-right text-xs font-medium">Qty</TableHead>
                      <TableHead className="text-right text-xs font-medium">Unit</TableHead>
                      <TableHead className="text-right text-xs font-medium">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-primary/5">
                        <TableCell className="py-2">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-foreground">{item.product.name}</span>
                            <span className="text-[9px] font-mono text-muted-foreground">SKU: {item.product.sku}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">{item.quantity}</TableCell>
                        <TableCell className="text-right font-mono text-xs py-2">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold py-2">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Compact integrated order sum footer */}
                <div className="bg-muted/20 border-t px-4 py-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (0%)</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  <div className="border-t border-border/40 my-1 pt-1.5 flex justify-between items-baseline text-foreground">
                    <span className="font-bold uppercase text-[10px] tracking-wider">Total</span>
                    <span className="font-mono font-extrabold text-base text-primary">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
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
