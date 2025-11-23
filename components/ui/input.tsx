"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-white placeholder:text-neon-blue-glow100/50 selection:bg-neon-blue-glow300 selection:text-black",
        "bg-dark-panel border-2 border-neon-blue-glow700/50 text-white h-9 w-full min-w-0 rounded-md px-3 py-1 text-base transition-all outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-neon-blue-glow300 focus-visible:ring-neon-blue-glow300/50 focus-visible:ring-[3px] focus-visible:neon-glow-blue",
        "hover:border-neon-blue-glow500",
        "aria-invalid:ring-red-500/50 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
