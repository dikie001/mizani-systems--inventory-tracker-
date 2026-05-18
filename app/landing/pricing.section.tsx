"use client"

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

const CHECK = ({ className = "text-primary" }: { className?: string }) => (
  <svg
    viewBox="0 0 10 10"
    fill="none"
    width="9"
    height="9"
    className={className}
  >
    <path
      d="M2 5l2.5 2.5L8 3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    badge: "14 days",
    monthly: 0,
    desc: "No card required. Try the full platform risk-free.",
    features: [
      "Up to 200 SKUs",
      "1 admin user",
      "Standard dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
    variant: "secondary",
  },
  {
    id: "pro",
    name: "Professional",
    badge: "Most Popular",
    monthly: 1200, // KES 3,999
    desc: "For growing teams that need the full platform.",
    features: [
      "Unlimited SKUs",
      "Unlimited users",
      "Advanced analytics",
      "API access",
      "Priority 24/7 support",
      "Custom integrations",
    ],
    cta: "Start Professional",
    highlight: true,
    variant: "default",
  },
  {
    id: "basic",
    name: "Basic",
    badge: null,
    monthly: 699, 
    desc: "For small operations getting off spreadsheets.",
    features: [
      "Up to 1,000 SKUs",
      "2 admin users",
      "Standard dashboard",
      "Email support",
      "CSV import/export",
    ],
    cta: "Start Basic",
    highlight: false,
    variant: "outline",
  },
]

export default function PricingSection() {
  const formatKES = (n: number) => {
    try {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        currencyDisplay: "code",
        maximumFractionDigits: 0,
      }).format(n)
    } catch (e) {
      return `KES ${n}`
    }
  }

  return (
    <section
      className="bg-background px-5 py-16 text-foreground md:px-6 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <Badge
            variant="secondary"
            className="mb-4 rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]"
          >
            Pricing
          </Badge>
          <h2 className="font-heading text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Simple, <span className="text-primary">transparent</span> pricing
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            No hidden fees. No seat limits on the plans that matter. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isGold = plan.highlight
            const isFree = plan.id === "trial"
            const price =
              plan.id === "trial" ? formatKES(0) : formatKES(plan.monthly)

            return (
              <Card
                key={plan.id}
                className={
                  isGold
                    ? "relative border-primary/30 bg-card shadow-lg shadow-primary/10 ring-1 ring-primary/10 transition-transform duration-200 hover:-translate-y-1"
                    : "relative border-border/70 bg-card/90 transition-transform duration-200 hover:-translate-y-1 hover:border-border hover:shadow-md"
                }
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className={isGold ? "text-primary" : "text-foreground"}>
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="mt-1">{plan.desc}</CardDescription>
                    </div>
                    {plan.badge && (
                      <Badge
                        variant={isGold ? "default" : isFree ? "secondary" : "outline"}
                        className={
                          isGold
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : isFree
                              ? "bg-secondary text-secondary-foreground"
                              : "text-foreground"
                        }
                      >
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-heading text-4xl leading-none tracking-tight text-foreground">
                      {price}
                    </span>
                    {plan.id !== "trial" && (
                      <span className="pb-1 text-sm text-muted-foreground">/mo</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="border-t border-border/70 pt-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                        >
                          <span
                            className={
                              isGold
                                ? "mt-1 inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary"
                                : isFree
                                  ? "mt-1 inline-flex size-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                                  : "mt-1 inline-flex size-5 items-center justify-center rounded-full bg-muted text-foreground"
                            }
                          >
                            <CHECK className="size-2.5" />
                          </span>
                          <span className="text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="border-t-0 bg-transparent p-4 pt-0">
                  <Button variant={plan.variant as "default" | "secondary" | "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">Enterprise</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Custom contracts · SLA guarantees · SSO · Dedicated infrastructure
            </div>
          </div>
          <Button variant="outline" className="w-full md:w-auto">
            Contact Sales →
          </Button>
        </div>
      </div>
    </section>
  )
}
 