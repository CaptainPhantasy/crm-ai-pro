"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-neon-blue-glow300 text-white hover:bg-neon-blue-glow500 neon-glow-blue focus-visible:ring-neon-blue-glow300/50 border-2 border-neon-blue-glow300",
        destructive:
          "bg-neon-accent-red text-white hover:bg-red-600 focus-visible:ring-red-500/50 border-2 border-neon-accent-red",
        outline:
          "border-2 border-neon-blue-glow300 bg-dark-panel text-neon-blue-glow300 hover:bg-dark-tertiary hover:neon-glow-blue focus-visible:ring-neon-blue-glow300/50",
        secondary:
          "bg-neon-green-glow300 text-black hover:bg-neon-green-glow500 neon-glow-green focus-visible:ring-neon-green-glow300/50 border-2 border-neon-green-glow300",
        ghost:
          "hover:bg-dark-tertiary hover:text-neon-blue-glow300 text-white border-2 border-transparent hover:border-neon-blue-glow300/50",
        link: "text-neon-blue-glow300 underline-offset-4 hover:underline hover:text-neon-blue-glow100",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
