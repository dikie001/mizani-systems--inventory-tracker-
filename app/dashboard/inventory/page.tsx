"use client"

import { ChangeEvent, FormEvent, useId, useRef, useState } from "react"
import useSWR from "swr"
import {
  AlertTriangle,
  ArrowUpDown,
  Box,
  Download,
  Edit,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type InventoryProduct = {
  id: string
  name: string
  sku: string
  description: string | null
  category: string
  categoryId: string
  warehouse: string
  warehouseId: string
  warehouseLocation: string | null
  price: number
  stock: number
  minStock: number
  maxStock: number
  status: "in-stock" | "low-stock" | "critical"
  createdAt: string
  updatedAt: string
  movementCount: number
  orderCount: number
  recentMovements?: InventoryMovement[]
}

type InventoryMovement = {
  id: string
  type: string
  quantity: number
  status: string
  createdAt: string
}

type InventoryMeta = {
  categories: Array<{ id: string; name: string }>
  warehouses: Array<{ id: string; name: string; location: string | null }>
}

type NoticeState = {
  type: "success" | "error"
  message: string
} | null

type ProductFormValues = {
  name: string
  sku: string
  category: string
  warehouse: string
  price: string
  stock: string
  minStock: string
  maxStock: string
  description: string
}

type StockAdjustmentValues = {
  productId: string
  productName: string
  type: string
  quantity: string
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url)
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      payload && typeof payload.error === "string"
        ? payload.error
        : "Request failed.",
    )
  }

  return payload as T
}

const statusConfig: Record<
  InventoryProduct["status"],
  { label: string; className: string }
> = {
  "in-stock": {
    label: "In Stock",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  "low-stock": {
    label: "Low Stock",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
}

const emptyProductForm = (warehouse = "Main"): ProductFormValues => ({
  name: "",
  sku: "",
  category: "",
  warehouse,
  price: "",
  stock: "0",
  minStock: "10",
  maxStock: "100",
  description: "",
})

const emptyStockAdjustment = (): StockAdjustmentValues => ({
  productId: "",
  productName: "",
  type: "Manual Adjustment",
  quantity: "",
})

function buildProductsUrl(filters: {
  searchQuery: string
  categoryFilter: string
  statusFilter: string
  warehouseFilter: string
}) {
  const params = new URLSearchParams()

  if (filters.searchQuery) {
    params.set("search", filters.searchQuery)
  }

  if (filters.categoryFilter !== "all") {
    params.set("category", filters.categoryFilter)
  }

  if (filters.statusFilter !== "all") {
    params.set("status", filters.statusFilter)
  }

  if (filters.warehouseFilter !== "all") {
    params.set("warehouse", filters.warehouseFilter)
  }

  const query = params.toString()
  return query ? `/api/products?${query}` : "/api/products"
}

function productToFormValues(product: InventoryProduct): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    warehouse: product.warehouse,
    price: String(product.price),
    stock: String(product.stock),
    minStock: String(product.minStock),
    maxStock: String(product.maxStock),
    description: product.description ?? "",
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export default function InventoryPage() {
  const categoryListId = useId()
  const warehouseListId = useId()
  const importInputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [warehouseFilter, setWarehouseFilter] = useState("all")
  const [notice, setNotice] = useState<NoticeState>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [formOpen, setFormOpen] = useState(false)
  const [formValues, setFormValues] = useState<ProductFormValues>(
    emptyProductForm(),
  )
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [submittingForm, setSubmittingForm] = useState(false)
  const [detailsProductId, setDetailsProductId] = useState<string | null>(null)
  const [adjustmentOpen, setAdjustmentOpen] = useState(false)
  const [adjustmentValues, setAdjustmentValues] = useState<StockAdjustmentValues>(
    emptyStockAdjustment(),
  )
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const productsUrl = buildProductsUrl({
    searchQuery,
    categoryFilter,
    statusFilter,
    warehouseFilter,
  })

  const {
    data: products,
    error,
    isLoading,
    mutate: mutateProducts,
  } = useSWR<InventoryProduct[]>(productsUrl, fetcher)
  const { data: meta } = useSWR<InventoryMeta>("/api/inventory/meta", fetcher)
  const {
    data: selectedProduct,
    error: selectedProductError,
    isLoading: loadingSelectedProduct,
    mutate: mutateSelectedProduct,
  } = useSWR<InventoryProduct>(
    detailsProductId ? `/api/products/${detailsProductId}` : null,
    fetcher,
  )

  const categories = meta?.categories ?? []
  const warehouses = meta?.warehouses ?? []
  const totalUnits =
    products?.reduce((total, product) => total + product.stock, 0) ?? 0
  const lowStockCount =
    products?.filter((product) => product.status === "low-stock").length ?? 0
  const criticalCount =
    products?.filter((product) => product.status === "critical").length ?? 0

  const beginCreate = () => {
    setNotice(null)
    setFormMode("create")
    setEditingProductId(null)
    setFormValues(emptyProductForm(warehouses[0]?.name ?? "Main"))
    setFormOpen(true)
  }

  const beginEdit = (product: InventoryProduct) => {
    setNotice(null)
    setFormMode("edit")
    setEditingProductId(product.id)
    setFormValues(productToFormValues(product))
    setFormOpen(true)
  }

  const beginAdjustment = (product: InventoryProduct) => {
    setNotice(null)
    setAdjustmentValues({
      productId: product.id,
      productName: product.name,
      type: "Manual Adjustment",
      quantity: "",
    })
    setAdjustmentOpen(true)
  }

  const handleFormValueChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleAdjustmentChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target
    setAdjustmentValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const refreshInventory = async () => {
    await mutateProducts()
    if (detailsProductId) {
      await mutateSelectedProduct()
    }
  }

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittingForm(true)
    setNotice(null)

    try {
      const endpoint =
        formMode === "create" ? "/api/products" : `/api/products/${editingProductId}`
      const method = formMode === "create" ? "POST" : "PUT"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
          sku: formValues.sku.toUpperCase(),
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to save product.",
        )
      }

      setFormOpen(false)
      setEditingProductId(null)
      setFormValues(emptyProductForm(warehouses[0]?.name ?? "Main"))
      setNotice({
        type: "success",
        message:
          formMode === "create"
            ? "Product created successfully."
            : "Product updated successfully.",
      })
      await refreshInventory()
    } catch (submitError) {
      setNotice({
        type: "error",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Unable to save product.",
      })
    } finally {
      setSubmittingForm(false)
    }
  }

  const handleDelete = async (product: InventoryProduct) => {
    const confirmed = window.confirm(
      `Delete ${product.name}? This action cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setNotice(null)

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to delete product.",
        )
      }

      if (detailsProductId === product.id) {
        setDetailsProductId(null)
      }

      setNotice({
        type: "success",
        message: `${product.name} was deleted.`,
      })
      await refreshInventory()
    } catch (deleteError) {
      setNotice({
        type: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete product.",
      })
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setNotice(null)

    try {
      const response = await fetch(
        `/api/products/export${productsUrl.replace("/api/products", "")}`,
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to export products.",
        )
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = "inventory-products.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

      setNotice({
        type: "success",
        message: "Inventory export is ready.",
      })
    } catch (exportError) {
      setNotice({
        type: "error",
        message:
          exportError instanceof Error
            ? exportError.message
            : "Unable to export products.",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleImportSelected = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    setImporting(true)
    setNotice(null)

    try {
      const content = await file.text()
      const format = file.name.toLowerCase().endsWith(".json") ? "json" : "csv"

      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ format, content }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to import products.",
        )
      }

      const importedSummary =
        payload &&
        typeof payload.created === "number" &&
        typeof payload.updated === "number"
          ? `Import complete: ${payload.created} created, ${payload.updated} updated.`
          : "Import complete."

      setNotice({
        type: "success",
        message: importedSummary,
      })
      await refreshInventory()
    } catch (importError) {
      setNotice({
        type: "error",
        message:
          importError instanceof Error
            ? importError.message
            : "Unable to import products.",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleAdjustmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittingAdjustment(true)
    setNotice(null)

    try {
      const response = await fetch("/api/stock-movements", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productId: adjustmentValues.productId,
          quantity: Number(adjustmentValues.quantity),
          type: adjustmentValues.type,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to adjust stock.",
        )
      }

      setAdjustmentOpen(false)
      setAdjustmentValues(emptyStockAdjustment())
      setNotice({
        type: "success",
        message: "Stock adjusted successfully.",
      })
      await refreshInventory()
    } catch (adjustmentError) {
      setNotice({
        type: "error",
        message:
          adjustmentError instanceof Error
            ? adjustmentError.message
            : "Unable to adjust stock.",
      })
    } finally {
      setSubmittingAdjustment(false)
    }
  }

  return (
    <div className="space-y-6">
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,.json"
        className="hidden"
        onChange={handleImportSelected}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Monitor stock levels, manage products, and track catalog updates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border bg-background p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => importInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
              )}
              Import
            </Button>
            <div className="mx-1 h-4 w-[1px] bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={handleExport}
              disabled={exporting || isLoading}
            >
              {exporting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-3.5 w-3.5" />
              )}
              Export
            </Button>
          </div>
          <Button size="sm" onClick={beginCreate} className="h-10 shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {notice ? (
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-500/5 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-500/5 dark:text-red-400"
          }`}
        >
          <div className={`h-2 w-2 rounded-full animate-pulse ${notice.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
          {notice.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Products",
            value: isLoading ? "-" : String(products?.length ?? 0),
            description: "Catalog size",
            icon: Box,
            color: "blue",
          },
          {
            label: "Units On Hand",
            value: isLoading ? "-" : totalUnits.toLocaleString(),
            description: "Current stock level",
            icon: Package,
            color: "emerald",
          },
          {
            label: "Low Stock Items",
            value: isLoading ? "-" : String(lowStockCount),
            description: "Needs attention",
            icon: ArrowUpDown,
            color: "amber",
          },
          {
            label: "Critical Alert",
            value: isLoading ? "-" : String(criticalCount),
            description: "Out of stock risk",
            icon: AlertTriangle,
            color: "red",
          },
        ].map((metric) => (
          <Card key={metric.label} className="overflow-hidden border-none shadow-md">
            <CardContent className="p-0">
              <div className="flex items-center p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold tracking-tight">{metric.value}</h3>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      {metric.description}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm
                    ${
                      metric.color === "blue"
                        ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20"
                        : metric.color === "emerald"
                          ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20"
                          : metric.color === "amber"
                            ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20"
                            : "bg-red-500/10 text-red-600 dark:bg-red-500/20"
                    }
                  `}
                >
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
              <div
                className={`h-1 w-full 
                  ${
                    metric.color === "blue"
                      ? "bg-blue-500/20"
                      : metric.color === "emerald"
                        ? "bg-emerald-500/20"
                        : metric.color === "amber"
                          ? "bg-amber-500/20"
                          : "bg-red-500/20"
                  }
                `}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Product Catalog</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading products..."
                  : `Showing ${products?.length ?? 0} items across all warehouses`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search SKU or name..."
                  className="h-10 w-full min-w-[240px] pl-10 text-sm shadow-sm transition-all focus-visible:ring-1 sm:w-64"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-10 w-[140px] text-sm shadow-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger className="h-10 w-[140px] text-sm shadow-sm">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.name}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 w-[130px] text-sm shadow-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                { (searchQuery || categoryFilter !== "all" || statusFilter !== "all" || warehouseFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSearchQuery("")
                      setCategoryFilter("all")
                      setStatusFilter("all")
                      setWarehouseFilter("all")
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error.message || "Failed to load products."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead className="hidden md:table-cell">SKU</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead className="hidden xl:table-cell">Warehouse</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Limit</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-inner transition-transform group-hover:scale-105">
                          <span className="text-sm font-bold">{product.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold tracking-tight text-foreground">{product.name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="md:hidden font-mono">{product.sku}</span>
                            <span className="md:hidden opacity-30">•</span>
                            <span>{product.category}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="font-normal text-muted-foreground border-muted-foreground/20">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {product.warehouse}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center font-bold ${product.stock <= product.minStock ? "text-red-600" : "text-foreground"}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight
                        ${
                          product.status === "in-stock"
                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : product.status === "low-stock"
                              ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                              : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                        }
                      `}>
                        <div className={`mr-1.5 h-1.5 w-1.5 rounded-full
                          ${
                            product.status === "in-stock"
                              ? "bg-emerald-500"
                              : product.status === "low-stock"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }
                        `} />
                        {statusConfig[product.status].label}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right text-xs text-muted-foreground font-mono">
                      {product.minStock} / {product.maxStock}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setDetailsProductId(product.id)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => beginEdit(product)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => beginAdjustment(product)} className="cursor-pointer">
                            <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                            Adjust Stock
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {products?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Package className="h-8 w-8 opacity-20" />
                        <p>No products found matching your filters.</p>
                        <Button variant="link" onClick={() => {
                          setSearchQuery("")
                          setCategoryFilter("all")
                          setStatusFilter("all")
                          setWarehouseFilter("all")
                        }}>Clear all filters</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setEditingProductId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {formMode === "create" ? "Add New Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {formMode === "create"
                ? "Configure your product catalog by adding a new item with pricing and stock details."
                : "Update product specifications, pricing, and inventory thresholds."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6 pt-4" onSubmit={handleProductSubmit}>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="product-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name</Label>
                <Input
                  id="product-name"
                  name="name"
                  value={formValues.name}
                  onChange={handleFormValueChange}
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  className="h-11 shadow-sm focus-visible:ring-1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-sku" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SKU / Item Code</Label>
                  <Input
                    id="product-sku"
                    name="sku"
                    value={formValues.sku}
                    onChange={handleFormValueChange}
                    placeholder="WCH-2024-PRO"
                    className="h-11 font-mono uppercase shadow-sm focus-visible:ring-1"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <Input
                    id="product-category"
                    name="category"
                    list={categoryListId}
                    value={formValues.category}
                    onChange={handleFormValueChange}
                    placeholder="Electronics"
                    className="h-11 shadow-sm focus-visible:ring-1"
                    required
                  />
                  <datalist id={categoryListId}>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-warehouse" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Warehouse Location</Label>
                  <Input
                    id="product-warehouse"
                    name="warehouse"
                    list={warehouseListId}
                    value={formValues.warehouse}
                    onChange={handleFormValueChange}
                    placeholder="Main Facility"
                    className="h-11 shadow-sm focus-visible:ring-1"
                    required
                  />
                  <datalist id={warehouseListId}>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.name} />
                    ))}
                  </datalist>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Price (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="product-price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formValues.price}
                      onChange={handleFormValueChange}
                      placeholder="0.00"
                      className="h-11 pl-7 shadow-sm focus-visible:ring-1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-4 border border-muted/50">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inventory Thresholds</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="product-stock" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Stock</Label>
                    <Input
                      id="product-stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={formValues.stock}
                      onChange={handleFormValueChange}
                      className="h-9 shadow-sm focus-visible:ring-1 bg-background"
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="product-minStock" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Min Threshold</Label>
                    <Input
                      id="product-minStock"
                      name="minStock"
                      type="number"
                      min="0"
                      step="1"
                      value={formValues.minStock}
                      onChange={handleFormValueChange}
                      className="h-9 shadow-sm focus-visible:ring-1 bg-background"
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="product-maxStock" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Max Capacity</Label>
                    <Input
                      id="product-maxStock"
                      name="maxStock"
                      type="number"
                      min="0"
                      step="1"
                      value={formValues.maxStock}
                      onChange={handleFormValueChange}
                      className="h-9 shadow-sm focus-visible:ring-1 bg-background"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product-description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description / Notes</Label>
                <Textarea
                  id="product-description"
                  name="description"
                  value={formValues.description}
                  onChange={handleFormValueChange}
                  placeholder="Provide additional details about this item..."
                  className="min-h-[100px] resize-none shadow-sm focus-visible:ring-1"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormOpen(false)}
                className="h-11"
              >
                Discard Changes
              </Button>
              <Button type="submit" disabled={submittingForm} className="h-11 px-8 shadow-md">
                {submittingForm ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {formMode === "create" ? "Create Item" : "Update Catalog"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsProductId} onOpenChange={(open) => !open && setDetailsProductId(null)}>
        <DialogContent className="sm:max-w-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Product Intelligence</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Deep dive into stock levels, historical movements, and catalog data.
            </DialogDescription>
          </DialogHeader>

          {loadingSelectedProduct ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-sm text-muted-foreground font-medium animate-pulse">Retrieving product data...</p>
            </div>
          ) : selectedProductError ? (
            <div className="rounded-2xl border border-red-200 bg-red-500/5 px-6 py-8 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-red-700">Failed to load product details</p>
              <p className="text-xs text-red-600/70 mt-1">{selectedProductError.message || "An unexpected error occurred."}</p>
            </div>
          ) : selectedProduct ? (
            <div className="space-y-6 pt-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-muted/30 p-5 border border-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg text-primary-foreground">
                    <span className="text-2xl font-black">{selectedProduct.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{selectedProduct.name}</h2>
                    <code className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      {selectedProduct.sku}
                    </code>
                  </div>
                </div>
                <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider
                  ${
                    selectedProduct.status === "in-stock"
                      ? "bg-emerald-500 text-white"
                      : selectedProduct.status === "low-stock"
                        ? "bg-amber-500 text-white"
                        : "bg-red-500 text-white"
                  }
                `}>
                  {statusConfig[selectedProduct.status].label}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group rounded-2xl border bg-background p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Categorization</p>
                  <p className="mt-2 text-lg font-bold">{selectedProduct.category}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Primary classification</p>
                </div>
                <div className="group rounded-2xl border bg-background p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Storage Facility</p>
                  <p className="mt-2 text-lg font-bold">{selectedProduct.warehouse}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {selectedProduct.warehouseLocation || "Section not assigned"}
                  </p>
                </div>
                <div className="group rounded-2xl border bg-background p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Market Pricing</p>
                  <p className="mt-2 text-2xl font-black text-primary">
                    {formatCurrency(selectedProduct.price)}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Unit cost basis</p>
                </div>
                <div className="group rounded-2xl border bg-background p-4 transition-all hover:border-primary/20 hover:shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Balance</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl font-black">{selectedProduct.stock}</p>
                    <span className="text-xs font-medium text-muted-foreground">UNITS</span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Thresholds: <span className="font-mono">{selectedProduct.minStock}</span> to <span className="font-mono">{selectedProduct.maxStock}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Product Description</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedProduct.description || "Detailed intelligence description not available for this item."}
                </p>
              </div>

              <div className="rounded-2xl border bg-background overflow-hidden">
                <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock Activity Log</p>
                    <p className="text-[10px] text-muted-foreground/60">Historical audit trail</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] border-muted-foreground/20">
                    {selectedProduct.movementCount} TOTAL
                  </Badge>
                </div>
                <div className="max-h-[240px] overflow-auto divide-y">
                  {selectedProduct.recentMovements?.length ? (
                    selectedProduct.recentMovements.map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center
                            ${movement.quantity > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}
                          `}>
                            {movement.quantity > 0 ? <Plus className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4 rotate-180" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{movement.type}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDate(movement.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-mono text-xs font-black ${
                              movement.quantity > 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {movement.quantity > 0 ? "+" : ""}
                            {movement.quantity}
                          </p>
                          <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">
                            {movement.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
                        <Loader2 className="h-6 w-6 text-muted-foreground/20" />
                      </div>
                      <p className="text-xs text-muted-foreground">No recent stock movements recorded.</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shadow-sm"
                  onClick={() => {
                    setDetailsProductId(null)
                    beginAdjustment(selectedProduct)
                  }}
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Adjust Stock
                </Button>
                <Button
                  type="button"
                  className="h-11 shadow-md"
                  onClick={() => {
                    setDetailsProductId(null)
                    beginEdit(selectedProduct)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Catalog
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={adjustmentOpen}
        onOpenChange={(open) => {
          setAdjustmentOpen(open)
          if (!open) {
            setAdjustmentValues(emptyStockAdjustment())
          }
        }}
      >
        <DialogContent className="sm:max-w-md border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Stock Adjustment</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Modify inventory levels manually. Use positive for additions, negative for reductions.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5 pt-2" onSubmit={handleAdjustmentSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-product" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected Item</Label>
              <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 border border-muted/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{adjustmentValues.productName}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Current Reference Item</p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustment-type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason for Adjustment</Label>
              <Select
                value={adjustmentValues.type}
                onValueChange={(value) =>
                  setAdjustmentValues((current) => ({
                    ...current,
                    type: value,
                  }))
                }
              >
                <SelectTrigger id="adjustment-type" className="h-11 shadow-sm focus:ring-1">
                  <SelectValue placeholder="Select movement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual Adjustment">Manual Adjustment</SelectItem>
                  <SelectItem value="Restock">Restock / Procurement</SelectItem>
                  <SelectItem value="Sale">Direct Sale / Order</SelectItem>
                  <SelectItem value="Transfer">Warehouse Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustment-quantity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity Variation</Label>
              <Input
                id="adjustment-quantity"
                name="quantity"
                type="number"
                step="1"
                value={adjustmentValues.quantity}
                onChange={handleAdjustmentChange}
                placeholder="e.g. 25 or -4"
                className="h-11 text-lg font-bold shadow-sm focus:ring-1"
                required
              />
              <p className="text-[10px] text-muted-foreground">The final stock will be recalculated immediately after application.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAdjustmentOpen(false)}
                className="h-11"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingAdjustment} className="h-11 px-8 shadow-md">
                {submittingAdjustment ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                )}
                Commit Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
