"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { DashboardData } from "./types"

const DashboardContext = createContext<DashboardData | null>(null)

export function DashboardProvider({
  data,
  children,
}: {
  data: DashboardData
  children: ReactNode
}) {
  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider")
  }
  return ctx
}