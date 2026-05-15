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
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage products, stock levels, imports, exports, and catalog updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
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
          <Button
            variant="outline"
            size="sm"
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
          <Button size="sm" onClick={beginCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Product
          </Button>
        </div>
      </div>

      {notice ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300"
              : "border-red-200 bg-red-500/10 text-red-700 dark:border-red-900 dark:text-red-300"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          {
            label: "Products",
            value: isLoading ? "-" : String(products?.length ?? 0),
            icon: Box,
            iconClass: "text-primary",
            backgroundClass: "bg-primary/10",
          },
          {
            label: "Units On Hand",
            value: isLoading ? "-" : totalUnits.toLocaleString(),
            icon: Package,
            iconClass: "text-blue-500",
            backgroundClass: "bg-blue-500/10",
          },
          {
            label: "Low Stock",
            value: isLoading ? "-" : String(lowStockCount),
            icon: ArrowUpDown,
            iconClass: "text-amber-500",
            backgroundClass: "bg-amber-500/10",
          },
          {
            label: "Critical",
            value: isLoading ? "-" : String(criticalCount),
            icon: AlertTriangle,
            iconClass: "text-red-500",
            backgroundClass: "bg-red-500/10",
          },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.backgroundClass}`}
                >
                  <metric.icon className={`h-5 w-5 ${metric.iconClass}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Product List</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading products..."
                  : `${products?.length ?? 0} products shown. Import expects CSV or JSON with name, sku, category, warehouse, price, stock, minStock, maxStock, and description columns.`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="h-8 w-56 pl-8 text-sm"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-40 text-sm">
                  <Filter className="mr-1.5 h-3 w-3" />
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
                <SelectTrigger className="h-8 w-40 text-sm">
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
                <SelectTrigger className="h-8 w-36 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                  setStatusFilter("all")
                  setWarehouseFilter("all")
                }}
              >
                Reset
              </Button>
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
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Min / Max</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium">{product.name}</div>
                          <div className="max-w-60 truncate text-xs text-muted-foreground">
                            {product.description || product.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.warehouse}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${statusConfig[product.status].className}`}
                      >
                        {statusConfig[product.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {product.minStock} / {product.maxStock}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-xs">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailsProductId(product.id)}>
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => beginEdit(product)}>
                            <Edit className="mr-2 h-3.5 w-3.5" />
                            Edit product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => beginAdjustment(product)}>
                            <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                            Adjust stock
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {products?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No products found.
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add New Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Create a new inventory item with pricing, stock, and warehouse information."
                : "Update product details, thresholds, and stock values."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleProductSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                name="name"
                value={formValues.name}
                onChange={handleFormValueChange}
                placeholder="Wireless Earbuds Pro"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  name="sku"
                  value={formValues.sku}
                  onChange={handleFormValueChange}
                  placeholder="WEP-2024-BK"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-category">Category</Label>
                <Input
                  id="product-category"
                  name="category"
                  list={categoryListId}
                  value={formValues.category}
                  onChange={handleFormValueChange}
                  placeholder="Electronics"
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
                <Label htmlFor="product-warehouse">Warehouse</Label>
                <Input
                  id="product-warehouse"
                  name="warehouse"
                  list={warehouseListId}
                  value={formValues.warehouse}
                  onChange={handleFormValueChange}
                  placeholder="Main"
                  required
                />
                <datalist id={warehouseListId}>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.name} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-price">Price</Label>
                <Input
                  id="product-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formValues.price}
                  onChange={handleFormValueChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formValues.stock}
                  onChange={handleFormValueChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-minStock">Min Stock</Label>
                <Input
                  id="product-minStock"
                  name="minStock"
                  type="number"
                  min="0"
                  step="1"
                  value={formValues.minStock}
                  onChange={handleFormValueChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-maxStock">Max Stock</Label>
                <Input
                  id="product-maxStock"
                  name="maxStock"
                  type="number"
                  min="0"
                  step="1"
                  value={formValues.maxStock}
                  onChange={handleFormValueChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                name="description"
                value={formValues.description}
                onChange={handleFormValueChange}
                placeholder="Brief description, bundle details, or notes..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingForm}>
                {submittingForm ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : null}
                {formMode === "create" ? "Create Product" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsProductId} onOpenChange={(open) => !open && setDetailsProductId(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Review pricing, thresholds, stock, and recent stock movements.
            </DialogDescription>
          </DialogHeader>

          {loadingSelectedProduct ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : selectedProductError ? (
            <div className="rounded-lg border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:text-red-300">
              {selectedProductError.message || "Failed to load product details."}
            </div>
          ) : selectedProduct ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedProduct.name}</h2>
                  <p className="font-mono text-xs text-muted-foreground">
                    {selectedProduct.sku}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={statusConfig[selectedProduct.status].className}
                >
                  {statusConfig[selectedProduct.status].label}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Category</p>
                  <p className="mt-1 font-medium">{selectedProduct.category}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Warehouse</p>
                  <p className="mt-1 font-medium">{selectedProduct.warehouse}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProduct.warehouseLocation || "No location set"}
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Price</p>
                  <p className="mt-1 font-medium">
                    {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Stock</p>
                  <p className="mt-1 font-medium">{selectedProduct.stock} units</p>
                  <p className="text-xs text-muted-foreground">
                    Thresholds: {selectedProduct.minStock} min / {selectedProduct.maxStock} max
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs uppercase text-muted-foreground">Description</p>
                <p className="mt-1 text-sm text-foreground">
                  {selectedProduct.description || "No description provided."}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Recent Stock Movements</p>
                    <p className="text-xs text-muted-foreground">
                      Last updated {formatDate(selectedProduct.updatedAt)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedProduct.movementCount} total movements
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedProduct.recentMovements?.length ? (
                    selectedProduct.recentMovements.map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{movement.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(movement.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-mono ${
                              movement.quantity > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {movement.quantity > 0 ? "+" : ""}
                            {movement.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {movement.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                      No stock movements recorded yet.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDetailsProductId(null)
                    beginAdjustment(selectedProduct)
                  }}
                >
                  <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                  Adjust Stock
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setDetailsProductId(null)
                    beginEdit(selectedProduct)
                  }}
                >
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  Edit Product
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Use a positive number to add stock or a negative number to reduce it.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleAdjustmentSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-product">Product</Label>
              <Input
                id="adjustment-product"
                value={adjustmentValues.productName}
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustment-type">Movement Type</Label>
              <Select
                value={adjustmentValues.type}
                onValueChange={(value) =>
                  setAdjustmentValues((current) => ({
                    ...current,
                    type: value,
                  }))
                }
              >
                <SelectTrigger id="adjustment-type">
                  <SelectValue placeholder="Select movement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual Adjustment">Manual Adjustment</SelectItem>
                  <SelectItem value="Restock">Restock</SelectItem>
                  <SelectItem value="Sale">Sale</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustment-quantity">Quantity Change</Label>
              <Input
                id="adjustment-quantity"
                name="quantity"
                type="number"
                step="1"
                value={adjustmentValues.quantity}
                onChange={handleAdjustmentChange}
                placeholder="e.g. 25 or -4"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustmentOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingAdjustment}>
                {submittingAdjustment ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : null}
                Apply Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
