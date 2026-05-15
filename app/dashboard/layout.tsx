import type { Metadata } from "next"

import { DashboardShell } from "./dashboard-shell"

export const metadata: Metadata = {
  title: "Dashboard | Mizani Systems",
  description:
    "Manage your inventory, track orders, and monitor key metrics from your Mizani Systems dashboard.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
