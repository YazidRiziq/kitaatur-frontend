import type { GeoLocation } from "@/lib/settings/types"

export interface DashboardData {
  user: {
    id: string
    name: string
    role: string
    avatar_url: string | null
  }
  company: {
    id: string
    name: string
    timezone: string
    defaultLocation: GeoLocation | null
  }
}