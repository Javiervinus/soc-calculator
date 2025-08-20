'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Battery, Home, Settings, TrendingUp, X } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SettingsPanel } from '@/components/settings-panel'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'

export function AppSidebar() {
  const pathname = usePathname()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { setOpenMobile } = useSidebar()
  const isMobile = useIsMobile()

  const handleNavigation = () => {
    // Close sidebar on mobile when navigating
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const menuItems = useMemo(() => [
    {
      title: 'Home',
      icon: Home,
      href: '/',
    },
    {
      title: 'Predicción',
      icon: TrendingUp,
      href: '/predictions',
      isNew: true,
    },
  ], [])

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-4 xl:px-2 xl:py-4">
            <div className="w-10 h-10 xl:w-8 xl:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
              <Battery className="h-6 w-6 xl:h-5 xl:w-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h2 className="text-lg xl:text-base font-bold truncate">SOC Calculator</h2>
              <p className="text-sm xl:text-xs text-muted-foreground truncate">LiFePO₄ 12.8V</p>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 xl:hidden h-10 w-10"
                onClick={() => setOpenMobile(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            )}
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} onClick={handleNavigation} className="h-12 xl:h-8 text-base xl:text-sm">
                      <Link href={item.href}>
                        <item.icon className="w-6 h-6 xl:w-4 xl:h-4" />
                        <span>{item.title}</span>
                        {item.isNew && (
                          <span className="ml-auto bg-primary text-primary-foreground text-xs xl:text-[10px] font-bold px-2 py-0.5 rounded-full">
                            NUEVO
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setIsSettingsOpen(true)} className="h-12 xl:h-8 text-base xl:text-sm">
                    <Settings className="w-6 h-6 xl:w-4 xl:h-4" />
                    <span>Ajustes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="px-2 py-4 text-xs text-muted-foreground">
            108 Ah | 1380 Wh
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SettingsPanel isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </>
  )
}