"use client"

import Form from "next/form"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { Department } from "@/lib/departments/types"

interface AttendanceFiltersProps {
  departments: Department[]
  currentSearch: string
  currentDepartment: string
  currentDate: string
}

export function AttendanceFilters({
  departments,
  currentSearch,
  currentDepartment,
  currentDate,
}: AttendanceFiltersProps) {
  return (
    <Form action="/attendance" className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="view" value="snapshot" />

      <div className="relative flex-1 min-w-48">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={currentSearch}
          placeholder="Cari karyawan..."
          className="pl-9"
        />
      </div>

      <NativeSelect
        name="department"
        defaultValue={currentDepartment}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-auto"
      >
        <NativeSelectOption value="">Semua Departemen</NativeSelectOption>
        {departments.map((dept) => (
          <NativeSelectOption key={dept.id} value={dept.id}>
            {dept.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <Input
        type="date"
        name="date"
        defaultValue={currentDate}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-auto"
      />
    </Form>
  )
}
