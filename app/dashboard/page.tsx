"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Box,
  DollarSign,
  FileText,
  Layers,
  Loader2,
  Package,
  Plus,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const revenueChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
}

const categoryChartConfig: ChartConfig = {
  items: { label: "Items", color: "var(--chart-1)" },
  value: { label: "Value ($)", color: "var(--chart-3)" },
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: stats, isLoading: statsLoading } = useSWR(
    "/api/dashboard/stats",
    fetcher
  )
  const { data: revenueData, isLoading: revLoading } = useSWR(
    "/api/dashboard/revenue",
    fetcher
  )
  const { data: categoryData, isLoading: catLoading } = useSWR(
    "/api/dashboard/categories",
    fetcher
  )
  const { data: activityData, isLoading: actLoading } = useSWR(
    "/api/stock-movements",
    fetcher
  )
  const { data: lowStockData, isLoading: lowLoading } = useSWR(
    "/api/products?status=low-stock",
    fetcher
  )

  const lowStockItems = Array.isArray(lowStockData) ? lowStockData : []
  const recentActivity = Array.isArray(activityData) ? activityData : []
  const categories = Array.isArray(categoryData) ? categoryData : []
  const revenue = Array.isArray(revenueData) ? revenueData : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {session?.user?.name?.split(" ")[0] || "User"}.
          Here&apos;s your inventory overview.
        </p>
      </div>

      {/* KPI Cards */}
        {[
          {
            title: "Total Products",
            value: statsLoading ? "-" : stats?.totalProducts,
            icon: Layers,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            title: "Low Stock Alerts",
            value: statsLoading ? "-" : stats?.lowStock,
            icon: AlertCircle,
            color: "text-orange-600 dark:text-orange-400",
          },
          {
            title: "Monthly Revenue",
            value: statsLoading
              ? "-"
              : `$${stats?.totalRevenue.toLocaleString()}`,
            icon: BarChart3,
            color: "text-emerald-600 dark:text-emerald-400",
          },
          {
            title: "Pending Orders",
            value: statsLoading ? "-" : stats?.pendingOrders,
            icon: ShoppingCart,
            color: "text-indigo-600 dark:text-indigo-400",
          },
        ].map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">{kpi.title}</p>
                  <h3 className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</h3>
                </div>
                <kpi.icon className={`h-4 w-4 ${kpi.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue and order trends
                </CardDescription>
              </div>
              <Tabs defaultValue="revenue" className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="revenue" className="text-xs">
                    Revenue
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="text-xs">
                    Orders
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {revLoading ? (
              <div className="flex h-[252px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartContainer
                config={revenueChartConfig}
                className="aspect-auto h-[252px] w-full"
              >
                <AreaChart
                  data={revenue}
                  margin={{ top: 12, left: 6, right: 14, bottom: 20 }}
                >
                  <defs>
                    <linearGradient
                      id="fillRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 13 }}
                    tickMargin={10}
                    padding={{ left: 12, right: 12 }}
                    label={{
                      value: "Month",
                      position: "bottom",
                      offset: 8,
                      fill: "var(--muted-foreground)",
                      style: { fontSize: 13, fontWeight: 500 },
                    }}
                  />
                  <YAxis
                    width={56}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 13 }}
                    tickMargin={10}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    label={{
                      value: "Revenue",
                      angle: -90,
                      position: "insideLeft",
                      offset: -2,
                      fill: "var(--muted-foreground)",
                      style: { fontSize: 13, fontWeight: 500 },
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => value}
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-muted-foreground">
                              {name === "revenue" ? "Revenue" : "Orders"}
                            </span>
                            <span className="font-mono font-medium">
                              {name === "revenue"
                                ? `$${Number(value).toLocaleString()}`
                                : value}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={1.75}
                    fill="url(#fillRevenue)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>
              Items distribution across categories
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {catLoading ? (
              <div className="flex h-[248px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartContainer
                config={categoryChartConfig}
                className="aspect-auto h-[248px] w-full"
              >
                <BarChart
                  data={categories}
                  margin={{ top: 12, left: 10, right: 14, bottom: 20 }}
                  layout="vertical"
                  barCategoryGap="30%"
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 13 }}
                    tickMargin={10}
                    label={{
                      value: "Total items",
                      position: "bottom",
                      offset: 8,
                      fill: "var(--muted-foreground)",
                      style: { fontSize: 13, fontWeight: 500 },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                    width={34}
                    label={{
                      value: "Categories",
                      angle: -90,
                      position: "insideLeft",
                      offset: -2,
                      fill: "var(--muted-foreground)",
                      style: { fontSize: 13, fontWeight: 500 },
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-muted-foreground">
                              {name === "items" ? "Items" : "Value"}
                            </span>
                            <span className="font-mono font-medium">
                              {name === "items"
                                ? value
                                : `$${Number(value).toLocaleString()}`}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="items"
                    fill="var(--color-items)"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  >
                    <LabelList
                      dataKey="category"
                      position="insideLeft"
                      offset={12}
                      fill="rgba(28, 18, 36, 0.92)"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest inventory movements</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {actLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {item.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.product}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-sm font-medium ${item.qty.startsWith("+") ? "text-emerald-500" : item.qty.startsWith("-") ? "text-red-500" : "text-muted-foreground"}`}
                    >
                      {item.qty}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "secondary"
                            : item.status === "pending"
                              ? "outline"
                              : "secondary"
                        }
                        className={`text-xs ${item.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : item.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {item.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>
                  Items requiring immediate restock
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-xs">
                {lowStockItems.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No low stock items.
              </div>
            ) : (
              lowStockItems.slice(0, 5).map((item: any) => {
                const percentage = Math.round(
                  (item.stock / (item.maxStock || 100)) * 100
                )
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.stock}/{item.maxStock || 100}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Create restock order
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Plus,
                  label: "Add Product",
                  desc: "Create new inventory item",
                },
                {
                  icon: Upload,
                  label: "Bulk Import",
                  desc: "Upload CSV or Excel",
                },
                {
                  icon: FileText,
                  label: "Generate Report",
                  desc: "Export analytics data",
                },
                {
                  icon: Users,
                  label: "Manage Team",
                  desc: "Roles & permissions",
                },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="flex h-auto flex-col items-center gap-2 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{action.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {action.desc}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
