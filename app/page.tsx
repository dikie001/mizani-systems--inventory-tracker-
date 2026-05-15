"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import {
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  Check,
  ChevronRight,
  Globe,
  Layers,
  Lock,
  Package,
  Package2,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Separator } from "@/components/ui/separator"

/* -------------------------------------------------------------------------- */
/*                              Animated Counter                              */
/* -------------------------------------------------------------------------- */

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Navbar                                   */
/* -------------------------------------------------------------------------- */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Package2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            StockVault
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <a href="#features">Features</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#pricing">Pricing</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#testimonials">Testimonials</a>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth">
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Hero Section                                */
/* -------------------------------------------------------------------------- */

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Gradient BG */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Now in public beta
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Inventory management,{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              reimagined
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Track stock, manage orders, and gain real-time insights — all from
            one beautifully designed platform built for modern businesses.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/auth">
                Start for free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
              asChild
            >
              <a href="#features">
                See how it works
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto mt-16 max-w-5xl md:mt-20">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/30 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <div className="h-3 w-3 rounded-full bg-green-400/80" />
              <span className="ml-3 text-xs text-muted-foreground">
                StockVault Dashboard
              </span>
            </div>
            <Image
              src="/dashboard-preview.png"
              alt="StockVault dashboard showing inventory analytics, KPI cards, and charts"
              width={1920}
              height={1080}
              className="w-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Stats Section                                */
/* -------------------------------------------------------------------------- */

function StatsSection() {
  const stats = [
    { label: "Items tracked", value: 2400000, suffix: "+", prefix: "" },
    { label: "Active businesses", value: 1200, suffix: "+", prefix: "" },
    { label: "Uptime SLA", value: 99, suffix: ".9%", prefix: "" },
    { label: "Saved in waste", value: 8, suffix: "M+", prefix: "$" },
  ]

  return (
    <section className="border-y border-border/50 bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold tracking-tight md:text-4xl">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Features Section                              */
/* -------------------------------------------------------------------------- */

function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Live dashboards with revenue trends, stock movements, and category breakdowns updated in real time.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Get notified before stockouts happen. Automated low-stock alerts keep your supply chain healthy.",
    },
    {
      icon: Layers,
      title: "Multi-warehouse",
      description:
        "Manage inventory across multiple locations with unified tracking and transfer management.",
    },
    {
      icon: TrendingUp,
      title: "Demand Forecasting",
      description:
        "AI-powered predictions help you order the right quantities at the right time.",
    },
    {
      icon: Lock,
      title: "Role-based Access",
      description:
        "Fine-grained permissions ensure your team sees only what they need. Full audit logging included.",
    },
    {
      icon: Globe,
      title: "API-first Design",
      description:
        "RESTful APIs and webhooks let you integrate StockVault with your existing tools in minutes.",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage inventory
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools designed for teams of every size — from startup
            warehouses to enterprise supply chains.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Testimonials Section                            */
/* -------------------------------------------------------------------------- */

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "StockVault cut our inventory discrepancies by 94%. The real-time dashboards alone are worth the price.",
      name: "Sarah Chen",
      role: "Operations Director, NovaTech",
      initials: "SC",
    },
    {
      quote:
        "We switched from spreadsheets and haven't looked back. Setup took 15 minutes and the team adopted it instantly.",
      name: "James Kariuki",
      role: "Founder, QuickShip Logistics",
      initials: "JK",
    },
    {
      quote:
        "The demand forecasting feature saved us from a major stockout during peak season. Absolutely essential.",
      name: "Maria Santos",
      role: "Supply Chain Manager, FreshMart",
      initials: "MS",
    },
  ]

  return (
    <section id="testimonials" className="bg-muted/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by operations teams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers say about transforming their inventory
            workflows.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="flex flex-col justify-between">
              <CardContent className="pt-2">
                <p className="leading-relaxed text-muted-foreground italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </CardContent>
              <CardFooter className="gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Pricing Section                               */
/* -------------------------------------------------------------------------- */

function PricingSection() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      description: "For small teams just getting started",
      features: [
        "Up to 500 SKUs",
        "1 warehouse",
        "Basic analytics",
        "Email support",
        "CSV import/export",
      ],
      cta: "Get started",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/mo",
      description: "For growing businesses that need more",
      features: [
        "Unlimited SKUs",
        "5 warehouses",
        "Advanced analytics & charts",
        "Low-stock alerts",
        "API access",
        "Priority support",
      ],
      cta: "Start free trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large-scale operations",
      features: [
        "Everything in Pro",
        "Unlimited warehouses",
        "Demand forecasting (AI)",
        "SSO & RBAC",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      cta: "Contact sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.popular
                  ? "ring-2 ring-primary shadow-xl shadow-primary/10"
                  : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 right-4">
                  <Badge className="px-3 py-1 shadow-md">Most popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <Separator className="mb-6" />
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth">
                    {tier.cta}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                CTA Section                                 */
/* -------------------------------------------------------------------------- */

function CTASection() {
  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/90 to-chart-5 text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
          <CardContent className="relative flex flex-col items-center py-16 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Rocket className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to take control of your inventory?
            </h2>
            <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
              Join 1,200+ businesses already using StockVault to reduce waste,
              prevent stockouts, and grow smarter.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/auth">
                  Get started — it&apos;s free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

function Footer() {
  const columns = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Integrations", "Changelog", "API docs"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Press", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Security", "GDPR"],
    },
  ]

  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">StockVault</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Intelligent inventory management for modern businesses. Track,
              manage, and optimize your stock with ease.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} StockVault. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Landing                                   */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
