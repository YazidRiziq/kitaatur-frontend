"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react"
import { SearchIcon, Plus } from "lucide-react"
import { getDepartments } from "@/lib/departments/actions"
import type { Department } from "@/lib/departments/types"
import { DepartmentTable } from "@/components/departments/DepartmentTable"
import { DepartmentSheet } from "@/components/departments/DepartmentSheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editDepartment, setEditDepartment] = useState<Department | null>(null)
  const [search, setSearch] = useState("")

  const fetchDepartments = useCallback(() => {
    setLoading(true)
    getDepartments()
      .then((data) => {
        const normalized = Array.isArray(data) ? data : data ?? []
        setDepartments(normalized)
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  function handleAdd() {
    setEditDepartment(null)
    setSheetOpen(true)
  }

  function handleEdit(department: Department) {
    setEditDepartment(department)
    setSheetOpen(true)
  }

  function handleSheetSuccess() {
    fetchDepartments()
  }

  const filtered = search
    ? departments.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      )
    : departments

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-medium tracking-[-0.42px] text-foreground">
            Departemen
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola data departemen di perusahaan.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari departemen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAdd} className="ml-auto">
          <Plus data-icon="inline-start" />
          Tambah Departemen
        </Button>
      </div>

      <DepartmentTable
        data={filtered}
        loading={loading}
        onEdit={handleEdit}
        onRefresh={fetchDepartments}
      />

      <DepartmentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleSheetSuccess}
        editDepartment={editDepartment}
      />
    </div>
  )
}
