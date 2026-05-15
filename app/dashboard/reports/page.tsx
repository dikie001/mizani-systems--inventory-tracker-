"use client"

import useSWR from "swr"
import { Download, TrendingUp, Loader2 } from "lucide-react"
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, XAxis, YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, type ChartConfig,
} from "@/components/ui/chart"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Keeping Top Products static as we don't have historical order item details seeded
const topProducts = [
  { product: "Earbuds Pro", units: 1842 },
  { product: "Smart Watch", units: 1356 },
  { product: "Headphones", units: 1189 },
  { product: "Coffee Beans", units: 978 },
  { product: "Running Shoes", units: 867 },
]

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  costs: { label: "Costs", color: "var(--chart-4)" },
}

const productConfig: ChartConfig = {
  units: { label: "Units Sold", color: "var(--chart-2)" },
}

const pieConfig: ChartConfig = {
  value: { label: "Share" },
  Electronics: { label: "Electronics", color: "var(--chart-1)" },
  Apparel: { label: "Apparel", color: "var(--chart-2)" },
  "Food & Bev": { label: "Food & Bev", color: "var(--chart-3)" },
  Home: { label: "Home", color: "var(--chart-4)" },
  Sports: { label: "Sports", color: "var(--chart-5)" },
  Beauty: { label: "Beauty", color: "var(--color-chart-1)" },
}

// Map index to colors for dynamic categories
const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--color-chart-1)"]

export default function ReportsPage() {
  const { data: revenueData, isLoading: revLoading } = useSWR<any[]>('/api/dashboard/revenue', fetcher)
  const { data: categoryData, isLoading: catLoading } = useSWR<any[]>('/api/dashboard/categories', fetcher)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Analytics, trends, and business insights</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="12m">
            <SelectTrigger className="h-8 w-36 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Revenue", value: "$374,700", change: "+18.3%" },
          { label: "Total Costs", value: "$218,400", change: "+12.1%" },
          { label: "Net Profit", value: "$156,300", change: "+27.4%" },
          { label: "Avg Order Value", value: "$142.50", change: "+5.8%" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
                <TrendingUp className="h-3 w-3" />{kpi.change} vs last year
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue vs Costs Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Costs</CardTitle>
          <CardDescription>Monthly comparison for the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {revLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <ChartContainer config={revenueConfig} className="aspect-auto h-[320px] w-full">
              <AreaChart data={revenueData || []} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-costs)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--color-costs)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#fillRev)" />
                <Area type="monotone" dataKey="costs" stroke="var(--color-costs)" strokeWidth={2} fill="url(#fillCost)" />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom row: Top Products + Category Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By units sold this year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={productConfig} className="aspect-auto h-[260px] w-full">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="product" tickLine={false} axisLine={false} width={90} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="units" fill="var(--color-units)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Revenue share by category</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {catLoading ? (
               <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <ChartContainer config={pieConfig} className="aspect-square h-[260px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
                  <Pie data={categoryData || []} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={100} strokeWidth={2}>
                    {(categoryData || []).map((entry, index) => (
                      <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="category" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
