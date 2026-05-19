import Link from "next/link"
import { ArrowLeft, ShieldAlert, Eye, Lock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy — Mizani Systems",
  description: "Privacy practices, data handling, and compliance policies for Mizani Systems clients.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/15">
      {/* Brand Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 bg-primary/5 text-primary">
              M
            </span>
            <span>Mizani Systems</span>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        {/* Title */}
        <div className="mb-10 text-center sm:text-left">
          <Badge className="mb-3 uppercase tracking-wider text-[10px]" variant="secondary">
            Data Governance
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last Updated: May 18, 2026 • Version 1.1
          </p>
        </div>

        {/* Legal Notice */}
        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
          <p className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
            <span>
              Your privacy is of paramount importance to Mizani Systems. This policy explains what information we gather inside our multi-tenant software context, how we use it, and your rights concerning your workspace and data logs.
            </span>
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">1.</span> Information We Collect
            </h2>
            <p>
              We collect information in three ways to ensure smooth inventory operations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Account Credentials & Profile:</strong> If you use Google OAuth or sign up directly, we collect your name, email address, profile avatar, and team membership designations.
              </li>
              <li>
                <strong>Inventory Catalog Data:</strong> We store all products, SKUs, category distributions, unit costs, pricing figures, stock updates, low stock warnings, and transaction receipts associated with your workspace.
              </li>
              <li>
                <strong>Security Logs & IP Tracking:</strong> As detailed in our audit timelines, we record active IP addresses, timestamps, client device agents, and associated username initials for every system action.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">2.</span> How We Process Payments (Paystack)
            </h2>
            <p>
              When subscribing to paid plans, payments are handled securely through our gateway provider, <strong>Paystack</strong>. Mizani Systems never stores full credit/debit card numbers on its systems.
            </p>
            <p>
              Paystack handles transaction authorization, processing, and card tokens. Mizani Systems only retains the transaction reference, billing address, plan context, currency selected (e.g., KES or USD), and basic invoice logs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">3.</span> Multi-Tenant Security & Isolation
            </h2>
            <p>
              Our database implements robust isolation layers. All data is scoped specifically to dynamic `workspaceId` variables. We utilize SWR client-side caches, React states, and server middlewares to strictly restrict access to authorized teammates of the tenant workspace. No workspace can inspect, query, or mutate elements of another workspace.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">4.</span> Audit Timeline Retention
            </h2>
            <p>
              Audit timeline entries are permanent and non-modifiable for tenant-level compliance. If a team member departs a workspace, their legacy audit tracking rows (detailing transactions or items created) remain intact to maintain accurate historical logs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">5.</span> Your Rights & Choice
            </h2>
            <p>
              You have the right to inspect your workspace data, export Excel or PDF spreadsheets of your inventory stock records, update your team permissions, or request deletion of your entire user profile. Deleting a profile will wipe your credentials from the authentication table but leaves critical historical stock records intact under your workspace context unless the entire workspace is closed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">6.</span> Policy Updates
            </h2>
            <p>
              We reserve the right to revise this Privacy Policy at any time. Changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; timestamp. For any questions regarding workspace privacy boundaries, data processing, or GDPR/compliance settings, please email <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground font-mono">privacy@mizani.systems</code>.
            </p>
          </section>
        </div>

        {/* Footer Link */}
        <div className="mt-12 border-t border-border/40 pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Mizani Systems, Inc. All rights reserved.</p>
        </div>
      </main>
    </div>
  )
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode; className?: string; variant?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === "secondary" ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"} ${className}`}>
      {children}
    </span>
  )
}
