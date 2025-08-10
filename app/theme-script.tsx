export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const stored = localStorage.getItem('battery-storage');
        if (stored) {
          const data = JSON.parse(stored);
          const state = data?.state || {};
          const theme = state.theme || 'light';
          
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.backgroundColor = '#000000';
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