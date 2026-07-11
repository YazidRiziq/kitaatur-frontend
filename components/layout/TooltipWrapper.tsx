"use client"

import { TooltipProvider } from "@/components/ui/tooltip"

export function TooltipWrapper({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
}
