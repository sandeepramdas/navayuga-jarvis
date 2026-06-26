'use client'

import { useApp } from '@/lib/store'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { JarvisSidePanel } from '@/components/layout/JarvisSidePanel'
import { ToastContainer } from '@/components/ui/Toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarOpen } = useApp()

  return (
    <div className="min-h-screen bg-necl-bg">
      <Sidebar />
      <TopBar />

      <main
        className="transition-all pt-16 min-h-screen"
        style={{ marginLeft: sidebarOpen ? '220px' : '64px' }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

      <JarvisSidePanel />
      <ToastContainer />
    </div>
  )
}
