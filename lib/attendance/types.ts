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
