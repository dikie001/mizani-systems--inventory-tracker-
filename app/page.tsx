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
          ? "border-b border-white/10 bg-indigo-950/80 py-3 backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-900 font-black italic">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StockVault</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {["Feature", "Services", "Tutorial", "About US"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm font-medium text-white hover:text-white/80">
            Sign Up
          </Link>
          <Button variant="secondary" className="rounded-lg px-6 bg-indigo-600 text-white hover:bg-indigo-700" asChild>
            <Link href="/auth">Login</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative bg-[#0b0e37] pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center">
      {/* Background patterns */}
      <div className="absolute top-20 right-1/4 opacity-10">
        <div className="grid grid-cols-5 gap-2">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="h-1 w-1 bg-white rounded-full" />
          ))}
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Warehouse stock <br /> Management <br /> Solution
          </h1>
          <p className="mt-8 max-w-lg text-white/60 leading-relaxed">
            Inventory system to control and manage products in the warehouse in real time and integrated to make it easier to develop your business.
          </p>
          
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Button className="h-12 rounded-lg bg-indigo-600 px-8 text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20" asChild>
              <Link href="/auth">Free Trial 1 Month</Link>
            </Button>
            <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 group-hover:bg-white/10">
                <Play className="h-3 w-3 fill-white" />
              </div>
              <span className="text-sm font-medium">How It Work</span>
            </button>
          </div>

          <div className="mt-16 flex gap-12 border-t border-white/10 pt-10">
            {[
              { label: "Brand Owner", value: "14K" },
              { label: "User Active", value: "23K" },
              { label: "Partners", value: "500+" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          {/* Floating UI Elements */}
          <div className="relative animate-float translate-x-12">
             <Card className="bg-white/95 backdrop-blur-sm border-none shadow-2xl rounded-xl overflow-hidden w-[400px]">
                <div className="p-4 border-b flex items-center justify-between">
                   <div className="text-[10px] font-bold text-indigo-950 uppercase">Product Name</div>
                   <div className="text-[10px] font-bold text-indigo-950 uppercase">Stock</div>
                </div>
                <div className="p-4 space-y-4">
                   {[
                     { name: "Adidas Ultraboost", stock: "240 pcs", amount: "$1750" },
                     { name: "Adidas Predator", stock: "220 pcs", amount: "$1854" },
                     { name: "Nike Air Force 1", stock: "201 pcs", amount: "$1285" },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="h-6 w-8 bg-slate-100 rounded" />
                         <span className="text-[10px] font-medium">{item.name}</span>
                       </div>
                       <div className="text-[10px] text-slate-400">{item.stock}</div>
                     </div>
                   ))}
                </div>
             </Card>

             <Card className="absolute -bottom-24 -left-12 bg-indigo-500/90 backdrop-blur-md border-none shadow-2xl rounded-xl p-6 w-[280px] text-white">
                <div className="text-xs font-medium text-white/60 mb-1 uppercase">Sales Overview</div>
                <div className="flex items-end justify-between gap-4 h-24 mt-4">
                   {[40, 70, 45, 90, 65, 80].map((h, i) => (
                     <div key={i} className="bg-white/20 w-full rounded-sm relative group cursor-pointer hover:bg-white/40 transition-all" style={{ height: `${h}%` }}>
                       {i === 3 && <div className="absolute -top-1 w-2 h-2 bg-white rounded-full left-1/2 -translate-x-1/2" />}
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
    { name: "IBM", color: "text-white/40" },
    { name: "Microsoft", color: "text-white/40" },
    { name: "Reebok", color: "text-white/40" },
    { name: "Google", color: "text-white/40" },
  ]

  return (
    <div className="bg-indigo-600 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-white/80 font-medium whitespace-nowrap">We work with well-known companies</p>
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
    <section className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
            Advantages Of Using a <br /> Warehouse Inventory System
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {advantages.map((adv, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl p-8 bg-white">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <adv.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-indigo-950 mb-4 leading-tight">{adv.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{adv.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ManageSection() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 grid gap-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
            Manage product prices <br /> with management <br /> system
          </h2>
          <p className="mt-8 text-slate-500 leading-relaxed max-w-md text-sm">
            This inventory system can manage and control products, one of which can regulate product prices ranging from capital to sales costs and also income and can find out product stock in the warehouse so that you can control your products more quickly, regularly and efficiently in managing your business.
          </p>
          <Button className="mt-10 h-12 rounded-lg bg-indigo-600 px-8 text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20" asChild>
            <Link href="/auth">Learn More</Link>
          </Button>
        </div>

        <div className="relative">
           <div className="absolute -top-10 -left-10 opacity-10">
              <div className="grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="h-1 w-1 bg-indigo-900 rounded-full" />
                ))}
              </div>
            </div>

            <div className="relative">
               <Card className="bg-white border shadow-2xl rounded-xl overflow-hidden w-[360px] translate-x-12 translate-y-12 relative z-10">
                  <div className="p-4 border-b flex items-center justify-between">
                     <div className="text-[10px] font-bold text-slate-400 uppercase">Product Name</div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase">Stock</div>
                  </div>
                  <div className="p-4 space-y-4">
                     {[
                       { name: "Adidas Ultraboost", stock: "240 pcs" },
                       { name: "Adidas Predator", stock: "220 pcs" },
                       { name: "Nike Air Force 1", stock: "201 pcs" },
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="h-4 w-6 bg-slate-100 rounded" />
                           <span className="text-[10px] font-medium">{item.name}</span>
                         </div>
                         <div className="text-[10px] text-slate-400 font-mono">{item.stock}</div>
                       </div>
                     ))}
                  </div>
               </Card>

               <Card className="absolute -bottom-10 right-0 bg-indigo-600 text-white border-none shadow-2xl rounded-xl p-6 w-[240px] z-20">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-6">Marketplace</div>
                  <div className="relative h-32 flex items-center justify-center">
                     <div className="absolute inset-0 rounded-full border-8 border-indigo-500 opacity-30" />
                     <div className="absolute inset-0 rounded-full border-8 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rotate-[30deg]" />
                     <div className="text-center">
                        <div className="text-2xl font-black">$1568</div>
                        <div className="text-[8px] font-bold text-indigo-300">+12%</div>
                     </div>
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                     <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                        <span className="text-[8px] font-bold">Amazon</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
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
    <section className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
            Start now with a package <br /> price offer for your business
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
           {plans.map((plan, i) => (
             <Card key={i} className={`flex-1 rounded-3xl p-8 border-none shadow-xl ${plan.popular ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-950'}`}>
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
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${plan.popular ? 'bg-white/20' : 'bg-indigo-100'}`}>
                           <Check className={`h-2.5 w-2.5 ${plan.popular ? 'text-white' : 'text-indigo-600'}`} />
                        </div>
                        {f}
                     </li>
                   ))}
                </ul>

                <Button className={`w-full h-12 rounded-xl text-sm font-bold ${plan.popular ? 'bg-white text-indigo-600 hover:bg-white/90' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
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
    <footer className="bg-[#0b0e37] py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
             <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-900 font-black italic">
                  C
                </div>
                <span className="text-xl font-bold tracking-tight text-white">StockVault</span>
             </Link>
             <p className="text-white/40 text-xs leading-relaxed max-w-xs">
                Empowering modern businesses with the tools to track, manage, and optimize inventory at scale.
             </p>
          </div>
          
          {[
            { title: "Service", links: ["Warehouse", "Inventory", "Logistic", "Cloud Solution"] },
            { title: "Support", links: ["Help Center", "Community", "Tutorial", "API Status"] },
            { title: "Company", links: ["About Us", "Contact", "Careers", "Blog"] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold mb-6 text-white">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((l, j) => (
                  <li key={j}><Link href="#" className="text-white/40 text-xs hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium">© 2026 StockVault. All rights reserved.</p>
           <div className="flex gap-8">
              <Link href="#" className="text-[10px] text-white/20 uppercase tracking-widest font-medium hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-[10px] text-white/20 uppercase tracking-widest font-medium hover:text-white transition-colors">Terms of Use</Link>
           </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-indigo-950 font-sans selection:bg-indigo-600/30">
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
