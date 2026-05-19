"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  DollarSign,
  History,
  ReceiptText,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
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
import { Skeleton } from "@/components/ui/skeleton"
import { formatKES, PLANS } from "@/lib/plans"

type BillingWorkspace = {
  id: string
  name: string
  slug: string
  planName: string | null
  subscriptionStatus: string | null
  paymentStatus: string | null
  monthlyPrice: number | null
  nextBillingDate: string | null
  lastPaymentStatus: string | null
  createdAt: string
}

type BillingSummary = {
  totalWorkspaces: number
  activeSubscriptions: number
  pendingPayments: number
  totalMonthlyRevenue: number
  paidThisMonth: number
}

type BillingPlan = (typeof PLANS)[number] & {
  activeSubscriptions: number
}

type BillingPayment = {
  id: string
  workspaceName: string
  workspaceSlug: string
  subscriptionStatus: string | null
  planName: string | null
  amount: number
  currency: string
  status: string
  paymentMethod: string | null
  reference: string | null
  paidAt: string | null
  createdAt: string
  invoiceNumber: string | null
  invoiceStatus: string | null
}

type BillingInvoice = {
  id: string
  workspaceName: string
  workspaceSlug: string
  subscriptionStatus: string | null
  planName: string | null
  invoiceNumber: string
  amount: number
  currency: string
  status: string
  dueDate: string
  paidAt: string | null
  billingPeriodStart: string
  billingPeriodEnd: string
  description: string | null
  notes: string | null
  createdAt: string
}

type BillingResponse = {
  workspaces: BillingWorkspace[]
  summary: BillingSummary
  plans: BillingPlan[]
  payments: BillingPayment[]
  invoices: BillingInvoice[]
}

function getBadgeClass(status: string | null) {
  switch (status) {
    case "active":
    case "paid":
    case "success":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    case "pending":
    case "draft":
    case "issued":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    case "cancelled":
    case "failed":
    case "expired":
    case "overdue":
      return "border-destructive/20 bg-destructive/10 text-destructive"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function SuperAdminBillingPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<BillingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [billingView, setBillingView] = useState<"overview" | "records" | "plans">(
    "overview"
  )

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const response = await fetch("/api/super-admin/billing")
        const result = (await response.json()) as BillingResponse

        if (response.ok) {
          setData(result)
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

  const summary = data?.summary
  const plans = data?.plans ?? []
  const workspaces = data?.workspaces ?? []
  const payments = data?.payments ?? []
  const invoices = data?.invoices ?? []

  const billingHealth = useMemo(() => {
    const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue").length
    const unpaidPayments = payments.filter((payment) => payment.status === "pending" || payment.status === "failed").length
    const activePlans = plans.filter((plan) => plan.activeSubscriptions > 0).length

    return { overdueInvoices, unpaidPayments, activePlans }
  }, [invoices, payments, plans])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Skeleton className="h-28" />
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
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-md lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Billing Console
              </h1>
              <p className="text-sm text-muted-foreground">
                Track subscriptions, invoices, payments, revenue, and plan features across every workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={billingView}
            onValueChange={(value) => setBillingView(value as "overview" | "records" | "plans")}
          >
            <SelectTrigger className="h-10 w-40 text-xs">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="records">Billing Records</SelectItem>
              <SelectItem value="plans">Plan Features</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="border-border bg-background px-3 py-1 font-mono font-bold text-foreground shadow-sm">
            {workspaces.length} workspaces
          </Badge>
        </div>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workspaces</p>
                  <p className="text-2xl font-bold text-foreground">{summary.totalWorkspaces}</p>
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
                  <p className="text-2xl font-bold text-foreground">{summary.activeSubscriptions}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{summary.pendingPayments}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-foreground">{formatKES(summary.totalMonthlyRevenue)}</p>
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
                  <p className="text-2xl font-bold text-foreground">{formatKES(summary.paidThisMonth)}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Billing Health</p>
                <p className="text-2xl font-bold text-foreground">{billingHealth.overdueInvoices + billingHealth.unpaidPayments}</p>
              </div>
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {billingHealth.overdueInvoices} overdue invoices, {billingHealth.unpaidPayments} unpaid or failed payments.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold text-foreground">{billingHealth.activePlans}</p>
              </div>
              <BadgeCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Plans currently attached to active subscriptions.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Latest Payment</p>
                <p className="text-2xl font-bold text-foreground">{payments[0] ? formatKES(payments[0].amount) : "—"}</p>
              </div>
              <History className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {payments[0] ? `${payments[0].workspaceName} · ${payments[0].status}` : "No payment history yet."}
            </p>
          </CardContent>
        </Card>
      </div>

      {(billingView === "overview" || billingView === "plans") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Plan Features and Entitlements
            </CardTitle>
            <CardDescription>
              Subscription tiers, included features, pricing, and active workspace usage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{plan.displayName}</p>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                    <Badge variant="outline" className="border-border bg-muted/40 text-[10px] font-bold uppercase text-foreground">
                      {plan.activeSubscriptions} active
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatKES(plan.monthlyPrice)}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                    {plan.badge && (
                      <Badge className="border-border bg-primary/10 text-primary">{plan.badge}</Badge>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="border-border bg-muted/30 text-[10px] text-muted-foreground">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(billingView === "overview" || billingView === "records") && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Workspace Billing Records
              </CardTitle>
              <CardDescription>
                Subscription, payment, and renewal status for each workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Billing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workspaces.map((workspace) => (
                      <TableRow key={workspace.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{workspace.name}</p>
                            <p className="text-xs text-muted-foreground">{workspace.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBadgeClass(workspace.planName)}>
                            {workspace.planName || "No Plan"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getBadgeClass(workspace.subscriptionStatus)}>
                              {workspace.subscriptionStatus || "No Subscription"}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground">
                              Payment: {workspace.paymentStatus || "Unknown"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(workspace.nextBillingDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Payments and Invoices
              </CardTitle>
              <CardDescription>
                Latest payment activity and invoice records pulled from the billing ledger.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Payments</h3>
                  <Badge variant="outline" className="border-border bg-muted/30 text-[10px] uppercase text-muted-foreground">
                    Latest {payments.length}
                  </Badge>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Workspace</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{payment.workspaceName}</p>
                              <p className="text-xs text-muted-foreground">
                                {payment.planName || payment.workspaceSlug}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-semibold text-foreground">
                            {formatKES(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getBadgeClass(payment.status)}>{payment.status}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatDateTime(payment.paidAt || payment.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Invoices</h3>
                  <Badge variant="outline" className="border-border bg-muted/30 text-[10px] uppercase text-muted-foreground">
                    Latest {invoices.length}
                  </Badge>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                              <p className="text-xs text-muted-foreground">{invoice.workspaceName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getBadgeClass(invoice.status)}>{invoice.status}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-semibold text-foreground">
                            {formatKES(invoice.amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(invoice.dueDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Billing Controls
          </CardTitle>
          <CardDescription>
            Quick operational hooks for billing support and plan management.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-border bg-background">
            Export Billing Report
          </Button>
          <Button variant="outline" className="border-border bg-background">
            Review Failed Payments
          </Button>
          <Button variant="outline" className="border-border bg-background">
            Manage Plan Catalog
          </Button>
          <Button>
            Open Billing Queue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}