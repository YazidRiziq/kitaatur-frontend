"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { SidebarItem } from "@/components/layout/SidebarItem"
import {
  Users,
  UserPlus,
  CalendarDays,
  LayoutDashboard,
  FolderTree,
  Briefcase,
  MessageCircleQuestionMark,
  LogOut,
  Settings,
} from "lucide-react"
import { signOutAction } from "@/lib/auth/actions"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "Karyawan", href: "/employees", icon: UserPlus },
    { name: "Data Absensi", href: "/attendance", icon: CalendarDays },
    { name: "Pengajuan Cuti", href: "/leave", icon: Users },
    { name: "Departemen", href: "/departments", icon: FolderTree },
    { name: "Jabatan", href: "/positions", icon: Briefcase },
    { name: "Pengaturan", href: "/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 border-r-0 fixed left-0 top-0 bg-white dark:bg-slate-900 shadow-[12px_0_40px_rgba(0,105,72,0.06)] flex flex-col h-full py-6 px-4 z-50">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
          <Image
            src="/hris_logo.jpg"
            alt="KitaAtur Logo"
            width={60}
            height={60}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-headline tracking-tight">
            KitaAtur
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            HRIS Dashboard
          </p>
        </div>
      </div>

      <nav className="space-y-2 grow">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            variant={
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "active"
                : "default"
            }
          />
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <SidebarItem
          href="/support"
          icon={MessageCircleQuestionMark}
          label="Support"
        />
        <SidebarItem
          icon={LogOut}
          label="Sign Out"
          variant="danger"
          onClick={async () => { await signOutAction() }}
        />
      </div>
    </aside>
  )
}
