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
}

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
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
  const [products, setProducts] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([])

  // Search products
  useEffect(() => {
    if (search.length < 2) {
      setProducts([])
      return
    }

    const handler = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(search)}`)
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error(error)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [search])

  const addItem = (product: Product) => {
    const existing = items.find((i) => i.productId === product.id)
    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } else {
      setItems([...items, { productId: product.id, name: product.name, quantity: 1, price: product.price }])
    }
    setSearch("")
    setProducts([])
  }

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>Add items and customer details to create a new order.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer Name</Label>
            <Input
              id="customer"
              placeholder="e.g. John Doe"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <Label>Add Products</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
              
              {products.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-[200px] overflow-y-auto">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => addItem(p)}
                    >
                      <div className="text-left">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {p.sku} | Stock: {p.stock}</p>
                      </div>
                      <p className="font-mono font-semibold">${p.price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider">Product</TableHead>
                  <TableHead className="w-[100px] text-xs uppercase tracking-wider text-center">Qty</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                      No items added yet. Search for products above to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
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
          </div>

          <div className="flex justify-between items-center py-4 px-2 border-t bg-muted/20 rounded-b-md">
             <span className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Order Summary Total</span>
             <span className="font-bold text-2xl font-mono tracking-tight text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || items.length === 0} className="shadow-sm">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
