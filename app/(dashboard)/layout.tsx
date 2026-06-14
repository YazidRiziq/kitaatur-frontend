import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <Header />
      <main className="flex-1 ml-64 mt-20">
        {children}
      </main>
    </div>
  )
}