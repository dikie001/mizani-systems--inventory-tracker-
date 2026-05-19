import Link from "next/link"
import { ArrowLeft, BookOpen, ShieldCheck, Scale, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms & Conditions — Mizani Systems",
  description: "Terms of service and usage policy for Mizani Systems inventory management platforms.",
}

export default function TermsPage() {
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
            Legal Agreement
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last Updated: May 18, 2026 • Version 1.1
          </p>
        </div>

        {/* Legal Notice */}
        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
          <p className="flex items-start gap-2.5">
            <Scale className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
            <span>
              Please read these Terms & Conditions carefully before using the inventory tracking systems, APIs, or databases provided by <strong>Mizani Systems</strong>. By creating a workspace or signing in, you agree to be bound by this agreement.
            </span>
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">1.</span> Account & Multi-Tenant Workspace Rules
            </h2>
            <p>
              To access Mizani Systems, you must register an account using a valid email address or sign in via Google OAuth. You are entirely responsible for maintaining the confidentiality of your login credentials and for all activities that occur within your multi-tenant workspace.
            </p>
            <p>
              Workspaces are strictly isolated. You agree not to attempt to bypass workspace bounds, execute SQL injection, intercept SWR caching mechanisms, or query API endpoints belonging to other tenants.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">2.</span> Paystack Subscriptions & Billing
            </h2>
            <p>
              Mizani Systems provides subscription-based software-as-a-service (SaaS) plans billed in Kenya Shillings (KES) or US Dollars (USD). Billing operations are fully integrated with <strong>Paystack</strong>, a secure third-party payment gateway.
            </p>
            <p>
              By selecting a paid plan, you authorize Mizani Systems to charge your designated credit/debit card automatically at the start of each renewal term. If a Paystack charge fails, we reserve the right to suspend or downgrade your workspace context after giving written notification. All sales are final and non-refundable unless required by applicable consumer law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">3.</span> Active Enterprise Audit Logging
            </h2>
            <p>
              For system integrity, security compliance, and data governance, Mizani Systems records action sequences inside immutable **Audit Logs**. 
            </p>
            <p>
              Every database mutation (including product updates, restock orders, membership invites, and billing renewals) records: the user’s full name, action context, initials, timestamp, and active IP address. By using our multi-tenant dashboard, you acknowledge and agree that these audit entries are saved for internal workspace security and compliance tracking.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">4.</span> Acceptable Use Policy
            </h2>
            <p>
              You agree not to use the Services to track illegal substances, engage in fraudulent resale schemes, transmit malware, or launch denial-of-service (DoS) attacks on our hosting architecture. Any violation of these terms will result in immediate termination of all associated workspaces.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">5.</span> Disclaimer of Warranties & Liability
            </h2>
            <p>
              Mizani Systems is provided &ldquo;as is&rdquo; without warranties of any kind. While we guarantee high database uptime and robust server security, we are not liable for business interruptions, lost warehouse stock values, or order synchronization failures resulting from external API outages.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">6.</span> Governing Law & Contact Info
            </h2>
            <p>
              These Terms & Conditions are governed by the laws of the jurisdiction of Mizani Systems&apos; incorporation. If you have any inquiries regarding workspace parameters, billing cycles, or compliance, please reach out to our team at <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground font-mono">support@mizani.systems</code>.
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
