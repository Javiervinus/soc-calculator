# SOC Calculator - LiFePO₄ Battery System

## Contexto del Proyecto
Calculadora de Estado de Carga (SOC) para sistema de batería LiFePO₄ de 12.8V con capacidad de 108 Ah (1380 Wh).
Aplicación web móvil-first para monitoreo en tiempo real del estado de la batería y proyección de consumo nocturno.

## Stack Técnico
- **Framework**: Next.js 15.4.6 con App Router
- **TypeScript**: Modo estricto
- **Gestor de paquetes**: pnpm (NO usar npm)
- **Estilos**: Tailwind CSS v4
- **UI**: shadcn/ui (Radix UI + Tailwind)
- **Estado**: Zustand con localStorage
- **Gráficos**: Recharts
- **Fechas**: date-fns + date-fns-tz
- **Notificaciones**: Sonner
- **Cloud Storage**: Vercel Blob (backups)

## Datos Críticos del Sistema

### Batería
- 108 Ah / 1380 Wh / 1.38 kWh
- 6 baterías de 18 Ah en paralelo
- Voltaje operativo: 10.0V - 14.6V
- Reserva de seguridad: 0-30% configurable

### Sistema Solar (almacenado en batteryConfig)
- 720W total (12 paneles × 60W)
- Controlador MPPT 30A

### Consumo Nocturno (17:00 - 08:00)
Valores por defecto:
- Tramo A: 17:00-19:00 → 7W (14 Wh)
- Tramo B: 19:00-00:00 → 88W (440 Wh)
- Tramo C: 00:00-06:00 → 17W (102 Wh)
- Tramo D: 06:00-08:00 → 7W (14 Wh)

Lógica del ciclo:
- Si hora >= 17:00: Ciclo comenzó hoy
- Si hora < 08:00: Ciclo comenzó ayer
- El tramo actual se pondera (solo consumo restante)

### Zona Horaria
- **America/Guayaquil (UTC-5)** para todos los cálculos
- Usar funciones de `timezone-utils.ts`
- NO hacer cálculos manuales de offset

## Arquitectura y Decisiones Clave

### Funcionalidades Implementadas
- **Entrada de voltaje**: Manual, slider, y voz (español)
- **Cálculo SOC**: Interpolación lineal con tabla 100+ puntos
- **Gestión consumo**: CRUD de tramos (mín. 1 tramo)
- **Proyección nocturna**: Auto-update cada minuto
- **Histórico SOC**: Un registro por día, sin voltaje
- **Backup**: Local (clipboard) y cloud (Vercel Blob)
- **Sistema de Temas**: 5 temas únicos + modo claro/oscuro
- **Navegación**: Sidebar con navegación entre páginas

### Estructura de Estado (Zustand)
```typescript
// Todo el estado está en /lib/store.ts
- profiles[] // Múltiples perfiles
- currentVoltage // Voltaje actual
- consumptionTramos[] // Tramos editables
- socHistory[] // Histórico diario (sin voltaje)
- theme // 'light' | 'dark' (modo claro/oscuro)
- appTheme // 'default' | 'futuristic' | 'minimal' | 'retro' | 'hippie'
```

### Archivos Clave
```
/lib/
  store.ts                # Estado global (fuente de verdad)
  battery-calculations.ts # Lógica de cálculos
  consumption-constants.ts# Valores por defecto (solo lectura)
  timezone-utils.ts       # Manejo de fechas Ecuador
  chart-colors.ts         # Colores de gráficos por tema
  theme-utils.ts          # Utilidades para temas condicionales

/components/
  app-sidebar.tsx         # Sidebar de navegación principal
  settings-panel.tsx      # Drawer de configuración
  consumption-editor.tsx  # CRUD de tramos
  night-projection.tsx    # Proyección con auto-update
  theme-provider.tsx      # Proveedor de temas
  hippie-optimized.tsx    # Elementos florales hawaianos (solo tema hippie)

/app/
  layout.tsx             # Layout principal con SidebarProvider
  page.tsx               # Página principal (Home)
  predictions/page.tsx   # Página de predicciones (nueva)
  globals.css            # Definición de todos los temas
```

### Decisiones de UX/UI

#### Layout y Navegación
- **Sidebar navegación**: Usa componente shadcn/ui Sidebar nativo
- **Header sticky**: Fijo en la parte superior con botón para abrir sidebar
- **Sidebar móvil**: Ocupa 100% del ancho, con botón X para cerrar
- **Animaciones**: 150ms para transiciones rápidas en móvil
- **Páginas disponibles**: Home (/), Predicciones (/predictions)

#### Mobile-First
- Inputs con `font-size: 16px` (previene zoom iOS)
- Sidebar con ítems más grandes en móvil (altura 48px vs 32px desktop)
- Componentes compactos
- Viewport con `maximum-scale: 1`

#### Sistema de Temas
**5 temas disponibles** (cada uno con modo claro/oscuro):

1. **Default**: Diseño profesional con fuente Geist Sans
   - Colores azules, bordes redondeados suaves
   - Estilo limpio y moderno

2. **Futurista**: Estilo sci-fi con fuente Orbitron
   - Colores cyan/neón, gradientes
   - Bordes afilados, efectos glow
   - Botones en mayúsculas

3. **Minimalista**: Ultra limpio con fuente Inter
   - Solo grises/blancos/negros
   - Sin bordes redondeados ni transiciones
   - Colores neutralizados en componentes

4. **Retro**: Estilo arcade 8-bit con fuente Press Start 2P
   - Fuente pixelada (9-11px móvil, 10-12px desktop)
   - Colores pastel/vintage
   - Sombras duras, bordes gruesos
   - Fondo con patrón diagonal

5. **Hippie**: Estilo hawaiano tropical con fuentes Fredoka/Lilita One
   - Colores vibrantes: naranjas, morados, verdes
   - Text-stroke para títulos (visibilidad)
   - Elementos florales: hibiscos, plumerias, hojas de palma
   - Animaciones orgánicas y suaves (optimizadas para rendimiento)

#### Toasts (Sonner)
- Usa tema del store, NO next-themes
- Mantener blanco/negro elegante
- NO usar colores de fondo
- Descripción: `text-gray-600` (claro) / `text-gray-400` (oscuro)

#### Panel de Configuración
- Se abre desde el botón "Ajustes" en el sidebar
- Drawer que ocupa 100% en móvil
- Backup como panel colapsable (NO como tab)
- Orden tabs: Batería, Consumo, Histórico, Tabla, Perfiles
- Selector de temas en tab Batería > Apariencia

### Sistema de Backup
- **Local**: Copiar/Compartir JSON via clipboard/Web Share API
- **Cloud**: Push/Pull con Vercel Blob
- Push crea nuevo archivo con timestamp (no reemplaza)
- Pull trae el más reciente
- Reload después de 2 segundos (dar tiempo para leer toast)

## Reglas de Desarrollo

### SIEMPRE
1. Usar pnpm, nunca npm
2. Verificar Tramo B = 88W
3. Incluir tramo actual ponderado
4. Usar timezone-utils.ts para fechas
5. Mantener diseño mobile-first
6. Sincronizar consumptionTramos con consumptionProfile
7. Los temas usan `!important` en fuentes para sobrescribir Tailwind

### NUNCA
1. Duplicar lógica de consumo
2. Hacer cálculos manuales de timezone
3. Usar más de 5 tabs en Settings
4. Usar colores de fondo en toasts
5. Modificar consumption-constants.ts (solo lectura)


### Al Modificar
1. Verificar migración automática en getCurrentProfile()
2. Actualizar este archivo si el cambio afecta arquitectura
3. Mantener compatibilidad con datos existentes en localStorage
4. Optimizar rendimiento: usar useMemo(), constantes pre-calculadas
5. Verificar que componentes no activos retornen null inmediatamente

## Variables de Entorno
```bash
# .env.local
BLOB_READ_WRITE_TOKEN="vercel_blob_..."  # Para backups cloud
```

## Comandos
```bash
pnpm dev    # Desarrollo
pnpm build  # Verificar antes de commit
pnpm lint   # Linting
```

## Testing Manual Crítico
1. Cambiar hora del sistema para probar proyecciones
2. Verificar cálculos en diferentes zonas del ciclo nocturno
3. Probar importación con datos antiguos (migración)
4. Verificar en iPhone (zoom de inputs)