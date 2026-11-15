import { Outlet } from 'react-router-dom'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'

import { AppTopbar } from './app-topbar'
import { SidebarContent } from './sidebar-content'

export function AppLayout() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const mobileMenuOpen = useUiStore((state) => state.mobileMenuOpen)
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <div className="min-h-svh">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.06] bg-[#0c0c0e]/95 transition-[width] duration-200 md:block',
          collapsed ? 'w-[4.75rem]' : 'w-64',
        )}
      >
        <SidebarContent collapsed={collapsed} onCollapse={toggleSidebar} />
      </aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0" aria-describedby={undefined}>
          <SidebarContent
            collapsed={false}
            showCollapse={false}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className={cn('transition-[padding] duration-200 md:pl-64', collapsed && 'md:pl-[4.75rem]')}>
        <AppTopbar />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
