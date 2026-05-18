"use client"

import useSWR from "swr"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Loader2, Shield } from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function getLastNDays(n: number) {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }
  return days
}

function formatLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export default function SuperAdminRegistrationsPage() {
  const { data, error, isLoading, mutate } = useSWR<{ users?: any[] }>(
    "/api/super-admin/data",
    fetcher,
    { refreshInterval: 10000 }
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-lg shadow-destructive/5">
          <Shield className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Failed to Load Registration Stats
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            There was an error communicating with the database or server.
          </p>
        </div>
        <button
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold"
          onClick={() => mutate()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Loading Registration Metrics...
        </p>
      </div>
    )
  }

  const users = data?.users || []
  const days = getLastNDays(30)
  const counts: Record<string, number> = {}
  users.forEach((u) => {
    const created = u.createdAt ? u.createdAt.split("T")[0] : u.createdAt
    if (!created) return
    counts[created] = (counts[created] || 0) + 1
  })

  const chartData = days.map((d) => {
    const iso = d.toISOString().split("T")[0]
    return {
      date: iso,
      label: formatLabel(d),
      registrations: counts[iso] || 0,
    }
  })

  const chartConfig = {
    registrations: { label: "Registrations", color: "#7c3aed" },
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 text-left">
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-md">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            User Registrations
          </h3>
          <p className="text-xs text-muted-foreground">
            Registrations over the last 30 days
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations (30 days)</CardTitle>
          <CardDescription>Daily registered accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 12, left: 8, right: 8, bottom: 6 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={8}
                />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <defs>
                  <linearGradient id="fillReg" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-registrations, #7c3aed)"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-registrations, #7c3aed)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="registrations"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
