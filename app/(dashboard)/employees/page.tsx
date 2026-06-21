"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { UserPlus, Users, Clock } from "lucide-react"
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
import { EmployeeFilterBar } from "@/components/employees/EmployeeFilterBar"
import { EmployeeTable } from "@/components/employees/EmployeeTable"
import { PendingInvitationTable } from "@/components/employees/PendingInvitationTable"
import { InviteEmployeeSheet } from "@/components/employees/InviteEmployeeSheet"

type Tab = "active" | "pending"

export default function EmployeesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  const [activeTab, setActiveTab] = useState<Tab>("active")
  const [sheetOpen, setSheetOpen] = useState(false)

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
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [loadingPositions, setLoadingPositions] = useState(true)

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
    let cancelled = false;

    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await getDepartments();
        
        if (!cancelled) {
          setDepartments(data);
        }
      } catch {
        if (!cancelled) {
          setDepartments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingDepartments(false);
        }
      }
    };

    loadDepartments();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch Positions
  useEffect(() => {
    let cancelled = false;

    const loadPositions = async () => {
      setLoadingPositions(true);
      try {
        const data = await getPositions();
        
        if (!cancelled) {
          setPositions(data);
        }
      } catch {
        if (!cancelled) {
          setPositions([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPositions(false);
        }
      }
    };

    loadPositions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch Active Employees
  const fetchActiveEmployees = useCallback(() => {
    setLoadingActive(true);
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await getActiveEmployees({
          search: debouncedSearch || undefined,
          department_id: departmentId || undefined,
          position_id: positionId || undefined,
          page,
        });

        if (!cancelled) {
          const normalized = Array.isArray(res) ? res : res?.data ?? [];
          setActiveEmployees(normalized);
          setActivePagination(res?.pagination ?? null);
        }
      } catch {
        if (!cancelled) {
          setActiveEmployees([]);
          setActivePagination(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingActive(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, departmentId, positionId, page]);

  // Fetch Pending Invitations
  const fetchPendingInvitations = useCallback(() => {
    setLoadingPending(true);
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await getPendingInvitations({
          search: debouncedSearch || undefined,
          department_id: departmentId || undefined,
          position_id: positionId || undefined,
          page,
        });

        if (!cancelled) {
          const normalized = Array.isArray(res) ? res : res?.data ?? [];
          setPendingInvitations(normalized);
          setPendingPagination(res?.pagination ?? null);
        }
      } catch {
        if (!cancelled) {
          setPendingInvitations([]);
          setPendingPagination(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingPending(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, departmentId, positionId, page]);

  useEffect(() => {
    if (activeTab !== "active") return
    const cleanup = fetchActiveEmployees()
    return () => cleanup?.()
  }, [activeTab, fetchActiveEmployees])

  useEffect(() => {
    if (activeTab !== "pending") return
    const cleanup = fetchPendingInvitations()
    return () => cleanup?.()
  }, [activeTab, fetchPendingInvitations])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, departmentId, positionId, activeTab])

  function handleRefresh() {
    if (activeTab === "active") {
      fetchActiveEmployees()
    } else {
      fetchPendingInvitations()
    }
  }

  function handleSheetSuccess() {
    setActiveTab("pending")
  }

  return (
    <div className="pl-8 pr-8 flex-1">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline tracking-tight text-3xl font-bold text-on-surface">
            Karyawan
          </h2>
          <p className="text-on-surface-variant mt-1">
            Kelola data karyawan dan undangan yang masih tertunda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSheetOpen(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-3xl font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
          >
            <UserPlus size={20} />
            Tambah Karyawan
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === "active"
              ? "bg-primary text-white shadow-sm"
              : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-surface-variant/20"
          }`}
        >
          <Users size={16} className="inline mr-1.5" />
          Karyawan Aktif
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === "pending"
              ? "bg-primary text-white shadow-sm"
              : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-surface-variant/20"
          }`}
        >
          <Clock size={16} className="inline mr-1.5" />
          Undangan Tertunda
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <EmployeeFilterBar
          search={search}
          onSearchChange={setSearch}
          departmentId={departmentId}
          onDepartmentChange={setDepartmentId}
          positionId={positionId}
          onPositionChange={setPositionId}
          departments={departments}
          positions={positions}
          loadingDepartments={loadingDepartments}
          loadingPositions={loadingPositions}
        />

        {activeTab === "active" ? (
          <EmployeeTable
            data={activeEmployees}
            loading={loadingActive}
            pagination={activePagination}
            onPageChange={setPage}
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
      />
    </div>
  )
}