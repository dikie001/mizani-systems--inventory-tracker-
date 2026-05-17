"use client"

import { ChangeEvent, FormEvent, useId, useRef, useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Box,
  Download,
  Edit,
  Eye,
  Filter,
  Flame,
  Layers,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShoppingCart,
  ShieldAlert,
  Trash2,
  TrendingDown,
  Upload,
  Check,
  ChevronsUpDown,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type InventoryProduct = {
  id: string
  name: string
  sku: string
  description: string | null
  category: string
  categoryId: string

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

}

type NoticeState = {
  type: "success" | "error"
  message: string
} | null

type ProductFormValues = {
  name: string
  sku: string
  category: string

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

const emptyProductForm = (): ProductFormValues => ({
  name: "",
  sku: "",
  category: "",
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



  const query = params.toString()
  return query ? `/api/products?${query}` : "/api/products"
}

function productToFormValues(product: InventoryProduct): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,

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

function formatCumulativePrice(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`
  }
  if (value >= 100000) {
    return `$${Math.round(value / 1000)}k`
  }
  return formatCurrency(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
        </div>
      }
    >
      <InventoryPageContent />
    </Suspense>
  )
}

function InventoryPageContent() {
  const categoryListId = useId()



  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [notice, setNotice] = useState<NoticeState>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [formOpen, setFormOpen] = useState(false)
  const [formValues, setFormValues] = useState<ProductFormValues>(
    emptyProductForm(),
  )
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [submittingForm, setSubmittingForm] = useState(false)
  const [detailsProductId, setDetailsProductId] = useState<string | null>(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [categoryAdding, setCategoryAdding] = useState(false)
  const [adjustmentOpen, setAdjustmentOpen] = useState(false)
  const [adjustmentValues, setAdjustmentValues] = useState<StockAdjustmentValues>(
    emptyStockAdjustment(),
  )
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const searchParams = useSearchParams()
  const action = searchParams.get("action")

  useEffect(() => {
    const search = searchParams.get("search")
    if (search) {
      setSearchQuery(search)
    }
    if (action === "add") {
      beginCreate()
    } else if (action === "import") {
      setImportOpen(true)
    }
  }, [action, searchParams])


  const productsUrl = buildProductsUrl({
    searchQuery,
    categoryFilter,
    statusFilter,

  })

  const { data: products, error, isLoading, mutate: mutateProducts } = useSWR<InventoryProduct[]>(productsUrl, fetcher)
  const { data: meta, mutate: mutateMeta } = useSWR<InventoryMeta>("/api/inventory/meta", fetcher)
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
    setFormValues(emptyProductForm())
    setCategorySearch("")
    setFormOpen(true)
  }

  const beginEdit = (product: InventoryProduct) => {
    setNotice(null)
    setFormMode("edit")
    setEditingProductId(product.id)
    setFormValues(productToFormValues(product))
    setCategorySearch("")
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

  const handleCreateCategory = async () => {
    if (!categorySearch.trim() || categoryAdding) return
    const name = categorySearch.trim()
    setCategoryAdding(true)
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) {
        throw new Error("Failed to create category")
      }
      const newCat = await response.json()
      setFormValues((current) => ({ ...current, category: newCat.name }))
      await mutateMeta()
      setCategorySearch("")
      setCategoryOpen(false)
    } catch (err) {
      console.error(err)
      setNotice({
        type: "error",
        message: "Failed to save category to database.",
      })
    } finally {
      setCategoryAdding(false)
    }
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
      setFormValues(emptyProductForm())
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

  const handleImportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!importFile) return

    setImporting(true)
    setNotice(null)

    try {
      const content = await importFile.text()
      const format = importFile.name.endsWith(".json") ? "json" : "csv"

      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, format }),
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Import failed.")

      setImportOpen(false)
      setImportFile(null)
      setNotice({ type: "success", message: payload.message })
      await refreshInventory()
    } catch (err) {
      setNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Import failed.",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">


      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Monitor stock levels, manage products, and track catalog updates
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || isLoading}>
            {exporting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setImportOpen(true)} 
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import
          </Button>
          <Button size="sm" onClick={beginCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
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
            label: "Critical Alerts",
            value: isLoading ? "-" : String(criticalCount),
            icon: Flame,
            color: "text-rose-600 dark:text-rose-400",
          },
          {
            label: "Low Stock Warnings",
            value: isLoading ? "-" : String(lowStockCount),
            icon: AlertCircle,
            color: "text-orange-600 dark:text-orange-400",
          },
          {
            label: "Total Inventory",
            value: isLoading ? "-" : totalUnits.toLocaleString(),
            icon: Box,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Catalog Items",
            value: isLoading ? "-" : String(products?.length ?? 0),
            icon: Package,
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

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading..."
                  : `${products?.length || 0} items`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="h-8 w-48 pl-8 text-sm" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-32 text-sm">
                  <Filter className="mr-1.5 h-3 w-3" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-32 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
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
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell w-[140px]">SKU</TableHead>
                  <TableHead className="hidden lg:table-cell w-[140px]">Category</TableHead>
                  <TableHead className="w-[110px] text-right">Price</TableHead>
                  <TableHead className="w-[140px] text-right">Stock Level</TableHead>
                  <TableHead className="w-[110px] pl-6">Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product, index) => (
                  <TableRow key={product.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground/80 py-2.5">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-inner transition-transform group-hover:scale-105">
                          <span className="text-xs font-bold">{product.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold tracking-tight text-foreground text-sm">{product.name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="md:hidden font-mono">{product.sku}</span>
                            <span className="md:hidden opacity-30">•</span>
                            <span>{product.category}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2.5 w-[140px]">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-2.5 w-[140px]">
                      <Badge variant="outline" className="font-normal text-muted-foreground border-muted-foreground/20 text-xs">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium py-2.5 w-[110px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help hover:text-primary transition-colors underline decoration-dotted decoration-muted-foreground/30 underline-offset-4">
                              {formatCumulativePrice(product.price * product.stock)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="font-semibold text-muted-foreground/80">
                                Total: {formatCurrency(product.price * product.stock)}
                              </span>
                              <span className="font-medium text-foreground">
                                {formatCurrency(product.price)} each
                              </span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right py-2.5 w-[140px] font-mono">
                      <span className={`text-sm font-semibold ${product.stock <= product.minStock ? "text-red-500 font-bold" : "text-foreground"}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 w-[110px] pl-6">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border
                        ${
                          product.status === "in-stock"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                            : product.status === "low-stock"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                              : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                        }
                      `}>
                        {statusConfig[product.status].label}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 w-[50px]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Package className="h-8 w-8 opacity-20" />
                        <p>No products found matching your filters.</p>
                        <Button variant="link" onClick={() => {
                          setSearchQuery("")
                          setCategoryFilter("all")
                          setStatusFilter("all")
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {formMode === "create" ? "Add New Product" : "Edit Product"}
            </DialogTitle>
      
          </DialogHeader>

          <form className="space-y-4 pt-2" onSubmit={handleProductSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                name="name"
                value={formValues.name}
                onChange={handleFormValueChange}
                placeholder="e.g. Wireless Noise Cancelling Headphones"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="product-sku">SKU / Item Code *</Label>
                <Input
                  id="product-sku"
                  name="sku"
                  value={formValues.sku}
                  onChange={handleFormValueChange}
                  placeholder="WCH-2024-PRO"
                  className="font-mono uppercase"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-category">Category *</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="justify-between h-9 font-normal w-full"
                    >
                      {formValues.category || "Select category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {categories.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No categories yet.
                        </div>
                      ) : (
                        categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              setFormValues(current => ({ ...current, category: category.name }))
                              setCategoryOpen(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formValues.category.toLowerCase() === category.name.toLowerCase() ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {category.name}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="border-t p-2 bg-muted/20 flex flex-col gap-2">
                      <Input
                        placeholder="New category name..."
                        className="h-8 text-xs bg-background w-full"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            await handleCreateCategory()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 text-xs font-semibold w-full"
                        disabled={!categorySearch.trim() || categoryAdding}
                        onClick={handleCreateCategory}
                      >
                        {categoryAdding ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="mr-1 h-3.5 w-3.5" />
                        )}
                        Create Category
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="product-price">Unit Price (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id="product-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValues.price}
                    onChange={handleFormValueChange}
                    placeholder="0.00"
                    className="pl-6"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-stock">Current Stock *</Label>
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
              <div className="space-y-1.5">
                <Label htmlFor="product-minStock">Min Threshold *</Label>
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
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-description">Description / Notes</Label>
              <Textarea
                id="product-description"
                name="description"
                value={formValues.description}
                onChange={handleFormValueChange}
                placeholder="Provide additional details about this item..."
                className="min-h-[60px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={submittingForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingForm}>
                {submittingForm ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {formMode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  formMode === "create" ? "Create Product" : "Update Product"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailsProductId} onOpenChange={(open) => !open && setDetailsProductId(null)}>
        <DialogContent className="sm:max-w-[600px]">
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
        <DialogContent className="sm:max-w-md">
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

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Bulk Import Products</DialogTitle>
            <DialogDescription>
              Upload a CSV or JSON file to bulk create or update your inventory catalog.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportSubmit} className="space-y-6 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="import-file" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Inventory File (CSV or JSON)
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="h-12 pt-2.5 bg-muted/20 border-dashed border-2 hover:bg-muted/30 transition-all cursor-pointer"
                required
              />
              <p className="text-[10px] text-muted-foreground italic">
                Tip: SKUs are used to match existing products for updates.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setImportOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={importing || !importFile}>
                {importing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Start Import
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
