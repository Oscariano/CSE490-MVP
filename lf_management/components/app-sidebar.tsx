"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Package,
  LayoutDashboard,
  ClipboardList,
  Building,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar()
  const isOpen = state === "expanded"
  const { signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border py-4">
        {isOpen ? (
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-lg">Lost & Found</span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
              aria-label="Expand sidebar"
              title="Lost & Found"
            >
              <Package className="h-5 w-5" />
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="flex flex-col">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center pt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              tooltip={!isOpen ? "Dashboard" : undefined}
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              tooltip={!isOpen ? "Claims" : undefined}
            >
              <Link href="/dashboard/claims">
                <ClipboardList className="h-5 w-5" />
                <span>Claims</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              tooltip={!isOpen ? "Organization" : undefined}
            >
              <Link href="/dashboard/organization">
                <Building className="h-5 w-5" />
                <span>Organization</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              tooltip={!isOpen ? "Settings" : undefined}
            >
              <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border mt-auto">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              tooltip={!isOpen ? "Sign Out" : undefined}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
