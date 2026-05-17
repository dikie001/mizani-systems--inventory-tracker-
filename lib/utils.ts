import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency: string = "KES") {
  const formattedAmount = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  if (currency === "USD") return `$${formattedAmount}`
  if (currency === "EUR") return `€${formattedAmount}`
  if (currency === "GBP") return `£${formattedAmount}`
  return `${currency} ${formattedAmount}`
}
