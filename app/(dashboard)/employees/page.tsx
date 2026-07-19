"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { UserPlus } from "lucide-react"
import { getActiveEmployees, getPendingInvitations } from "@/lib/employees/actions"
import type {
  Employee,
  PendingInvitation,
  PaginatedResponse,
} from "@/lib/employees/types"
import type { Department } from "@/lib/departments/types"
import type { Position } from "@/lib/positions/types"
import { getDepartments } from "@/lib/departments/actions"
import { getPositions } from "@/lib/positions/actions"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeFilterBar } from "@/components/employees/EmployeeFilterBar"
import { EmployeeTable } from "@/components/employees/EmployeeTable"
import { PendingInvitationTable } from "@/components/employees/PendingInvitationTable"
import { InviteEmployeeSheet } from "@/components/employees/InviteEmployeeSheet"
import { EmployeeDetailSheet } from "@/components/employees/EmployeeDetailSheet"

type Tab = "active" | "pending"

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("active")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [positionId, setPositionId] = useState("")
  const [page, setPage] = useState(1)

  const [activeEmployees, setActiveEmployees] = useState<Employee[]>([])
  const [activePagination, setActivePagination] = useState<PaginatedResponse<Employee>["pagination"] | null>(null)
  const [loadingActive, setLoadingActive] = useState(true)

  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [pendingPagination, setPendingPagination] = useState<PaginatedResponse<PendingInvitation>["pagination"] | null>(null)
  const [loadingPending, setLoadingPending] = useState(false)

  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])

  // Debounce Search Timer
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce Search Input
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [search])

  // Fetch Departments
  useEffect(() => {
    let cancelled = false

    const loadDepartments = async () => {
      try {
        const data = await getDepartments()

        if (!cancelled) {
          setDepartments(data)
        }
      } catch {
        if (!cancelled) {
          setDepartments([])
        }
      }
    }

    loadDepartments()

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch Positions
  useEffect(() => {
    let cancelled = false

    const loadPositions = async () => {
      try {
        const data = await getPositions()

        if (!cancelled) {
          setPositions(data)
        }
      } catch {
        if (!cancelled) {
          setPositions([])
        }
      }
    }

    loadPositions()

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch Active Employees
  const fetchActiveEmployees = useCallback(() => {
    setLoadingActive(true)
    let cancelled = false

    const fetchData = async () => {
      try {
        const res = await getActiveEmployees({
          search: debouncedSearch || undefined,
          department_id: departmentId || undefined,
          position_id: positionId || undefined,
          page,
        })

        if (!cancelled) {
          const normalized = Array.isArray(res) ? res : res?.data ?? []
          setActiveEmployees(normalized)
          setActivePagination(res?.pagination ?? null)
        }
      } catch {
        if (!cancelled) {
          setActiveEmployees([])
          setActivePagination(null)
        }
      } finally {
        if (!cancelled) {
          setLoadingActive(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, departmentId, positionId, page])

  // Fetch Pending Invitations
  const fetchPendingInvitations = useCallback(() => {
    setLoadingPending(true)
    let cancelled = false

    const fetchData = async () => {
      try {
        const res = await getPendingInvitations({
          search: debouncedSearch || undefined,
          department_id: departmentId || undefined,
          position_id: positionId || undefined,
          page,
        })

        if (!cancelled) {
          const normalized = Array.isArray(res) ? res : res?.data ?? []
          setPendingInvitations(normalized)
          setPendingPagination(res?.pagination ?? null)
        }
      } catch {
        if (!cancelled) {
          setPendingInvitations([])
          setPendingPagination(null)
        }
      } finally {
        if (!cancelled) {
          setLoadingPending(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, departmentId, positionId, page])

  // Fetch data ketika tab aktif berubah atau berada di halaman aktif
  useEffect(() => {
    if (activeTab !== "active") return
    const cleanup = fetchActiveEmployees()
    return () => cleanup?.()
  }, [activeTab, fetchActiveEmployees])

  // Fetch data ketika tab pending aktif atau berada di halaman pending
  useEffect(() => {
    if (activeTab !== "pending") return
    const cleanup = fetchPendingInvitations()
    return () => cleanup?.()
  }, [activeTab, fetchPendingInvitations])

  // Reset halaman ke 1 ketika filter berubah
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, departmentId, positionId, activeTab])

  // Refresh data setelah berhasil mengundang karyawan baru
  function handleRefresh() {
    if (activeTab === "active") {
      fetchActiveEmployees()
    } else {
      fetchPendingInvitations()
    }
  }

  // Setelah berhasil mengundang karyawan baru, langsung tampilkan tab undangan tertunda
  function handleSheetSuccess() {
    setActiveTab("pending")
  }

  // Buka detail karyawan ketika tombol detail diklik
  function handleOpenDetail(employee: Employee) {
    setSelectedEmployee(employee)
    setDetailSheetOpen(true)
  }

  function handleDetailOpenChange(open: boolean) {
    setDetailSheetOpen(open)

    if (!open) {
      setSelectedEmployee(null)
    }
  }

  function handleEmployeeUpdated(employee: Employee) {
    setSelectedEmployee(employee)
    fetchActiveEmployees()
  }

  function handleEmployeeDeactivated() {
    setDetailSheetOpen(false)
    setSelectedEmployee(null)
    fetchActiveEmployees()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[1.75rem] font-medium tracking-[-0.42px] text-foreground">
          Karyawan
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola data karyawan dan undangan yang masih tertunda.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as Tab)}
        className="gap-0"
      >
        <TabsList>
          <TabsTrigger value="active">Karyawan Aktif</TabsTrigger>
          <TabsTrigger value="pending">Undangan Tertunda</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <EmployeeFilterBar
            search={search}
            onSearchChange={setSearch}
            departmentId={departmentId}
            onDepartmentChange={setDepartmentId}
            positionId={positionId}
            onPositionChange={setPositionId}
            departments={departments}
            positions={positions}
          />
          <Button onClick={() => setSheetOpen(true)} className="ml-auto shrink-0">
            <UserPlus data-icon="inline-start" />
            Tambah Karyawan
          </Button>
        </div>

        {activeTab === "active" ? (
          <EmployeeTable
            data={activeEmployees}
            loading={loadingActive}
            pagination={activePagination}
            onPageChange={setPage}
            onDetail={handleOpenDetail}
          />
        ) : (
          <PendingInvitationTable
            data={pendingInvitations}
            loading={loadingPending}
            pagination={pendingPagination}
            onPageChange={setPage}
            onRefresh={handleRefresh}
          />
        )}
      </div>

      <InviteEmployeeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleSheetSuccess}
        departments={departments}
        positions={positions}
      />

      <EmployeeDetailSheet
        open={detailSheetOpen}
        employee={selectedEmployee}
        departments={departments}
        positions={positions}
        onOpenChange={handleDetailOpenChange}
        onUpdated={handleEmployeeUpdated}
        onDeactivated={handleEmployeeDeactivated}
      />
    </div>
  )
}
