export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        // Leer del caché de React Query (PersistQueryClientProvider)
        const queryCache = localStorage.getItem('soc-calculator-cache');
        if (queryCache) {
          const cacheData = JSON.parse(queryCache);
          
          // Buscar las preferencias de usuario en el caché
          const queries = cacheData?.clientState?.queries || [];
          const userPrefsQuery = queries.find(q => 
            q.queryKey && 
            q.queryKey[0] === 'user-preferences'
          );
          
          if (userPrefsQuery?.state?.data) {
            const preferences = userPrefsQuery.state.data;
            const theme = preferences.theme || 'light';
            const appTheme = preferences.app_theme || 'default';
            
            // Aplicar modo oscuro/claro
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
            
            // Aplicar tema de la aplicación
            if (appTheme && appTheme !== 'default') {
              document.documentElement.setAttribute('data-theme', appTheme);
            }
          }
        }
      } catch (e) {
        // En caso de error, usar defaults
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}