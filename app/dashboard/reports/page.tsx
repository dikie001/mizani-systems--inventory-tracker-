"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Download,
  TrendingUp,
  Loader2,
  DollarSign,
  Package,
  ShoppingBag,
  Percent,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

import { formatPrice } from "@/lib/utils"

type WorkspaceSummary = {
  currency?: string | null
}

type CategoryDistribution = {
  category: string
  value: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  costs: { label: "Costs", color: "var(--chart-4)" },
}

const productConfig: ChartConfig = {
  units: { label: "Units Sold", color: "var(--chart-2)" },
}

const pieConfig: ChartConfig = {
  value: { label: "Share" },
}

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--color-chart-1)",
]

export default function ReportsPage() {
  const [range, setRange] = useState("12m")

  const { data: stats, isLoading: statsLoading } = useSWR(
    `/api/dashboard/reports/stats?range=${range}`,
    fetcher
  )
  const { data: revenueData, isLoading: revLoading } = useSWR(
    `/api/dashboard/revenue?range=${range}`,
    fetcher
  )
  const { data: categoryData, isLoading: catLoading } = useSWR(
    `/api/dashboard/categories?range=${range}`,
    fetcher
  )
  const { data: topProducts, isLoading: topLoading } = useSWR(
    `/api/dashboard/reports/top-products?range=${range}`,
    fetcher
  )
  const { data: workspace } = useSWR<WorkspaceSummary>(
    "/api/workspaces/current",
    fetcher
  )
  const currency = workspace?.currency || "KES"
  const pieData = (categoryData ?? []) as CategoryDistribution[]

  const handleExport = () => {
    window.print()
  }

  const kpis = [
    {
      label: "Total Revenue",
      value: stats?.revenue.value,
      change: stats?.revenue.change,
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      label: "Total Costs",
      value: stats?.costs.value,
      change: stats?.costs.change,
      icon: ShoppingBag,
      color: "text-red-500",
    },
    {
      label: "Net Profit",
      value: stats?.profit.value,
      change: stats?.profit.change,
      icon: Percent,
      color: "text-blue-500",
    },
    {
      label: "Avg Order Value",
      value: stats?.aov.value,
      change: stats?.aov.change,
      icon: Package,
      color: "text-amber-500",
    },
  ]

  return (
    <div className="space-y-6 print:space-y-4 print:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Analytics, trends, and business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="mb-6 hidden print:block">
        <h1 className="text-3xl font-bold">Inventory System Report</h1>
        <p className="text-muted-foreground">
          Range: {range} | Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="print:shadow-none">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {kpi.label}
                </p>
                <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
              </div>
              {statsLoading ? (
                <Skeleton className="mt-1 h-8 w-24" />
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold">
                    {typeof kpi.value === "number"
                      ? formatPrice(kpi.value, currency)
                      : "0"}
                  </p>
                  <p
                    className={`mt-1 flex items-center gap-1 text-[10px] ${kpi.change?.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}
                  >
                    <TrendingUp className="h-2.5 w-2.5" />
                    {kpi.change} vs last period
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue vs Costs Chart */}
      <Card className="print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Revenue vs Costs</CardTitle>
          <CardDescription>
            Financial performance for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ChartContainer config={revenueConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData || []}
                  margin={{ top: 10, left: 10, right: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                    <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--color-costs)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-costs)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={30}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) =>
                      currency === "USD"
                        ? `$${(v / 1000).toFixed(0)}k`
                        : `${currency} ${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-8">
                            <span className="text-muted-foreground">
                              {name === "revenue"
                                ? "Revenue"
                                : name === "costs"
                                  ? "Costs"
                                  : name}
                            </span>
                            <span className="font-mono font-medium">
                              {formatPrice(Number(value), currency)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    fill="url(#fillRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="costs"
                    stroke="var(--color-costs)"
                    strokeWidth={2}
                    fill="url(#fillCost)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom row: Top Products + Category Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="print:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Selling Products</CardTitle>
            <CardDescription>Units sold in this period</CardDescription>
          </CardHeader>
          <CardContent>
            {topLoading ? (
              <div className="flex h-[240px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartContainer
                config={productConfig}
                className="h-[240px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts || []}
                    layout="vertical"
                    margin={{ top: 0, left: 0, right: 20, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="product"
                      tickLine={false}
                      axisLine={false}
                      width={100}
                      tickMargin={8}
                      className="text-[10px]"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="units"
                      fill="var(--color-units)"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="print:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sales Distribution</CardTitle>
            <CardDescription>Revenue share by category</CardDescription>
          </CardHeader>
          <CardContent>
            {catLoading ? (
              <div className="flex h-[240px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartContainer config={pieConfig} className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="category"
                          hideLabel
                          formatter={(value, name) => (
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-muted-foreground">
                                {name || "Revenue Share"}
                              </span>
                              <span className="font-mono font-medium">
                                {formatPrice(Number(value), currency)}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Pie
                      data={categoryData || []}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="category" />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
