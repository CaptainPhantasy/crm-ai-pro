"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-2 px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-[3px] aria-invalid:ring-red-500/50 aria-invalid:border-red-500 transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-neon-blue-glow300 bg-dark-panel text-neon-blue-glow300 [a&]:hover:bg-dark-tertiary neon-glow-blue",
        secondary:
          "border-neon-green-glow300 bg-dark-panel text-neon-green-glow300 [a&]:hover:bg-dark-tertiary neon-glow-green",
        destructive:
          "border-neon-accent-red bg-dark-panel text-neon-accent-red [a&]:hover:bg-dark-tertiary",
        outline:
          "border-neon-blue-glow700/50 text-white [a&]:hover:bg-dark-tertiary [a&]:hover:border-neon-blue-glow300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
