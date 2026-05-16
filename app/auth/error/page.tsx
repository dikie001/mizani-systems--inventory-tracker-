"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, { title: string; message: string }> = {
    Configuration: {
      title: "Configuration Error",
      message: "There is a problem with the server configuration. Please contact support.",
    },
    AccessDenied: {
      title: "Access Denied",
      message: "You do not have permission to sign in. This could be because your account is inactive.",
    },
    Verification: {
      title: "Verification Failed",
      message: "The sign-in link is no longer valid or has already been used.",
    },
    Default: {
      title: "Something went wrong",
      message: "An unexpected error occurred during sign-in. Please try again later.",
    },
  }

  const { title, message } = errorMessages[error || "Default"] || errorMessages.Default

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="h-2 bg-destructive" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            {error && (
              <code className="px-2 py-1 rounded bg-muted text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Error Code: {error}
              </code>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 bg-muted/30 px-8 py-6">
            <Button className="w-full rounded-xl" asChild>
              <Link href="/auth">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Signing In Again
              </Link>
            </Button>
            <Button variant="ghost" className="w-full rounded-xl" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
