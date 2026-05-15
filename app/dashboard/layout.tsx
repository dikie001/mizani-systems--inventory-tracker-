import type { Metadata } from "next"

import { DashboardShell } from "./dashboard-shell"

export const metadata: Metadata = {
  title: "Dashboard | StockVault",
  description:
    "Manage your inventory, track orders, and monitor key metrics from your StockVault dashboard.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
