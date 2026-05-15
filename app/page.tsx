"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useReveal } from "@/hooks/use-reveal"
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
  Zap,
  HelpCircle,
  Mail,
  Smartphone,
  Shield,
  CreditCard,
  Cpu,
  Share2,
  MessageCircle,
  Timer,
} from "lucide-react"

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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-background/60 py-3 shadow-2xl backdrop-blur-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <Package2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">StockVault</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {["Features", "Testimonials", "Pricing", "FAQ"].map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              asChild
            >
              <a href={`#${item.toLowerCase()}`}>{item}</a>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="h-10 rounded-full px-6 shadow-xl shadow-primary/20"
            asChild
          >
            <Link href="/auth">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
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
  const revealRef = useReveal()

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Background Orbs */}
      <div className="blob left-[10%] top-[20%] bg-primary/20" />
      <div className="blob right-[10%] top-[10%] bg-chart-2/20" />
      <div className="blob bottom-[10%] left-[20%] bg-chart-1/10" />

      <div className="bg-grid absolute inset-0 -z-20 opacity-[0.03]" />

      <div ref={revealRef} className="animate-reveal relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Badge
            variant="outline"
            className="mb-8 border-primary/20 bg-primary/5 px-4 py-1.5 text-primary backdrop-blur-sm"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            StockVault 2.0 is now in public beta
          </Badge>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Inventory management, <br />
            <span className="text-gradient">reimagined.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Take full control of your supply chain with real-time analytics, 
            AI-driven forecasting, and a beautiful interface your team will actually love to use.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg shadow-2xl shadow-primary/25" asChild>
              <Link href="/auth">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 rounded-full border-white/10 bg-white/5 px-10 text-lg backdrop-blur-sm hover:bg-white/10"
              asChild
            >
              <a href="#features">
                See features
                <ChevronRight className="ml-1 h-5 w-5" />
              </a>
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-background bg-muted p-0.5"
                >
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-primary/20 to-primary/60" />
                </div>
              ))}
            </div>
            <span>Trusted by 1,200+ fast-growing companies</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mx-auto mt-20 max-w-6xl md:mt-28">
          <div className="animate-float">
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-primary/30 to-chart-2/30 blur-2xl opacity-50" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card shadow-[0_0_50px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 border-b border-white/10 bg-muted/20 px-6 py-4">
                <div className="flex gap-1.5">
                  <div className="h-3.5 w-3.5 rounded-full bg-red-500/50" />
                  <div className="h-3.5 w-3.5 rounded-full bg-yellow-500/50" />
                  <div className="h-3.5 w-3.5 rounded-full bg-green-500/50" />
                </div>
                <div className="mx-auto flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  stockvault.app/dashboard
                </div>
              </div>
              <Image
                src="/dashboard-preview-premium.png"
                alt="StockVault Premium Dashboard Preview"
                width={2400}
                height={1350}
                className="w-full transition-transform duration-700 hover:scale-[1.02]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Logo Cloud                                  */
/* -------------------------------------------------------------------------- */

function LogoCloud() {
  const logos = [
    { name: "Loom", icon: Rocket },
    { name: "Vercel", icon: Zap },
    { name: "Linear", icon: Layers },
    { name: "Raycast", icon: Box },
    { name: "Stripe", icon: CreditCard },
  ]

  return (
    <div className="border-y border-white/5 bg-muted/10 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2.5">
              <logo.icon className="h-7 w-7" />
              <span className="text-xl font-bold tracking-tight">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Stats Section                                */
/* -------------------------------------------------------------------------- */

function StatsSection() {
  const revealRef = useReveal()
  const stats = [
    { label: "Items tracked", value: 2400000, suffix: "+", prefix: "" },
    { label: "Active businesses", value: 1200, suffix: "+", prefix: "" },
    { label: "Uptime SLA", value: 99, suffix: ".9%", prefix: "" },
    { label: "Saved in waste", value: 8, suffix: "M+", prefix: "$" },
  ]

  return (
    <section ref={revealRef} className="animate-reveal py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="group text-center">
              <div className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl text-gradient transition-transform group-hover:scale-110">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </div>
              <p className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
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
  const revealRef = useReveal()
  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Get instant insights with live tracking of every stock movement and transaction.",
      size: "large",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "AI predicts low stock before it happens, sending instant notifications to your team.",
      size: "small",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Manage your warehouse from anywhere with our fully responsive mobile experience.",
      size: "small",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and role-based access ensure your data stays protected.",
      size: "small",
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      icon: Cpu,
      title: "AI Forecasting",
      description: "Our machine learning models analyze trends to optimize your inventory levels automatically.",
      size: "large",
      color: "bg-pink-500/10 text-pink-500",
    },
  ]

  return (
    <section id="features" className="py-24 md:py-32">
      <div ref={revealRef} className="animate-reveal mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4">
            Powerful Features
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Everything you need, <br />
            <span className="text-muted-foreground">and more.</span>
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Built for modern businesses that demand speed, accuracy, and reliability.
          </p>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-6">
          {features.map((feature, idx) => (
            <Card
              key={feature.title}
              className={`group relative overflow-hidden border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-primary/5 ${
                feature.size === "large" ? "md:col-span-3" : "md:col-span-2"
              }`}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
              <CardHeader>
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${feature.color}`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
              <div className="absolute bottom-4 right-6 translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
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
  const revealRef = useReveal()
  const testimonials = [
    {
      quote:
        "StockVault cut our inventory discrepancies by 94%. The real-time dashboards alone are worth the price.",
      name: "Sarah Chen",
      role: "Operations Director, NovaTech",
      image: "https://i.pravatar.cc/150?u=sarah",
    },
    {
      quote:
        "We switched from spreadsheets and haven't looked back. Setup took 15 minutes and the team adopted it instantly.",
      name: "James Kariuki",
      role: "Founder, QuickShip Logistics",
      image: "https://i.pravatar.cc/150?u=james",
    },
    {
      quote:
        "The demand forecasting feature saved us from a major stockout during peak season. Absolutely essential.",
      name: "Maria Santos",
      role: "Supply Chain Manager, FreshMart",
      image: "https://i.pravatar.cc/150?u=maria",
    },
  ]

  return (
    <section id="testimonials" className="relative overflow-hidden py-24 md:py-32">
      <div className="blob right-0 top-1/2 -translate-y-1/2 bg-primary/10" />
      <div ref={revealRef} className="animate-reveal mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Testimonials</Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Trusted by the best
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="flex flex-col justify-between border-white/5 bg-white/[0.02] p-6">
              <CardContent className="px-0 pt-0">
                <div className="mb-4 flex text-primary">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Zap key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </CardContent>
              <CardFooter className="gap-4 px-0 pb-0">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={t.image} alt={t.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {t.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
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
  const revealRef = useReveal()
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for startups and small shops",
      features: ["Up to 500 SKUs", "Basic analytics", "Email support", "Mobile App access"],
      cta: "Get started",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/mo",
      description: "For growing businesses scaling fast",
      features: ["Unlimited SKUs", "AI Analytics", "Smart Alerts", "API Access", "Priority support"],
      cta: "Start free trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For global supply chain operations",
      features: ["Custom Integrations", "SLA Guarantee", "SSO & Security", "Dedicated Manager", "White-label"],
      cta: "Contact sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div ref={revealRef} className="animate-reveal mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Scale without friction
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Choose the plan that fits your current needs and upgrade as you grow.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col overflow-hidden border-white/10 bg-white/[0.02] ${
                tier.popular
                  ? "ring-2 ring-primary shadow-2xl shadow-primary/20 scale-105 z-10"
                  : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-8">
                <div className="mb-8 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="ml-1 text-xl text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <Separator className="mb-8 bg-white/5" />
                <ul className="space-y-4">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="rounded-full bg-primary/20 p-1">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  className={`w-full h-12 rounded-xl text-base ${
                    tier.popular ? "bg-primary text-primary-foreground shadow-lg" : ""
                  }`}
                  variant={tier.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth">{tier.cta}</Link>
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
/*                                FAQ Section                                 */
/* -------------------------------------------------------------------------- */

function FAQSection() {
  const revealRef = useReveal()
  const faqs = [
    {
      q: "How secure is my data?",
      a: "We use AES-256 encryption at rest and TLS 1.3 in transit. Your data is stored across multiple redundant regions for maximum safety and uptime.",
    },
    {
      q: "Can I import my existing inventory?",
      a: "Absolutely. We support bulk CSV and Excel imports, as well as direct API integrations with most major ERP systems.",
    },
    {
      q: "Do you offer custom integrations?",
      a: "Yes, our Enterprise plan includes custom development support to ensure StockVault works seamlessly with your existing tech stack.",
    },
    {
      q: "Is there a mobile app?",
      a: "StockVault is a Progressive Web App (PWA) that you can install on any iOS or Android device for a native-like experience.",
    },
  ]

  return (
    <section id="faq" className="py-24 md:py-32">
      <div ref={revealRef} className="animate-reveal mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h2 className="text-4xl font-bold tracking-tight">Common Questions</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
              <AccordionTrigger className="text-left text-lg hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                CTA Section                                 */
/* -------------------------------------------------------------------------- */

function CTASection() {
  const revealRef = useReveal()
  return (
    <section className="py-24 md:py-32 px-6">
      <div ref={revealRef} className="animate-reveal mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[3rem] bg-primary px-8 py-20 text-center text-primary-foreground shadow-[0_20px_50px_rgba(var(--primary),0.3)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl">
              <Rocket className="h-10 w-10 animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Ready to automate <br /> your warehouse?
            </h2>
            <p className="mt-6 max-w-2xl text-xl text-primary-foreground/80">
              Join 1,200+ businesses already saving time and money with StockVault. 
              No credit card required to start.
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                variant="secondary"
                className="h-16 rounded-2xl px-12 text-xl font-bold shadow-2xl transition-transform hover:scale-105"
                asChild
              >
                <Link href="/auth">
                  Get Started Now — It's Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Package2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">StockVault</span>
            </Link>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Empowering modern businesses with the tools to track, manage, and optimize inventory at scale.
            </p>
            <div className="mt-8 flex gap-4">
              {[Globe, Mail, Share2].map((Icon, i) => (
                <a key={i} href="#" className="rounded-full bg-white/5 p-2.5 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Features", "Integrations", "Enterprise", "Pricing", "API Docs"] },
            { title: "Company", links: ["About Us", "Blog", "Careers", "Customers", "Contact"] },
            { title: "Support", links: ["Help Center", "Community", "Status", "Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-base text-muted-foreground transition-colors hover:text-primary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-white/5 pt-12 text-center md:flex md:items-center md:justify-between md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StockVault Inc. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-8 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Cookie Policy</a>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] text-muted-foreground/30 uppercase tracking-[0.3em]">
          Designed for Excellence &bull; Built for Scale
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <HeroSection />
      <LogoCloud />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}
