"use client"

import { startTransition, useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { signOut, useSession } from "next-auth/react"
import {
  ChevronRight,
  LoaderCircle,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Home,
  ChevronDown,
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
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
  }
  return email?.[0]?.toUpperCase() ?? "A"
}

function getFirstName(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "Admin"
  const firstPart = source.split(/\s+/)[0] ?? "Admin"

  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1).toLowerCase()
}

export function SuperAdminHeader() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [isAvatarReady, setIsAvatarReady] = useState(false)

  const userName = session?.user?.name ?? "Super Admin"
  const userEmail = session?.user?.email ?? ""
  const userImage = session?.user?.image ?? ""
  const userInitials = getInitials(session?.user?.name, session?.user?.email)
  const userDisplayName = getFirstName(
    session?.user?.name,
    session?.user?.email
  )

  useEffect(() => {
    if (status !== "authenticated" || !userName) {
      return
    }

    if (!userImage) {
      startTransition(() => {
        setIsAvatarReady(true)
      })
      return
    }

    let isMounted = true
    const image = new window.Image()

    image.referrerPolicy = "no-referrer"
    image.src = userImage

    const finalize = () => {
      if (isMounted) {
        startTransition(() => {
          setIsAvatarReady(true)
        })
      }
    }

    if (image.complete) {
      finalize()
    } else {
      startTransition(() => {
        setIsAvatarReady(false)
      })
      image.onload = finalize
      image.onerror = finalize
    }

    return () => {
      isMounted = false
      image.onload = null
      image.onerror = null
    }
  }, [status, userImage, userName])

  const getActiveTabLabel = (path: string) => {
    switch (path) {
      case "/super-admin/users":
        return "Users & Accounts"
      case "/super-admin/billing":
        return "Billing Console"
      case "/super-admin/audit":
        return "Global Activity Trail"
      default:
        return "Overview"
    }
  }

  const isProfileReady = status === "authenticated" && isAvatarReady

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/85 md:px-5">
      <SidebarTrigger className="-ml-1 text-muted-foreground transition-all duration-200 hover:text-foreground" />
      <Separator orientation="vertical" className="mr-1 h-5 bg-border/60" />

      {/* Admin Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
      >
        <span className="truncate">Admin Console</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
        <span className="truncate text-foreground">
          {getActiveTabLabel(pathname)}
        </span>
      </nav>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!isProfileReady}>
            <Button
              variant="ghost"
              className="h-7 w-7 rounded-full border-none bg-transparent p-0 shadow-none hover:bg-transparent disabled:cursor-wait disabled:opacity-100 md:h-10 md:w-auto md:border md:border-border/70 md:bg-background md:px-2.5 md:shadow-sm md:hover:bg-muted/40"
            >
              {isProfileReady ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    {userImage ? (
                      <AvatarImage
                        src={userImage}
                        alt={userName}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-40 truncate text-xs font-bold text-foreground md:inline">
                    {userDisplayName}
                  </span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:inline" />
                </div>
              ) : (
                <span className="flex w-30 items-center justify-center">
                  <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-72 rounded-3xl border border-border/70 bg-background p-2 text-foreground shadow-2xl"
          >
            <DropdownMenuLabel className="px-2 py-2">
              <div className="flex items-center gap-3 rounded-2xl px-2 py-1">
                <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                  {userImage ? (
                    <AvatarImage
                      src={userImage}
                      alt={userName}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold text-foreground">
                    {userName}
                  </p>
                  <p className="truncate font-mono text-[10px] font-semibold text-primary">
                    {userEmail}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              asChild
              className="h-10 cursor-pointer rounded-2xl px-3 text-xs font-semibold text-foreground/80 hover:bg-muted focus:bg-muted"
            >
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                Return to Dashboard
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuRadioGroup
              value={theme ?? "system"}
              onValueChange={setTheme}
            >
              <DropdownMenuRadioItem
                value="light"
                className="h-10 cursor-pointer rounded-2xl px-3 text-xs font-semibold text-foreground/80 hover:bg-muted focus:bg-muted"
              >
                <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
                Light Mode
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="dark"
                className="h-10 cursor-pointer rounded-2xl px-3 text-xs font-semibold text-foreground/80 hover:bg-muted focus:bg-muted"
              >
                <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
                Dark Mode
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="system"
                className="h-10 cursor-pointer rounded-2xl px-3 text-xs font-semibold text-foreground/80 hover:bg-muted focus:bg-muted"
              >
                <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                System Theme
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              className="h-10 cursor-pointer rounded-2xl px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/auth" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
