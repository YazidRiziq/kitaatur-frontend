"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import type { Employee } from "@/lib/employees/types";

interface EmployeeDetailSheetProps {
  open: boolean;
  employee: Employee | null;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ReadonlyField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
        {label}
      </label>
      <div className="min-h-11 w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface">
        {value || "-"}
      </div>
    </div>
  );
}

export function EmployeeDetailSheet({
  open,
  employee,
  onOpenChange,
}: EmployeeDetailSheetProps) {
  const initial = employee?.name?.charAt(0).toUpperCase() || "?";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-surface-variant/20 bg-popover text-popover-foreground shadow-2xl outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="flex items-start justify-between gap-4 border-b border-surface-variant/20 p-6">
            <div>
              <DialogPrimitive.Title className="font-headline text-xl font-bold text-on-surface">
                Detail Karyawan
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-on-surface-variant">
                Informasi karyawan aktif yang sudah bergabung.
              </DialogPrimitive.Description>
            </div>

            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface"
                aria-label="Tutup detail karyawan"
              >
                <X size={18} />
              </button>
            </DialogPrimitive.Close>
          </div>

          {!employee ? (
            <div className="flex min-h-64 items-center justify-center p-6">
              <p className="text-sm text-on-surface-variant">
                Data karyawan tidak tersedia.
              </p>
            </div>
          ) : (
            <div className="max-h-[75vh] overflow-y-auto p-6">
              <div className="mb-5 overflow-hidden rounded-3xl border border-surface-variant/20 bg-surface-container-lowest">
                <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

                <div className="-mt-8 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-3xl border-4 border-popover bg-primary/10 shadow-sm">
                      {employee.avatar_url ? (
                        <Image
                          src={employee.avatar_url}
                          alt={employee.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                          {initial}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 pb-1">
                      <h3 className="truncate text-xl font-bold text-on-surface">
                        {employee.name}
                      </h3>
                      <p className="truncate text-sm text-on-surface-variant">
                        {employee.email}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    Karyawan Aktif
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-surface-variant/20 bg-surface-container-lowest p-5">
                <div className="mb-5">
                  <h4 className="font-headline text-base font-bold text-on-surface">
                    Informasi Karyawan
                  </h4>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Data berikut bersifat read-only untuk sementara.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ReadonlyField label="Nama Lengkap" value={employee.name} />

                  <ReadonlyField label="Email" value={employee.email} />

                  <ReadonlyField
                    label="Nomor Telepon"
                    value={employee.phone || "-"}
                  />

                  <ReadonlyField
                    label="Nomor Induk Karyawan"
                    value={employee.employee_number || "-"}
                  />

                  <ReadonlyField
                    label="Departemen"
                    value={employee.department?.name || "-"}
                  />

                  <ReadonlyField
                    label="Jabatan"
                    value={employee.position?.title || "-"}
                  />

                  <ReadonlyField
                    label="Tanggal Bergabung"
                    value={formatDate(employee.joined_at)}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
