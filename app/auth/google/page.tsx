"use client"

import { useEffect, useRef } from "react"
import { signIn } from "next-auth/react"
import { LoaderCircle } from "lucide-react"

export default function GooglePopupPage() {
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (hasStartedRef.current) {
      return
    }

    hasStartedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const callbackUrl = params.get("callbackUrl") || "/dashboard"
    const completionUrl = new URL("/auth/popup-complete", window.location.origin)
    completionUrl.searchParams.set("callbackUrl", callbackUrl)

    void signIn("google", {
      callbackUrl: completionUrl.toString(),
    })
  }, [])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Connecting to Google</p>
        <p className="text-sm text-muted-foreground">Finish sign-in in this popup window.</p>
      </div>
    </main>
  )
}
