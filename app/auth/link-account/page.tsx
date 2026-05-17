"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function LinkAccountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email")
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmLink() {
    if (!email) return
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/link-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Failed to enable account linking")
      }

      setIsSuccess(true)
      
      // Now trigger sign-in again
      setTimeout(() => {
        signIn("google", { callbackUrl: "/dashboard" })
      }, 1500)
      
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  if (!email) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6">
        <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Invalid Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No email address was provided for account linking.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={() => router.push("/auth")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md space-y-4">
        <Card className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {isSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : (
                <AlertCircle className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isSuccess ? "Identity Verified" : "Account Exists"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSuccess 
                ? "Linking your account. One moment..." 
                : `An account with ${email} already exists.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {!isSuccess && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                To keep your account secure, we need you to confirm that you want to link your Google account to your existing profile.
              </p>
            )}
            
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {!isSuccess ? (
              <>
                <Button 
                   className="h-11 w-full rounded-xl font-semibold" 
                   onClick={handleConfirmLink}
                   disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm & Link Google Account"
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full rounded-xl" 
                  onClick={() => router.push("/auth")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <div className="flex w-full items-center justify-center py-2">
                <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LinkAccountContent />
    </Suspense>
  )
}
