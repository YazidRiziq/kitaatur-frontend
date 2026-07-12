export type LocationStatus = "in_radius" | "out_of_range" | "no_location"

export interface AttendanceRecord {
  id: string
  employee: {
    name: string
    position: string
    avatarUrl: string | null
  }
  checkIn: string
  checkOut: string | null
  status: "Tepat Waktu" | "Terlambat"
  locationStatus: LocationStatus
  locationLabel?: string
}

export interface AttendanceStats {
  hadir: number
  total: number
  terlambat: number
  belumCheckOut: number
}

export interface AttendanceFilters {
  date: string
  search?: string
  department_id?: string
  page?: number
}

export interface AttendancePagination {
  page: number
  totalPages: number
  total: number
  perPage: number
}

export interface AttendancePaginatedResponse {
  data: AttendanceRecord[]
  pagination: AttendancePagination
}

export interface ExportInfo {
  url: string
  token: string
}

export type DailyStatus = "tepat_waktu" | "terlambat" | "di_luar_radius" | "tidak_hadir" | null

export interface AttendanceEmployeeTrend {
  employeeId: string
  name: string
  position: string
  avatarUrl: string | null
  hadirCount: number
  totalDays: number
  hadirRate: number
  telatCount: number
  outOfRangeCount: number
  dailyStatus: Array<{
    date: string
    status: DailyStatus
    checkIn: string | null
    checkOut: string | null
  }>
}

export interface AttendanceTrendFilters {
  start: string
  end: string
  department_id?: string
}

export interface AttendanceTrendResponse {
  range: { start: string; end: string }
  summary: {
    hadirRate: number
    totalTelat: number
    totalOutOfRange: number
  }
  employees: AttendanceEmployeeTrend[]
}
