"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Users as UsersIcon,
  UserPlus,
  FolderTree,
  Briefcase,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navGroups = [
  {
    label: "Utama",
    items: [
      { name: "Overview", href: "/overview", icon: LayoutDashboard },
      { name: "Data Absensi", href: "/attendance", icon: CalendarDays },
      { name: "Pengajuan Cuti", href: "/leave", icon: UsersIcon },
    ],
  },
  {
    label: "Karyawan",
    items: [
      { name: "Karyawan", href: "/employees", icon: UserPlus },
      { name: "Departemen", href: "/departments", icon: FolderTree },
      { name: "Jabatan", href: "/positions", icon: Briefcase },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="KitaAtur"
            >
              <Link href="/overview">
                <span className="flex items-center gap-2">
                  <span className="text-base font-medium tracking-tight text-sidebar-foreground">
                    KitaAtur
                  </span>
                  <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.name}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
