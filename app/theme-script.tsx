export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const stored = localStorage.getItem('battery-storage');
        if (stored) {
          const data = JSON.parse(stored);
          const state = data?.state || {};
          const theme = state.theme || 'light';
          const appTheme = state.appTheme || 'default';
          
          // Aplicar modo oscuro/claro
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          }
          
          // Aplicar tema de la aplicación
          if (appTheme && appTheme !== 'default') {
            document.documentElement.setAttribute('data-theme', appTheme);
          }
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}