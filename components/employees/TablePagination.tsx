"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TablePaginationProps {
  pagination: { total: number; page: number; limit: number; totalPages: number }
  onPageChange: (page: number) => void
}

export function TablePagination({
  pagination,
  onPageChange,
}: TablePaginationProps) {
  if (pagination.totalPages <= 1) return null

  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
    .filter((p) => {
      if (pagination.totalPages <= 5) return true
      if (p === 1 || p === pagination.totalPages) return true
      if (Math.abs(p - pagination.page) <= 1) return true
      return false
    })

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Menampilkan {start}-{end} dari {pagination.total} data
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft />
        </Button>
        {pages.map((p, idx, arr) => {
          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
          return (
            <div key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-xs text-muted-foreground">...</span>
              )}
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(p)}
                className={
                  p === pagination.page
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-primary"
                    : undefined
                }
              >
                {p}
              </Button>
            </div>
          )
        })}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
