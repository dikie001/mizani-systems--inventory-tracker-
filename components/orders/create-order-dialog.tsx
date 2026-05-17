"use client"

import { useState, useEffect } from "react"
import { useSWRConfig } from "swr"
import { Plus, Search, Trash2, Loader2, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  image?: string | null
}

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  image?: string | null
}

export function CreateOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState("")
  const [search, setSearch] = useState("")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [items, setItems] = useState<OrderItem[]>([])

  // Fetch all products when open
  useEffect(() => {
    if (open) {
      const fetchProducts = async () => {
        try {
          const res = await fetch("/api/products")
          const data = await res.json()
          setAllProducts(data)
        } catch (error) {
          console.error("Failed to fetch products:", error)
        }
      }
      fetchProducts()
    }
  }, [open])

  const addItem = (product: Product) => {
    const existing = items.find((i) => i.productId === product.id)
    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } else {
      setItems([...items, { productId: product.id, name: product.name, quantity: 1, price: product.price, image: product.image }])
    }
    setSearch("")
  }

  const filteredProducts = allProducts.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  })

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.productId !== id))
  }

  const updateQuantity = (id: string, q: number) => {
    if (q < 1) return
    setItems(items.map((i) => (i.productId === id ? { ...i, quantity: q } : i)))
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleSubmit = async () => {
    if (!customer) return toast.error("Please enter customer name")
    if (items.length === 0) return toast.error("Please add at least one item")

    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create order")
      }

      toast.success("Order created successfully")
      mutate((key: any) => typeof key === "string" && key.startsWith("/api/orders"))
      onOpenChange(false)
      setCustomer("")
      setItems([])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Add items and customer details to create a new order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name *</Label>
            <Input
              id="customer"
              placeholder="e.g. John Doe"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label>Add Products *</Label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="rounded-xl border bg-muted/10 p-2 space-y-1">
              <div className="px-3 py-1.5 flex justify-between items-center border-b border-border/40 pb-1.5 mb-1 bg-muted/30 -mx-2 -mt-2 rounded-t-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Catalog</span>
                <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{filteredProducts.length} items</span>
              </div>
              <div className="max-h-[140px] overflow-y-auto pr-1 space-y-0.5 divide-y divide-border/20">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0
                  const isLowStock = p.stock <= 10 && p.stock > 0
                  
                  return (
                    <button
                      type="button"
                      key={p.id}
                      disabled={isOutOfStock}
                      onClick={() => addItem(p)}
                      className={`flex w-full items-center justify-between py-1.5 px-2 rounded-lg transition-all text-xs text-left hover:bg-muted/50
                        ${isOutOfStock ? "opacity-40 cursor-not-allowed" : ""}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground/60" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground text-xs">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>SKU: {p.sku}</span>
                            <span>•</span>
                            <span className={`font-medium ${
                              isOutOfStock 
                                ? "text-red-500" 
                                : isLowStock 
                                  ? "text-amber-500 font-semibold" 
                                  : "text-emerald-500 font-semibold"
                            }`}>
                              {isOutOfStock 
                                ? "Out of Stock" 
                                : `${p.stock} in stock`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-foreground text-xs">${p.price.toFixed(2)}</p>
                        <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center text-primary transition-colors shrink-0">
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    </button>
                  )
                })}
                {filteredProducts.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground italic">
                    No products found matching "{search}".
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs font-medium">Product</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium text-center">Qty</TableHead>
                  <TableHead className="text-right text-xs font-medium">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-xs text-muted-foreground italic">
                      No items added yet. Search for products above to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground/60" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-tight text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            className="h-8 w-16 text-center"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.productId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center py-2.5 px-4 border-t bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</span>
              <span className="font-mono font-extrabold text-base text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || items.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
