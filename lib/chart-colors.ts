// Helper para obtener colores de charts que funcionen con Recharts
// Recharts no puede interpretar hsl(var(--variable)), necesita valores hexadecimales directos

type ChartColors = {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  grid: string;
  text: string;
  tooltip: {
    bg: string;
    border: string;
    text: string;
  };
};

export const getChartColors = (theme: 'light' | 'dark', appTheme: string): ChartColors => {
  // Tema Default
  if (appTheme === 'default' || !appTheme) {
    return {
      chart1: '#3b82f6', // Azul
      chart2: '#10b981', // Verde
      chart3: '#f59e0b', // Naranja
      chart4: '#8b5cf6', // Púrpura
      chart5: '#ec4899', // Rosa
      grid: theme === 'dark' ? '#3f3f46' : '#e2e8f0',
      text: theme === 'dark' ? '#94a3b8' : '#64748b',
      tooltip: {
        bg: theme === 'dark' ? '#18181b' : '#ffffff',
        border: theme === 'dark' ? '#3f3f46' : '#e2e8f0',
        text: theme === 'dark' ? '#f8fafc' : '#0f172a'
      }
    };
  }

  // Tema Futurista - Colores neón y vibrantes
  if (appTheme === 'futuristic') {
    if (theme === 'dark') {
      return {
        chart1: '#00d9ff', // Cyan neón
        chart2: '#00ff88', // Verde neón
        chart3: '#ffee00', // Amarillo neón
        chart4: '#ff00ff', // Magenta neón
        chart5: '#ff0099', // Rosa neón
        grid: '#0891b2',
        text: '#22d3ee',
        tooltip: {
          bg: '#0f172a',
          border: '#0891b2',
          text: '#67e8f9'
        }
      };
    }
    return {
      chart1: '#0891b2', // Cyan
      chart2: '#06b6d4', // Cyan claro
      chart3: '#0ea5e9', // Azul cielo
      chart4: '#7dd3fc', // Azul muy claro
      chart5: '#38bdf8', // Azul brillante
      grid: '#7dd3fc',
      text: '#0e7490',
      tooltip: {
        bg: '#ffffff',
        border: '#7dd3fc',
        text: '#0c4a6e'
      }
    };
  }

  // Tema Minimalista - Escala de grises con acentos
  if (appTheme === 'minimal') {
    if (theme === 'dark') {
      return {
        chart1: '#fafafa', // Blanco
        chart2: '#d4d4d4', // Gris claro
        chart3: '#a3a3a3', // Gris medio
        chart4: '#737373', // Gris oscuro
        chart5: '#525252', // Gris muy oscuro
        grid: '#404040',
        text: '#a3a3a3',
        tooltip: {
          bg: '#171717',
          border: '#404040',
          text: '#fafafa'
        }
      };
    }
    return {
      chart1: '#171717', // Negro
      chart2: '#404040', // Gris oscuro
      chart3: '#737373', // Gris medio
      chart4: '#a3a3a3', // Gris claro
      chart5: '#d4d4d4', // Gris muy claro
      grid: '#d4d4d4',
      text: '#737373',
      tooltip: {
        bg: '#ffffff',
        border: '#d4d4d4',
        text: '#171717'
      }
    };
  }

  // Tema Retro - Colores vibrantes de los 80s
  if (appTheme === 'retro') {
    if (theme === 'dark') {
      return {
        chart1: '#f39c12', // Amarillo/Naranja
        chart2: '#2ecc71', // Verde
        chart3: '#3498db', // Azul
        chart4: '#9b59b6', // Púrpura
        chart5: '#e74c3c', // Rojo
        grid: '#533483',
        text: '#bab2b5',
        tooltip: {
          bg: '#16213e',
          border: '#533483',
          text: '#eee2dc'
        }
      };
    }
    return {
      chart1: '#ea580c', // Naranja
      chart2: '#16a34a', // Verde
      chart3: '#2563eb', // Azul
      chart4: '#9333ea', // Púrpura
      chart5: '#e11d48', // Rosa
      grid: '#f97316',
      text: '#92400e',
      tooltip: {
        bg: '#fed7aa',
        border: '#f97316',
        text: '#451a03'
      }
    };
  }
  
  // Fallback
  return getChartColors(theme, 'default');
};