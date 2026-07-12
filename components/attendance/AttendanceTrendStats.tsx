import { TrendingUpIcon, ClockIcon, MapPinOffIcon } from "lucide-react"
import { AttendanceStatCard } from "@/components/attendance/AttendanceStatCard"
import type { AttendanceTrendResponse } from "@/lib/attendance/types"

interface AttendanceTrendStatsProps {
  summary: AttendanceTrendResponse["summary"]
  range: { start: string; end: string }
}

export function AttendanceTrendStats({ summary, range }: AttendanceTrendStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <AttendanceStatCard
        title="Tingkat Kehadiran"
        value={`${summary.hadirRate}%`}
        subtitle={`${range.start} — ${range.end}`}
        icon={TrendingUpIcon}
        variant="default"
      />
      <AttendanceStatCard
        title="Total Terlambat"
        value={summary.totalTelat}
        subtitle={`${range.start} — ${range.end}`}
        icon={ClockIcon}
        variant={summary.totalTelat > 0 ? "destructive" : "default"}
      />
      <AttendanceStatCard
        title="Di Luar Radius"
        value={summary.totalOutOfRange}
        subtitle={`${range.start} — ${range.end}`}
        icon={MapPinOffIcon}
        variant={summary.totalOutOfRange > 0 ? "destructive" : "default"}
      />
    </div>
  )
}
