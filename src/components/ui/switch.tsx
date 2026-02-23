"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary/80 data-[state=checked]:text-primary-foreground data-[state=unchecked]:bg-secondary/80 data-[state=unchecked]:text-secondary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-11 w-32 shrink-0 items-center justify-center rounded-2xl border border-white/20 shadow-lg transition-all duration-300 ease-in-out outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 font-medium text-sm backdrop-blur-md bg-white/10 dark:bg-black/20",
        "data-[state=checked]:shadow-[0_0_25px_rgba(0,0,0,0.2),0_0_15px_rgba(255,255,255,0.4),0_0_20px_rgba(0,0,0,0.1)] dark:data-[state=checked]:shadow-[0_0_25px_rgba(255,255,255,0.2),0_0_15px_rgba(255,255,255,0.5),0_0_20px_rgba(255,255,255,0.15)]",
        "data-[state=unchecked]:shadow-[0_0_20px_rgba(0,0,0,0.1),0_0_8px_rgba(255,255,255,0.3),0_0_12px_rgba(0,0,0,0.05)] dark:data-[state=unchecked]:shadow-[0_0_20px_rgba(255,255,255,0.1),0_0_8px_rgba(255,255,255,0.3),0_0_12px_rgba(255,255,255,0.05)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-white/95 dark:bg-gray-800/95 pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 block w-8 h-8 aspect-square rounded-xl shadow-lg transition-transform duration-300 ease-out data-[state=checked]:translate-x-20 data-[state=unchecked]:translate-x-0",
          "shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]",
          "data-[state=checked]:ring-2 data-[state=checked]:ring-primary/60 dark:data-[state=checked]:ring-primary/80 data-[state=checked]:shadow-[0_5px_15px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.5),0_0_12px_rgba(255,255,255,0.3)] dark:data-[state=checked]:shadow-[0_5px_15px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3),0_0_12px_rgba(255,255,255,0.4)]"
        )}
      />
      <span className="relative z-10 flex items-center justify-center w-full">
        <span className="data-[state=checked]:block data-[state=unchecked]:hidden">开启</span>
        <span className="data-[state=checked]:hidden data-[state=unchecked]:block">关闭</span>
      </span>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
