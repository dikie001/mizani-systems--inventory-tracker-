"use client"

import Link from "next/link"
import {
  ArrowRight,
  Check,
  Package2,
  BarChart3,
  Layers,
  Smartphone,
  Box,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground italic">
            C
          </div>
          <span>StockVault</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-primary">Features</Link>
          <Link href="#pricing" className="hover:text-primary">Pricing</Link>
          <Link href="#about" className="hover:text-primary">About</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Warehouse stock Management Solution
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-lg">
            Complete inventory system to control and manage products in real time and grow your business efficiently.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <Button size="lg" className="px-8" asChild>
              <Link href="/auth">Free Trial 1 Month</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              How It Works
            </Button>
          </div>
          <div className="flex gap-12 pt-8 border-t">
            <div>
              <div className="text-2xl font-bold">14K</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Brand Owner</div>
            </div>
            <div>
              <div className="text-2xl font-bold">23K</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">User Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Partners</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Card className="shadow-2xl overflow-hidden border-border bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Product Name</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Adidas Ultraboost", stock: "240 pcs" },
                  { name: "Adidas Predator", stock: "220 pcs" },
                  { name: "Nike Air Force 1", stock: "201 pcs" },
                  { name: "Puma Suede", stock: "185 pcs" },
                  { name: "Reebok Classic", stock: "150 pcs" },
                ].map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center font-bold text-xs">
                          {item.name.charAt(0)}
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm text-muted-foreground">{item.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          
          <Card className="absolute -bottom-10 -left-10 w-48 bg-primary text-primary-foreground p-4 shadow-2xl hidden md:block">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-4 opacity-70">Sales Growth</div>
            <div className="flex items-end gap-2 h-16">
              {[40, 70, 45, 90, 60, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-primary-foreground/20 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

function PartnersSection() {
  return (
    <div className="bg-muted/30 py-12 border-y">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-muted-foreground">
          <p className="font-medium">We work with well-known companies</p>
          <div className="flex flex-wrap justify-center gap-12 text-2xl font-bold opacity-50">
            <span>IBM</span>
            <span>Microsoft</span>
            <span>Reebok</span>
            <span>Google</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureSection() {
  const features = [
    {
      title: "Easy To Manage Products",
      desc: "Product management with various features such as financial statistics to storage units.",
      icon: Layers,
    },
    {
      title: "Reduce manual work efficiently",
      desc: "With an integrated inventory system, you can reduce all manual work efficiently.",
      icon: BarChart3,
    },
    {
      title: "Integrated Mobile Application",
      desc: "All features on this platform have been integrated with our mobile application.",
      icon: Smartphone,
    },
  ]

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Advantages Of Using a Warehouse Inventory System
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f, i) => (
            <Card key={i} className="border-none bg-muted/20">
              <CardHeader>
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ManageSection() {
  return (
    <section className="py-24 bg-muted/20 border-y">
      <div className="container mx-auto px-6 grid gap-16 lg:grid-cols-2 items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Manage product prices with management system
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            This inventory system can manage and control products, regulation of prices, sales costs, and income. Control your products more quickly, regularly and efficiently.
          </p>
          <Button variant="default">Learn More</Button>
        </div>
        <div>
          <Card className="overflow-hidden border-border bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Product</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Price</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Adidas Ultraboost", price: "$159.00", stock: "240" },
                  { name: "Adidas Predator", price: "$129.00", stock: "220" },
                  { name: "Nike Air Force 1", price: "$110.00", stock: "201" },
                ].map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.price}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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
      features: ["Unlimited update feature", "Unlimited Admin", "Integrated dashboard", "Access to community"],
    },
    {
      name: "Professional",
      price: "$199",
      popular: true,
      features: ["Unlimited update feature", "Unlimited Admin", "Integrated dashboard", "Access to community", "Priority support"],
    },
  ]

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
          Start now with a package price offer for your business
        </h2>
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((p) => (
            <Card key={p.name} className={p.popular ? "border-primary shadow-lg ring-1 ring-primary" : ""}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{p.name}</CardTitle>
                <div className="text-4xl font-bold py-4">{p.price}</div>
                <div className="text-sm text-muted-foreground">Per Month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{f}</span>
                  </div>
                ))}
                <Button className="w-full mt-6" variant={p.popular ? "default" : "outline"}>
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-background py-12 border-t">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground italic">
            C
          </div>
          <span>StockVault</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 StockVault. All rights reserved.</p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground">Privacy</Link>
          <Link href="#" className="hover:text-foreground">Terms</Link>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <HeroSection />
      <PartnersSection />
      <FeatureSection />
      <ManageSection />
      <PricingSection />
      <Footer />
    </div>
  )
}
