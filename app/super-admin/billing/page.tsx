"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  Shield,
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatKES } from "@/lib/plans"

interface BillingWorkspace {
  id: string
  name: string
  slug: string
  planName: string | null
  subscriptionStatus: string | null
  paymentStatus: string | null
  monthlyPrice: number | null
  nextBillingDate: string | null
  createdAt: string
}

interface BillingSummary {
  totalWorkspaces: number
  activeSubscriptions: number
  pendingPayments: number
  totalMonthlyRevenue: number
  paidThisMonth: number
}

export default function SuperAdminBillingPage() {
  const { data: session } = useSession()
  const [workspaces, setWorkspaces] = useState<BillingWorkspace[]>([])
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const response = await fetch("/api/super-admin/billing")
        const data = await response.json()

        if (response.ok) {
          setWorkspaces(data.workspaces || [])
          setSummary(data.summary || null)
        }
      } catch (error) {
        console.error("Failed to load super admin billing data", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      loadBilling()
    }
  }, [session?.user])

  const getBadgeClass = (status: string | null) => {
    switch (status) {
      case "active":
      case "paid":
        return "bg-green-500/10 text-green-600"
      case "pending":
        return "bg-yellow-500/10 text-yellow-600"
      case "cancelled":
      case "failed":
        return "bg-red-500/10 text-red-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing Overview</h1>
          <p className="text-sm text-muted-foreground">Track revenue and subscriptions across workspaces</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing Overview</h1>
          <p className="text-sm text-muted-foreground">Track revenue and subscriptions across workspaces</p>
        </div>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workspaces</p>
                  <p className="text-2xl font-bold">{summary.totalWorkspaces}</p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subs</p>
                  <p className="text-2xl font-bold">{summary.activeSubscriptions}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{summary.pendingPayments}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatKES(summary.totalMonthlyRevenue)}</p>
                </div>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid This Month</p>
                  <p className="text-2xl font-bold">{formatKES(summary.paidThisMonth)}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Workspace Billing Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{workspace.name}</p>
                        <p className="text-xs text-muted-foreground">{workspace.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeClass(workspace.planName)}>
                        {workspace.planName || "No Plan"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeClass(workspace.subscriptionStatus)}>
                        {workspace.subscriptionStatus || "No Subscription"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeClass(workspace.paymentStatus)}>
                        {workspace.paymentStatus || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {workspace.monthlyPrice ? formatKES(workspace.monthlyPrice) : "—"}
                    </TableCell>
                    <TableCell>
                      {workspace.nextBillingDate ? new Date(workspace.nextBillingDate).toLocaleDateString("en-KE") : "—"}
                    </TableCell>
                    <TableCell>
                      {new Date(workspace.createdAt).toLocaleDateString("en-KE")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
