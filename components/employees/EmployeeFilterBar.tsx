"use client"

import { Search } from "lucide-react"
import type { Department, Position } from "@/lib/employees/types"

interface EmployeeFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  departmentId: string
  onDepartmentChange: (value: string) => void
  positionId: string
  onPositionChange: (value: string) => void
  departments: Department[]
  positions: Position[]
  loadingDepartments: boolean
  loadingPositions: boolean
}

export function EmployeeFilterBar({
  search,
  onSearchChange,
  departmentId,
  onDepartmentChange,
  positionId,
  onPositionChange,
  departments,
  positions,
  loadingDepartments,
  loadingPositions,
}: EmployeeFilterBarProps) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-wrap items-center gap-4 border border-emerald-50/20">
      <div className="flex-1 min-w-50 relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="w-full bg-surface-container-low border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          placeholder="Cari nama atau email..."
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          className="bg-surface-container-low border-none rounded-2xl py-2.5 px-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none disabled:opacity-50"
          value={departmentId}
          onChange={(e) => onDepartmentChange(e.target.value)}
          disabled={loadingDepartments}
        >
          <option value="">Semua Departemen</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          className="bg-surface-container-low border-none rounded-2xl py-2.5 px-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none disabled:opacity-50"
          value={positionId}
          onChange={(e) => onPositionChange(e.target.value)}
          disabled={loadingPositions}
        >
          <option value="">Semua Jabatan</option>
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}