"use client";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebouncedMutation } from "@/lib/hooks/use-debounced-mutation";
import { useUserPreferences } from "@/lib/hooks/use-user-preferences";
import {
  Battery,
  Home,
  Moon,
  Settings,
  Smartphone,
  Sun,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SettingsPanelNew } from "./settings-panel-new";

export function AppSidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const { theme, updateTheme } = useUserPreferences();
  
  // Estado local para UI inmediata
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(theme as 'light' | 'dark');
  
  // Sincronizar con datos del servidor
  useEffect(() => {
    setLocalTheme(theme as 'light' | 'dark');
  }, [theme]);
  
  // Aplicar cambios al DOM inmediatamente
  useEffect(() => {
    const root = document.documentElement;
    if (localTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [localTheme]);
  
  // Crear versión con debounce
  const debouncedUpdateTheme = useDebouncedMutation(updateTheme, 500);

  const handleNavigation = () => {
    // Close sidebar on mobile when navigating
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const menuItems = useMemo(
    () => [
      {
        title: "Home",
        icon: Home,
        href: "/",
      },
      {
        title: "Predicción",
        icon: TrendingUp,
        href: "/predictions",
        isNew: true,
      },
      {
        title: "PWA",
        icon: Smartphone,
        href: "/pwa",
      },
    ],
    []
  );

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-4 xl:px-2 xl:py-4">
            <div className="w-10 h-10 xl:w-8 xl:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
              <Battery className="h-6 w-6 xl:h-5 xl:w-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h2 className="text-lg xl:text-base font-bold truncate">
                SOC Calculator
              </h2>
              <p className="text-sm xl:text-xs text-muted-foreground truncate">
                LiFePO₄ 12.8V
              </p>
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
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      onClick={handleNavigation}
                      className="h-12 xl:h-8 text-base xl:text-sm"
                    >
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
                  <SidebarMenuButton
                    onClick={() => setIsSettingsOpen(true)}
                    className="h-12 xl:h-8 text-base xl:text-sm"
                  >
                    <Settings className="w-6 h-6 xl:w-4 xl:h-4" />
                    <span>Ajustes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="px-2 py-2 space-y-2">
            {/* Selector de tema claro/oscuro */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tema</span>
              <div className="flex border rounded-md">
                <Button
                  variant={localTheme === "light" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setLocalTheme("light");
                    debouncedUpdateTheme("light");
                  }}
                  className="h-7 px-2 text-xs rounded-r-none"
                >
                  <Sun className="h-3 w-3" />
                </Button>
                <Button
                  variant={localTheme === "dark" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setLocalTheme("dark");
                    debouncedUpdateTheme("dark");
                  }}
                  className="h-7 px-2 text-xs rounded-l-none border-l-0"
                >
                  <Moon className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              108 Ah | 1380 Wh
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* <SettingsPanel isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} /> */}
      <SettingsPanelNew isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </>
  );
}
