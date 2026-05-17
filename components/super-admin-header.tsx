"use client"

import { useEffect, useState } from "react"
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
  Shield,
  Home,
  ChevronDown
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

import { useSearchParams } from "next/navigation"

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

export function SuperAdminHeader() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [isAvatarReady, setIsAvatarReady] = useState(false)

  const userName = session?.user?.name ?? "Super Admin"
  const userEmail = session?.user?.email ?? "omondidickens255@gmail.com"
  const userImage = session?.user?.image ?? ""
  const userInitials = getInitials(session?.user?.name, session?.user?.email)

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

  const getActiveTabLabel = (tab: string) => {
    switch (tab) {
      case "overview": return "Overview"
      case "users": return "Users & Accounts"
      case "workspaces": return "Workspaces Portfolio"
      case "audit": return "Global Activity Trail"
      default: return "Dashboard"
    }
  }

  const isProfileReady = status === "authenticated" && isAvatarReady

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-900 bg-slate-950/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-slate-950/85 md:px-5">
      <SidebarTrigger className="-ml-1 text-slate-400 hover:text-white transition-all duration-200" />
      <Separator orientation="vertical" className="mr-1 h-5 bg-slate-800" />

      {/* Admin Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider">
        <span className="truncate text-slate-500">
          Admin Console
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-700" />
        <span className="truncate text-slate-200">
          {getActiveTabLabel(activeTab)}
        </span>
      </nav>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!isProfileReady}>
            <Button
              variant="ghost"
              className="h-10 rounded-full border border-slate-800 bg-slate-950 px-2.5 hover:bg-slate-900 hover:text-white transition-all"
            >
              {isProfileReady ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 ring-1 ring-slate-800">
                    {userImage ? (
                      <AvatarImage
                        src={userImage}
                        alt={userName}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <AvatarFallback className="bg-rose-500/10 text-[9px] font-bold text-rose-400">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-40 truncate text-xs font-bold text-slate-300 md:inline">
                    {userName}
                  </span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 md:inline" />
                </div>
              ) : (
                <span className="flex w-[7.5rem] items-center justify-center">
                  <LoaderCircle className="h-4 w-4 animate-spin text-slate-500" />
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-72 rounded-3xl border border-slate-900 bg-slate-950 p-2 shadow-2xl text-slate-200"
          >
            <DropdownMenuLabel className="px-2 py-2">
              <div className="flex items-center gap-3 rounded-2xl px-2 py-1">
                <Avatar className="h-11 w-11 ring-2 ring-rose-500/20">
                  {userImage ? (
                    <AvatarImage
                      src={userImage}
                      alt={userName}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <AvatarFallback className="bg-rose-500/10 text-sm font-bold text-rose-400">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold text-slate-100">
                    {userName}
                  </p>
                  <p className="truncate text-[10px] font-semibold text-rose-400 font-mono">
                    {userEmail}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-900" />
            
            <DropdownMenuItem asChild className="h-10 rounded-2xl px-3 text-xs font-semibold text-slate-300 hover:bg-slate-900 focus:bg-slate-900 cursor-pointer">
              <Link href="/dashboard">
                <Home className="h-4 w-4 text-slate-400 mr-2" />
                Return to Dashboard
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-slate-900" />
            
            <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light" className="h-10 rounded-2xl px-3 text-xs font-semibold text-slate-300 hover:bg-slate-900 focus:bg-slate-900 cursor-pointer">
                <Sun className="h-4 w-4 text-slate-400 mr-2" />
                Light Mode
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="h-10 rounded-2xl px-3 text-xs font-semibold text-slate-300 hover:bg-slate-900 focus:bg-slate-900 cursor-pointer">
                <Moon className="h-4 w-4 text-slate-400 mr-2" />
                Dark Mode
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="h-10 rounded-2xl px-3 text-xs font-semibold text-slate-300 hover:bg-slate-900 focus:bg-slate-900 cursor-pointer">
                <Monitor className="h-4 w-4 text-slate-400 mr-2" />
                System Theme
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            
            <DropdownMenuSeparator className="bg-slate-900" />
            
            <DropdownMenuItem
              variant="destructive"
              className="h-10 rounded-2xl px-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/auth" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
