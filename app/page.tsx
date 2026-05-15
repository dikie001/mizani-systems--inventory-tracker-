"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  Check,
  Play,
  Box,
  BarChart3,
  Layers,
  Smartphone,
  Users,
  Shield,
  ArrowUpRight,
  Plus,
  Package2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
          ? "border-b bg-background/80 py-3 backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black italic">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">StockVault</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {["Feature", "Services", "Tutorial", "About US"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Sign Up
          </Link>
          <Button variant="default" className="rounded-lg px-6" asChild>
            <Link href="/auth">Login</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center bg-background">
      <div className="bg-grid absolute inset-0 opacity-[0.03]" />
      
      <div className="mx-auto max-w-7xl px-6 relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Warehouse stock <br /> Management <br /> Solution
          </h1>
          <p className="mt-8 max-w-lg text-muted-foreground leading-relaxed">
            Inventory system to control and manage products in the warehouse in real time and integrated to make it easier to develop your business.
          </p>
          
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Button size="lg" className="h-12 rounded-lg px-8 text-sm font-bold shadow-xl shadow-primary/20" asChild>
              <Link href="/auth">Free Trial 1 Month</Link>
            </Button>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border group-hover:bg-accent">
                <Play className="h-3 w-3 fill-current" />
              </div>
              <span className="text-sm font-medium">How It Work</span>
            </button>
          </div>

          <div className="mt-16 flex gap-12 border-t border-border pt-10">
            {[
              { label: "Brand Owner", value: "14K" },
              { label: "User Active", value: "23K" },
              { label: "Partners", value: "500+" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative animate-float translate-x-12">
             <Card className="bg-card border-border shadow-2xl rounded-xl overflow-hidden w-[450px]">
                <div className="px-5 py-4 border-b grid grid-cols-6 gap-4 bg-muted/20">
                   <div className="col-span-3 text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">Product Name</div>
                   <div className="col-span-1 text-right text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">Sold</div>
                   <div className="col-span-1 text-right text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">Amount</div>
                   <div className="col-span-1 text-right text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">Stock</div>
                </div>
                <div className="p-5 space-y-6">
                   {[
                     { name: "Adidas Ultraboost", sku: "AU-240-PRO", sold: "195", amount: "$1,750", stock: "240" },
                     { name: "Adidas Predator", sku: "AP-220-V2", sold: "150", amount: "$1,854", stock: "220" },
                     { name: "Nike Air Force 1", sku: "NA-201-CLR", sold: "123", amount: "$1,285", stock: "201" },
                   ].map((item, i) => (
                     <div key={i} className="grid grid-cols-6 gap-4 items-center group cursor-default">
                       <div className="col-span-3 flex items-center gap-3">
                         <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm shadow-inner transition-transform group-hover:scale-105">
                           {item.name.charAt(0)}
                         </div>
                         <div className="min-w-0">
                           <div className="text-[11px] font-bold text-foreground truncate tracking-tight">{item.name}</div>
                           <div className="text-[9px] font-mono text-muted-foreground tracking-tighter uppercase">{item.sku}</div>
                         </div>
                       </div>
                       <div className="col-span-1 text-right text-[10px] font-medium text-muted-foreground">{item.sold} pcs</div>
                       <div className="col-span-1 text-right text-[10px] font-bold text-foreground">{item.amount}</div>
                       <div className="col-span-1 text-right">
                         <span className="text-[11px] font-black text-foreground">{item.stock}</span>
                       </div>
                     </div>
                   ))}
                </div>
             </Card>

             <Card className="absolute -bottom-24 -left-12 bg-primary text-primary-foreground border-none shadow-2xl rounded-xl p-6 w-[280px]">
                <div className="text-xs font-medium text-primary-foreground/60 mb-1 uppercase">Sales Overview</div>
                <div className="flex items-end justify-between gap-4 h-24 mt-4">
                   {[40, 70, 45, 90, 65, 80].map((h, i) => (
                     <div key={i} className="bg-primary-foreground/20 w-full rounded-sm relative group cursor-pointer hover:bg-primary-foreground/40 transition-all" style={{ height: `${h}%` }}>
                       {i === 3 && <div className="absolute -top-1 w-2 h-2 bg-primary-foreground rounded-full left-1/2 -translate-x-1/2" />}
                     </div>
                   ))}
                </div>
             </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function PartnersSection() {
  const partners = [
    { name: "IBM", color: "text-primary-foreground/40" },
    { name: "Microsoft", color: "text-primary-foreground/40" },
    { name: "Reebok", color: "text-primary-foreground/40" },
    { name: "Google", color: "text-primary-foreground/40" },
  ]

  return (
    <div className="bg-primary py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-primary-foreground/80 font-medium whitespace-nowrap">We work with well-known companies</p>
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-24">
             {partners.map(p => (
               <span key={p.name} className={`text-2xl font-black italic tracking-tighter ${p.color}`}>{p.name}</span>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdvantageSection() {
  const advantages = [
    {
      title: "Easy To Manage Products",
      desc: "Product management with various features such as financial statistics to storage units.",
      icon: Layers,
    },
    {
      title: "Reduce all manual work efficiently",
      desc: "With an integrated inventory system, you can reduce all manual work efficiently.",
      icon: BarChart3,
    },
    {
      title: "System Integrated Mobile Application",
      desc: "All features on this platform have been integrated with our mobile application.",
      icon: Smartphone,
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Advantages Of Using a <br /> Warehouse Inventory System
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {advantages.map((adv, i) => (
            <Card key={i} className="border-border shadow-sm hover:shadow-md transition-shadow rounded-2xl p-8 bg-card">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <adv.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 leading-tight">{adv.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{adv.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ManageSection() {
  return (
    <section className="py-24 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 grid gap-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Manage product prices <br /> with management <br /> system
          </h2>
          <p className="mt-8 text-muted-foreground leading-relaxed max-w-md text-sm">
            This inventory system can manage and control products, one of which can regulate product prices ranging from capital to sales costs and also income and can find out product stock in the warehouse so that you can control your products more quickly, regularly and efficiently in managing your business.
          </p>
          <Button size="lg" variant="default" className="mt-10 h-12 rounded-lg px-8 text-sm font-bold shadow-xl shadow-primary/20" asChild>
            <Link href="/auth">Learn More</Link>
          </Button>
        </div>

        <div className="relative">
           <div className="absolute -top-10 -left-10 opacity-10">
              <div className="grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="h-1 w-1 bg-primary rounded-full" />
                ))}
              </div>
            </div>

            <div className="relative">
               <Card className="bg-card border-border shadow-2xl rounded-xl overflow-hidden w-[360px] translate-x-12 translate-y-12 relative z-10">
                  <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                     <div className="text-[10px] font-bold text-muted-foreground uppercase">Product Name</div>
                     <div className="text-[10px] font-bold text-muted-foreground uppercase">Stock</div>
                  </div>
                  <div className="p-4 space-y-4">
                     {[
                       { name: "Adidas Ultraboost", stock: "240 pcs" },
                       { name: "Adidas Predator", stock: "220 pcs" },
                       { name: "Nike Air Force 1", stock: "201 pcs" },
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="h-4 w-6 bg-muted rounded" />
                           <span className="text-[10px] font-medium text-foreground">{item.name}</span>
                         </div>
                         <div className="text-[10px] text-muted-foreground font-mono">{item.stock}</div>
                       </div>
                     ))}
                  </div>
               </Card>

               <Card className="absolute -bottom-10 right-0 bg-primary text-primary-foreground border-none shadow-2xl rounded-xl p-6 w-[240px] z-20">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60 mb-6">Marketplace</div>
                  <div className="relative h-32 flex items-center justify-center">
                     <div className="absolute inset-0 rounded-full border-8 border-primary-foreground/10" />
                     <div className="absolute inset-0 rounded-full border-8 border-t-accent border-r-transparent border-b-transparent border-l-transparent rotate-[30deg]" />
                     <div className="text-center">
                        <div className="text-2xl font-black">$1568</div>
                        <div className="text-[8px] font-bold text-primary-foreground/60">+12%</div>
                     </div>
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                     <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                        <span className="text-[8px] font-bold">Amazon</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/30" />
                        <span className="text-[8px] font-bold">Shopee</span>
                     </div>
                  </div>
               </Card>
            </div>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: "Basic",
      price: "$159",
      period: "Per Month",
      popular: false,
      features: ["Unlimited update feature", "Unlimited Admin", "Integrated dashboard", "Access to community"],
    },
    {
      name: "Proffesional",
      price: "$199",
      period: "Per Month",
      popular: true,
      features: ["Unlimited update feature", "Unlimited Admin", "Integrated dashboard", "Access to community", "Priority support"],
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start now with a package <br /> price offer for your business
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
           {plans.map((plan, i) => (
             <Card key={i} className={`flex-1 rounded-3xl p-8 border-border shadow-xl ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>
                <div className="mb-8">
                   <div className="text-lg font-bold mb-1">{plan.name}</div>
                   <div className="text-xs opacity-60">Popular Choice</div>
                </div>
                
                <div className="mb-8">
                   <div className="text-4xl font-black">{plan.price}</div>
                   <div className="text-xs opacity-60 mt-1">{plan.period}</div>
                </div>

                <ul className="space-y-4 mb-10">
                   {plan.features.map((f, j) => (
                     <li key={j} className="flex items-center gap-3 text-xs font-medium">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${plan.popular ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                           <Check className={`h-2.5 w-2.5 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`} />
                        </div>
                        {f}
                     </li>
                   ))}
                </ul>

                <Button variant={plan.popular ? "secondary" : "default"} className="w-full h-12 rounded-xl text-sm font-bold">
                   Choose Plan
                </Button>
             </Card>
           ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-background py-20 text-foreground border-t">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
             <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black italic">
                  C
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">StockVault</span>
             </Link>
             <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
                Empowering modern businesses with the tools to track, manage, and optimize inventory at scale.
             </p>
          </div>
          
          {[
            { title: "Service", links: ["Warehouse", "Inventory", "Logistic", "Cloud Solution"] },
            { title: "Support", links: ["Help Center", "Community", "Tutorial", "API Status"] },
            { title: "Company", links: ["About Us", "Contact", "Careers", "Blog"] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold mb-6 text-foreground">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((l, j) => (
                  <li key={j}><Link href="#" className="text-muted-foreground text-xs hover:text-foreground transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">© 2026 StockVault. All rights reserved.</p>
           <div className="flex gap-8">
              <Link href="#" className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium hover:text-foreground transition-colors">Terms of Use</Link>
           </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      <HeroSection />
      <PartnersSection />
      <AdvantageSection />
      <ManageSection />
      <PricingSection />
      <Footer />
    </div>
  )
}
