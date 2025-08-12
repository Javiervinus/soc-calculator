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
⚠️ **CRÍTICO**: Tramo B usa 88W, NO 105W

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

### Estructura de Estado (Zustand)
```typescript
// Todo el estado está en /lib/store.ts
- profiles[] // Múltiples perfiles
- currentVoltage // Voltaje actual
- consumptionTramos[] // Tramos editables
- socHistory[] // Histórico diario (sin voltaje)
- theme // 'light' | 'dark'
```

### Archivos Clave
```
/lib/
  store.ts                # Estado global (fuente de verdad)
  battery-calculations.ts # Lógica de cálculos
  consumption-constants.ts# Valores por defecto (solo lectura)
  timezone-utils.ts       # Manejo de fechas Ecuador

/components/
  settings-panel.tsx      # Config con máx 5 tabs (mobile-first)
  consumption-editor.tsx  # CRUD de tramos
  night-projection.tsx    # Proyección con auto-update
```

### Decisiones de UX/UI

#### Mobile-First
- Inputs con `font-size: 16px` (previene zoom iOS)
- Máximo 5 tabs en Settings
- Componentes compactos
- Viewport con `maximum-scale: 1`

#### Toasts (Sonner)
- Usa tema del store, NO next-themes
- Mantener blanco/negro elegante
- NO usar colores de fondo
- Descripción: `text-gray-600` (claro) / `text-gray-400` (oscuro)

#### Panel de Configuración
- Backup como panel colapsable (NO como tab)
- Orden tabs: Batería, Consumo, Histórico, Tabla, Perfiles

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