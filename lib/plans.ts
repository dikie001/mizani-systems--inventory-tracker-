export const PLANS = [
  {
    id: "trial",
    name: "trial",
    displayName: "Free Trial",
    badge: "14 days",
    monthlyPrice: 0,
    description: "No card required. Try the full platform risk-free.",
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
    id: "basic",
    name: "basic",
    displayName: "Basic",
    badge: null,
    monthlyPrice: 675, 
    description: "For small operations getting off spreadsheets.",
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
  {
    id: "pro",
    name: "pro",
    displayName: "Professional",
    badge: "Most Popular",
    monthlyPrice: 1250, 
    description: "For growing teams that need the full platform.",
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
]

export const PLAN_MAP = new Map(PLANS.map((plan) => [plan.name, plan]))

export function getPlanByName(name: string) {
  return PLAN_MAP.get(name)
}

export function getPlanById(id: string) {
  return PLANS.find((plan) => plan.id === id)
}

export function formatKES(amount: number): string {
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }).format(amount)
  } catch (e) {
    return `KES ${amount}`
  }
}
