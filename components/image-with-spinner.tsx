"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface ImageWithSpinnerProps extends Omit<ImageProps, "onLoad" | "onLoadingComplete"> {
  spinnerClassName?: string
}

export function ImageWithSpinner({
  src,
  alt,
  className,
  spinnerClassName,
  width,
  height,
  ...props
}: ImageWithSpinnerProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div 
      className={cn("relative overflow-hidden flex items-center justify-center shrink-0", className)}
      style={{ width: width ? Number(width) : undefined, height: height ? Number(height) : undefined }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 backdrop-blur-[1px] z-10 transition-opacity duration-200">
          <Loader2 className={cn("h-4 w-4 animate-spin text-primary", spinnerClassName)} />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "h-full w-full object-contain transition-all duration-300",
          isLoading ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-none"
        )}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  )
}

interface ImgWithSpinnerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  spinnerClassName?: string
}

export function ImgWithSpinner({
  src,
  alt,
  className,
  spinnerClassName,
  ...props
}: ImgWithSpinnerProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn("relative overflow-hidden flex items-center justify-center shrink-0", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 backdrop-blur-[1px] z-10 transition-opacity duration-200">
          <Loader2 className={cn("h-4 w-4 animate-spin text-primary", spinnerClassName)} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-all duration-300",
          isLoading ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-none"
        )}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  )
}
