import { getDashboardData } from "@/lib/dashboard/actions"
import { DashboardProvider } from "@/lib/dashboard/dashboard-context"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const data = await getDashboardData()

  return (
    <DashboardProvider data={data}>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <Header
          userName={data.user.name}
          userRole={data.user.role}
          userAvatarUrl={data.user.avatar_url ?? undefined}
        />
        <main className="flex-1 ml-64 mt-20">
          {children}
        </main>
      </div>
    </DashboardProvider>
  )
}