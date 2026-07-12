import Link from "next/link"
import { cn } from "@/lib/utils"

interface AttendanceViewTabsProps {
  activeView: "snapshot" | "trend"
  snapshotHref: string
  trendHref: string
}

export function AttendanceViewTabs({
  activeView,
  snapshotHref,
  trendHref,
}: AttendanceViewTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      <Link
        href={snapshotHref}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          activeView === "snapshot"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Hari Ini
      </Link>
      <Link
        href={trendHref}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          activeView === "trend"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Tren
      </Link>
    </div>
  )
}
