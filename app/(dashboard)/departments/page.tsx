"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { getDepartments } from "@/lib/departments/actions"
import type { Department } from "@/lib/departments/types"
import { DepartmentTable } from "@/components/departments/DepartmentTable"
import { DepartmentSheet } from "@/components/departments/DepartmentSheet"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editDepartment, setEditDepartment] = useState<Department | null>(null)

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

  return (
    <div className="pl-8 pr-8 flex-1">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline tracking-tight text-3xl font-bold text-on-surface">
            Departemen
          </h2>
          <p className="text-on-surface-variant mt-1">
            Kelola data departemen di perusahaan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="bg-primary text-white px-6 py-2.5 rounded-3xl font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus size={20} />
            Tambah Departemen
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <DepartmentTable
          data={departments}
          loading={loading}
          onEdit={handleEdit}
          onRefresh={fetchDepartments}
        />
      </div>

      <DepartmentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleSheetSuccess}
        editDepartment={editDepartment}
      />
    </div>
  )
}