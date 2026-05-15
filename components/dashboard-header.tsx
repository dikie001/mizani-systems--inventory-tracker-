"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { signOut, useSession } from "next-auth/react"
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  LogOut,
  Monitor,
  Moon,
  Search,
  Sun,
  WalletCards,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const routeLabels: Record<string, string> = {
  alerts: "Stock Alerts",
  audit: "Audit Log",
  inventory: "Inventory",
  orders: "Orders",
  reports: "Reports",
  settings: "Settings",
}

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
  }

  return email?.[0]?.toUpperCase() ?? "U"
}

function getBreadcrumbLabel(segment: string) {
  return (
    routeLabels[segment] ??
    segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  )
}

export function DashboardHeader() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [isAvatarReady, setIsAvatarReady] = useState(false)

  const userName = session?.user?.name ?? ""
  const userEmail = session?.user?.email ?? ""
  const userImage = session?.user?.image ?? ""
  const userInitials = getInitials(session?.user?.name, session?.user?.email)

  const breadcrumbSegments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((segment, index) => {
      const href = `/dashboard/${breadcrumbSegmentsFromPath(pathname)
        .slice(0, index + 1)
        .join("/")}`

      return {
        href,
        label: getBreadcrumbLabel(segment),
      }
    })

  useEffect(() => {
    if (status !== "authenticated" || !userName) {
      setIsAvatarReady(false)
      return
    }

    if (!userImage) {
      setIsAvatarReady(true)
      return
    }

    let isMounted = true
    const image = new window.Image()

    image.referrerPolicy = "no-referrer"
    image.src = userImage

    const finalize = () => {
      if (isMounted) {
        setIsAvatarReady(true)
      }
    }

    if (image.complete) {
      finalize()
    } else {
      setIsAvatarReady(false)
      image.onload = finalize
      image.onerror = finalize
    }

    return () => {
      isMounted = false
      image.onload = null
      image.onerror = null
    }
  }, [status, userImage, userName])

  const isProfileReady =
    status === "authenticated" && Boolean(userName) && isAvatarReady

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:px-5">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1 text-sm"
      >
        <Link
          href="/dashboard"
          className="truncate text-muted-foreground transition-colors hover:text-foreground"
        >
          Mizani Systems
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
        <Link
          href="/dashboard"
          className="truncate text-muted-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </Link>
        {breadcrumbSegments.map((item, index) => {
          const isLast = index === breadcrumbSegments.length - 1

          return (
            <div key={item.href} className="flex min-w-0 items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              {isLast ? (
                <span className="truncate font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            className="h-9 w-60 rounded-full border-border/70 bg-muted/35 pl-8 text-sm shadow-none"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!isProfileReady}>
            <Button
              variant="ghost"
              className="h-11 rounded-full border border-border/70 bg-background px-2.5 shadow-sm hover:bg-muted/40 disabled:cursor-wait disabled:opacity-100"
            >
              {isProfileReady ? (
                <>
                  <Avatar className="h-8 w-8">
                    {userImage ? (
                      <AvatarImage
                        src={userImage}
                        alt={userName}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-40 truncate text-sm font-medium md:inline">
                    {userName}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:inline" />
                </>
              ) : (
                <span className="flex w-[7.5rem] items-center justify-center md:w-[10.5rem]">
                  <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-72 rounded-3xl border border-border/70 p-2 shadow-xl"
          >
            <DropdownMenuLabel className="px-2 py-2">
              <div className="flex items-center gap-3 rounded-2xl px-2 py-1">
                <Avatar className="h-11 w-11">
                  {userImage ? (
                    <AvatarImage
                      src={userImage}
                      alt={userName}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {userName}
                  </p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="h-11 rounded-2xl px-3 text-[15px]">
              <Link href="/dashboard">
                <WalletCards className="h-4 w-4" />
                My Workspace
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={theme ?? "system"}
              onValueChange={setTheme}
            >
              <DropdownMenuRadioItem
                value="light"
                className="h-11 rounded-2xl px-3 text-[15px]"
              >
                <Sun className="h-4 w-4" />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="dark"
                className="h-11 rounded-2xl px-3 text-[15px]"
              >
                <Moon className="h-4 w-4" />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="system"
                className="h-11 rounded-2xl px-3 text-[15px]"
              >
                <Monitor className="h-4 w-4" />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="h-11 rounded-2xl px-3 text-[15px]"
              onClick={() => signOut({ callbackUrl: "/auth" })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function breadcrumbSegmentsFromPath(pathname: string) {
  return pathname.split("/").filter(Boolean).slice(1)
}
