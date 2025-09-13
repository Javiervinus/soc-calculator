'use client';

import { useUserPreferences } from '@/lib/hooks/use-user-preferences';
import { useEffect } from 'react';

export function ThemeColorMeta() {
  const { theme } = useUserPreferences();

  useEffect(() => {
    // Actualizar la meta tag theme-color según el modo
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (metaThemeColor) {
      // En modo light usar blanco, en dark usar un gris oscuro
      const color = theme === 'dark' ? '#0a0a0a' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    } else {
      // Si no existe, crearla
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme === 'dark' ? '#0a0a0a' : '#ffffff';
      document.head.appendChild(meta);
    }

    // También actualizar el tema del manifest dinámicamente si es posible
    // Esto afecta principalmente a la barra de estado en móviles
    const updateStatusBar = () => {
      const isDark = theme === 'dark';

      // Para iOS Safari
      const iosStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (iosStatusBar) {
        iosStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'apple-mobile-web-app-status-bar-style';
        meta.content = isDark ? 'black-translucent' : 'default';
        document.head.appendChild(meta);
      }
    };

    updateStatusBar();
  }, [theme]);

  return null;
}