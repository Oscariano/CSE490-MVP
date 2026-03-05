import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="min-h-screen bg-background">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
