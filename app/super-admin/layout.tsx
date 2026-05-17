import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Home, LogOut } from "lucide-react"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "Super Admin Control Center | StockVault",
  description:
    "Restricted administrative dashboard for managing registered users, multi-tenant workspaces, system performance, and complete audit trail logs.",
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth")
  }

  // Double check email matching super admin env variable
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "omondidickens255@gmail.com"
  
  if (session.user.email.toLowerCase() !== superAdminEmail.toLowerCase()) {
    redirect("/dashboard")
  }

  // Get user details for UI avatar
  const userDetails = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, image: true }
  })

  const adminName = userDetails?.name || session.user.name || "Super Admin"
  const adminAvatar = userDetails?.image || session.user.image || ""

  return (
    <div className={`${outfit.variable} font-sans min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}>
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />

      {/* Glassmorphic Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 animate-pulse">
            <Shield className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                StockVault
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]">
                Control Center
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">
              Super Admin Terminal
            </p>
          </div>
        </div>

        {/* Global Controls & Profile */}
        <div className="flex items-center gap-4">
          <Link
            id="btn-return-app"
            href="/dashboard"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition duration-200"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return to App</span>
          </Link>

          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Admin Profiler */}
          <div className="flex items-center gap-2.5">
            {adminAvatar ? (
              <img
                src={adminAvatar}
                alt={adminName}
                className="h-8.5 w-8.5 rounded-full ring-2 ring-indigo-500/30 object-cover"
              />
            ) : (
              <div className="h-8.5 w-8.5 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center ring-2 ring-indigo-500/30">
                SA
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-200">{adminName}</p>
              <p className="text-[9px] font-medium text-indigo-400 tracking-wider">
                OMONDIDICKENS255@GMAIL.COM
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Central Console Container */}
      <main className="flex-1 max-w-7.5xl w-full mx-auto p-4 md:p-8 relative z-10 flex flex-col">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>© 2026 StockVault Inc. Secure Operations Console.</span>
        <span className="flex items-center gap-1">
          Authorized Admin Personnel Only. Connection Scoped & Encrypted.
        </span>
      </footer>
    </div>
  )
}
