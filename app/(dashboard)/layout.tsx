import { getDashboardData } from "@/lib/dashboard/actions"
import { DashboardProvider } from "@/lib/dashboard/dashboard-context"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Header } from "@/components/layout/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const data = await getDashboardData()

  return (
    <DashboardProvider data={data}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header
            userName={data.user.name}
            userRole={data.user.role}
            userAvatarUrl={data.user.avatar_url ?? undefined}
          />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  )
}
