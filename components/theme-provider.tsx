'use client';

import { useEffect } from 'react';
import { useBatteryStore } from '@/lib/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useBatteryStore((state) => state.theme);
  const appTheme = useBatteryStore((state) => state.appTheme);

  useEffect(() => {
    // Aplicar o remover la clase 'dark' al elemento html
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // No establecer backgroundColor aquí, se maneja en el script y por tema
  }, [theme]);

  useEffect(() => {
    // Aplicar el tema de la aplicación
    const root = document.documentElement;
    
    // Remover cualquier tema anterior
    root.removeAttribute('data-theme');
    
    // Aplicar el nuevo tema
    if (appTheme && appTheme !== 'default') {
      root.setAttribute('data-theme', appTheme);
    }
  }, [appTheme]);

  return <>{children}</>;
}