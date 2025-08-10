'use client';

import { useEffect } from 'react';
import { useBatteryStore } from '@/lib/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useBatteryStore((state) => state.theme);

  useEffect(() => {
    // Aplicar o remover la clase 'dark' al elemento html
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#000000';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '';
    }
  }, [theme]);

  return <>{children}</>;
}