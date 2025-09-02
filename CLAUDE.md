# SOC Calculator - LiFePO₄ Battery System

## Contexto del Proyecto
Calculadora de Estado de Carga (SOC) para sistema de batería LiFePO₄ de 12.8V con capacidad de 108 Ah (1380 Wh).
Aplicación web móvil-first para monitoreo en tiempo real del estado de la batería y proyección de consumo nocturno.

## Stack Técnico
- **Framework**: Next.js 15.4.6 con App Router + SSR
- **TypeScript**: Modo estricto
- **Base de datos**: Supabase (PostgreSQL) - ✅ Migración completada
- **Gestor de paquetes**: pnpm (NO usar npm)
- **Estilos**: Tailwind CSS v4
- **UI**: shadcn/ui (Radix UI + Tailwind)
- **Estado**: React Query v5 + Supabase (sin Zustand)
- **Caché**: React Query con persistencia automática en localStorage
- **Gráficos**: Recharts
- **Fechas**: date-fns + date-fns-tz
- **Notificaciones**: Sonner
- **Cloud Storage**: Vercel Blob (backups) + Supabase (datos principales)

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
- **Predicciones solares**: Pronóstico de generación fotovoltaica (día único y semanal)
- **Backup**: Local (clipboard) y cloud (Vercel Blob)
- **Sistema de Temas**: 5 temas únicos + modo claro/oscuro
- **Navegación**: Sidebar con navegación entre páginas

### Arquitectura de Estado (React Query + Supabase)

#### IDs Fijos (temporales hasta autenticación)
```typescript
// /lib/constants/user-constants.ts
CURRENT_USER_ID = 'd51dbd52-d285-415b-b99f-ab399e828dff'
CURRENT_BATTERY_PROFILE_ID = '1e60ecb6-b0e0-48e1-a265-bed99de33ffc'
```

#### Patrón de Hooks (React Query)
```typescript
// Cada dominio tiene su propio hook
- useVoltage() // Voltaje actual
- useBatteryProfile() // Perfil + tabla SOC
- useConsumptionSegments() // Tramos de consumo
- useUserPreferences() // Temas y configuración UI
- useSolarConfig() // Configuración sistema solar
- useDailySoc() // Histórico SOC diario
- useSolarPredictions() // Predicciones solares
```

#### Principios de Separación
- **QueryKey separado** cuando los datos se actualizan con diferente frecuencia
- **Compartir queryFn** cuando los datos siempre se necesitan juntos
- **SSR con HydrationBoundary** para datos iniciales sin loading
- **Persistencia automática** via PersistQueryClientProvider

### Archivos Clave
```
/lib/
  constants/
    user-constants.ts     # IDs del usuario/perfil actual
  supabase/               
    client.ts            # Cliente para lado cliente
    server.ts            # Cliente para Server Components
    database.types.ts    # Tipos generados automáticamente
  hooks/                 # Hooks de React Query
    use-voltage.ts       
    use-battery-profile.ts
    use-consumption-segments.ts
    use-user-preferences.ts
    use-solar-config.ts
    use-daily-soc.ts
    use-solar-predictions.ts
  providers/
    query-provider.tsx   # Provider de React Query con persistencia
  
  battery-calculations.ts # Lógica de cálculos SOC
  consumption-constants.ts# Valores por defecto (solo lectura)
  solar-predictions.ts    # Lógica de predicciones solares
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
  predictions/            # Componentes de predicciones solares
    prediction-result-card.tsx    # Card de resultado individual
    prediction-params.tsx         # Panel de parámetros ajustables
    week-chart.tsx               # Gráfico semanal

/app/
  layout.tsx             # Layout principal con SidebarProvider
  page.tsx               # Página principal (Home)
  predictions/page.tsx   # Página de predicciones solares
  globals.css            # Definición de todos los temas
```

### Decisiones de UX/UI

#### Layout y Navegación
- **Sidebar navegación**: Usa componente shadcn/ui Sidebar nativo
- **Header sticky**: Fijo en la parte superior con botón para abrir sidebar
- **Sidebar móvil**: Ocupa 100% del ancho, con botón X para cerrar
- **Animaciones**: 150ms para transiciones rápidas en móvil
- **Páginas disponibles**: Home (/), Predicciones (/predictions)
- **Selector tema**: Disponible en sidebar footer (claro/oscuro)

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

## Predicciones Solares

### Funcionalidad
- **API**: Open-Meteo para datos meteorológicos gratuitos
- **Modos**: Día específico (hasta 7 días futuros) y vista semanal
- **Métricas**: Ah estimados, Wh, PSH efectivas, directa/difusa, nubosidad
- **Caché**: Sistema inteligente con invalidación por fecha
- **Parámetros ajustables**: Eficiencia, ángulo, orientación, temperatura

### Componentes Clave
- **PredictionResultCard**: Vista compacta (2 cols móvil, 3 cols desktop) y completa
- **PredictionParams**: Panel colapsable con parámetros del sistema
- **WeekChart**: Gráfico de barras para vista semanal con Recharts

### Layout Responsivo
- **Desktop**: 3 columnas (1 control + 2 resultado) para día único
- **Móvil**: Stack vertical, cards compactas 2x2 para semana
- **Navegación**: Botones rápidos para días + calendario picker

### Datos y Cálculos
- **Fórmula base**: `Ah = (PSH × Watts × Eficiencia) / Voltaje`
- **PSH efectivas**: Directa + (Difusa × 0.8) con correcciones de temperatura
- **Calidad de datos**: Indicador cuando datos meteorológicos son parciales
- **Horario**: 06:00-18:00 Ecuador (America/Guayaquil)

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
1. Actualizar este archivo si el cambio afecta arquitectura
2. Optimizar rendimiento: usar useMemo(), constantes pre-calculadas
3. Verificar que componentes no activos retornen null inmediatamente
4. Usar SSR con HydrationBoundary para nuevas páginas
5. Implementar mutaciones optimistas con rollback en errores

## Modelo de Base de Datos - IMPORTANTE

### 🚨 **NO HAY BASE DE DATOS LOCAL**
- **Se usa ÚNICAMENTE la base de datos de producción de Supabase**
- **NO se usa base de datos local ni contenedores Docker**
- Todos los cambios se hacen directamente en producción con extremo cuidado

### 🔄 **Modelo Híbrido de Desarrollo**

#### **1. Cambios Estructurales Grandes → MIGRACIONES**
- Crear nuevas tablas
- Modificar relaciones entre tablas
- Cambios que afectan múltiples tablas
- Reestructuración del schema

**Proceso:**
```bash
# 1. Crear migración
pnpm db:migration:new nombre_descriptivo

# 2. Editar el archivo .sql generado en supabase/migrations/

# 3. Aplicar migración (CUIDADO: es producción)
pnpm db:push

# 4. Regenerar tipos
pnpm db:types
```

#### **2. Cambios Pequeños → DASHBOARD DE SUPABASE**
- Agregar/quitar columnas individuales
- Cambiar tipos de datos simples
- Ajustar constraints básicos
- Cambios menores que no afectan la estructura general

**Proceso:**
```bash
# 1. Hacer cambio en https://supabase.com/dashboard
# 2. Regenerar tipos para el código
pnpm db:types
# 3. Listo para usar en el código
```

### ⚠️ **Reglas Críticas de Seguridad**
1. **SIEMPRE hacer backup** antes de migraciones grandes
2. **NUNCA ejecutar migraciones** sin probar el SQL primero
3. **VERIFICAR dos veces** antes de `pnpm db:push`
4. **Las migraciones son irreversibles** en producción

## Variables de Entorno
```bash
# .env.local - Copia desde .env.example y llena tus valores
NEXT_PUBLIC_SUPABASE_URL="https://aaceknnsrcjhspwpotao.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."  # Requerido para conexión con Supabase
SUPABASE_PROJECT_ID="aaceknnsrcjhspwpotao"  # Para comandos CLI
SUPABASE_DB_PASSWORD="soc-calculator123"    # Para conexiones directas
BLOB_READ_WRITE_TOKEN="vercel_blob_..."     # Para backups Vercel Blob
```

## Comandos - USAR SOLO ESTOS
```bash
# Desarrollo
pnpm dev    # Desarrollo
pnpm build  # Verificar antes de commit
pnpm lint   # Linting

# Base de datos (Supabase) - SOLO ESTOS COMANDOS
pnpm db:push             # ⚠️ PELIGROSO: Ejecutar migraciones en PRODUCCIÓN
pnpm db:types            # ✅ SEGURO: Generar tipos TypeScript
pnpm db:migration:new    # ✅ SEGURO: Crear nueva migración (solo archivo local)
pnpm db:migration:list   # ✅ SEGURO: Ver lista de migraciones
pnpm db:remote:set       # ⚙️ SETUP: Configurar conexión remota (una vez)
pnpm db:reset            # 🚨 EXTREMO: Reset completo (NUNCA usar en producción)

# IMPORTANTE: Si necesitas otros comandos de supabase, agrégalos al package.json
# NO ejecutar comandos supabase directos, usar siempre pnpm [script]
```

## Estado de Migración a Supabase

### ✅ Completado (2025-02-02)
- Proyecto Supabase creado y configurado
- Migración 001: Schema inicial con 10 tablas
- Migración 002: Datos importados desde backup
- Tipos TypeScript generados y sincronizados
- Cliente Supabase configurado (browser y server)
- **MIGRACIÓN COMPLETA a React Query + Supabase**
- Todos los componentes usando hooks de React Query
- SSR implementado con HydrationBoundary
- Persistencia automática en localStorage
- Mutaciones optimistas con rollback
- Sincronización de caché entre queries relacionadas

### 📋 Próximas Funcionalidades
- Sistema de autenticación (reemplazar IDs fijos)
- Features avanzados (análisis, alertas, PWA)
- Dashboard de estadísticas
- Exportación de datos

## Testing Manual Crítico
1. Cambiar hora del sistema para probar proyecciones
2. Verificar cálculos en diferentes zonas del ciclo nocturno
3. Verificar en iPhone (zoom de inputs)
4. Probar SSR: los datos deben aparecer sin flash/loading
5. Verificar persistencia: recargar página mantiene datos
6. Probar actualización optimista: cambios instantáneos con rollback en error