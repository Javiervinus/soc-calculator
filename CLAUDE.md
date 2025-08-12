# SOC Calculator - LiFePO₄ Battery System

## Contexto del Proyecto
Calculadora de Estado de Carga (SOC) para sistema de batería LiFePO₄ de 12.8V con capacidad de 108 Ah (1380 Wh).
Aplicación web móvil-first para monitoreo en tiempo real del estado de la batería y proyección de consumo nocturno.

## Especificaciones Técnicas

### Sistema de Batería
- **Química**: LiFePO₄ (Litio Ferrofosfato)
- **Voltaje nominal**: 12.8V
- **Capacidad total**: 108 Ah / 1380 Wh / 1.38 kWh
- **Configuración**: 6 baterías de 12.8V / 18 Ah en paralelo
- **Rango de voltaje operativo**: 10.0V - 14.6V
- **Reserva de seguridad configurable**: 0-30% (por defecto 0%)

### Sistema Solar
- **Potencia total instalada**: 720 W
- **Configuración**: 12 paneles × 60 W en paralelo
- **Tipo de panel**: Monocristalino
- **Voltaje nominal por panel**: 18 V
- **Corriente nominal por panel**: 3.2 A

### Controlador de Carga
- **Tipo**: MPPT (Maximum Power Point Tracking)
- **Capacidad**: 30 A
- **Modelo**: Por definir (configurable en el sistema)

### Consumo Nocturno (17:00 - 08:00)
El sistema proyecta el consumo durante el período nocturno con tramos **editables** almacenados en el store:

#### Tramos por Defecto
- **Tramo A**: 17:00-19:00 → 7W (2h = 14 Wh = 1.1 Ah)
- **Tramo B**: 19:00-00:00 → 88W (5h = 440 Wh = 34.4 Ah) ⚠️ IMPORTANTE: Son 88W, NO 105W
- **Tramo C**: 00:00-06:00 → 17W (6h = 102 Wh = 8.0 Ah)
- **Tramo D**: 06:00-08:00 → 7W (2h = 14 Wh = 1.1 Ah)
- **Total ciclo nocturno por defecto**: 570 Wh (44.5 Ah)

#### Sistema de Gestión de Tramos
- **Editable**: Los usuarios pueden modificar consumo (watts) y horarios de cada tramo
- **CRUD completo**: Agregar, editar y eliminar tramos (mínimo 1 tramo requerido)
- **Persistencia**: Los tramos modificados se guardan en el perfil actual (localStorage)
- **Cálculo automático**: Wh y Ah se recalculan al modificar watts o duración
- **Sincronización**: Los cambios en tramos actualizan automáticamente las proyecciones

### Zona Horaria
- **Ubicación**: Guayaquil, Ecuador
- **Zona horaria**: America/Guayaquil (UTC-5)
- Todos los cálculos deben usar esta zona horaria

## Funcionalidades Principales

### 1. Entrada de Voltaje
- **Input de texto manual**: Campo numérico con validación
- **Slider visual**: Rango 10V - 15V con precisión 0.01V
- **Entrada por voz**: 
  - Botón de micrófono para activar reconocimiento
  - Configurado para español (ES-ES/ES-LATAM)
  - Procesa frases como "doce punto ocho voltios"
  - Convierte automáticamente formatos (ej: "128" → "12.8")
- **Validación en tiempo real**: Solo acepta valores entre 10.0V y 15.0V

### 2. Cálculo de SOC
- **Interpolación lineal** basada en tabla voltaje-SOC
- **Tabla con 100+ puntos de datos** importable/exportable
- **Indicador de confianza**:
  - Alta: Valor dentro del rango de la tabla
  - Media: Valor en los límites
  - Baja: Valor fuera de rango (extrapolación)

### 3. Gestión de Consumo
- **Editor de tramos**: Interfaz CRUD en el panel de configuración (pestaña "Consumo")
- **Validaciones**:
  - Mínimo 1 tramo activo
  - Horas válidas (0-24)
  - Hora fin diferente a hora inicio
- **Migración automática**: Perfiles antiguos reciben tramos por defecto automáticamente
- **Totales dinámicos**: Suma automática de Wh y Ah de todos los tramos activos

### 4. Proyección Nocturna
- **Cálculo dinámico** de energía requerida hasta las 08:00
- **Ponderación del tramo actual**: 
  - Calcula solo el consumo restante del período activo
  - No excluye el período actual del cálculo
- **Indicadores visuales**:
  - ✓ Alcanza: Batería suficiente hasta las 08:00
  - ✗ No alcanza: Muestra hora estimada de agotamiento
- **Estados de períodos**:
  - Completado (✓): Ya pasó, no cuenta para consumo
  - Actual (►): En progreso con barra de porcentaje
  - Pendiente (○): Futuro, cuenta completo
- **Actualización automática**: Recalcula cada minuto

### 5. Visualización
- **Display principal**: 
  - SOC% grande y visible
  - Energía disponible en Wh y Ah
  - Indicador de confianza del cálculo
- **Proyección nocturna**:
  - Estado general (alcanza/no alcanza)
  - Margen en Wh y Ah
  - Desglose por tramos con progreso
- **Gráficos**:
  - Curva voltaje vs SOC
  - Consumo por períodos
- **Diseño mobile-first**:
  - Interfaz compacta y responsive
  - Texto optimizado para pantallas pequeñas
  - Controles táctiles amigables

## Arquitectura Técnica

### Stack
- **Framework**: Next.js 15.4.6 con App Router
- **Lenguaje**: TypeScript con modo estricto
- **Gestor de paquetes**: pnpm (preferido sobre npm)
- **Estilos**: Tailwind CSS v4 con variables CSS
- **Componentes UI**: shadcn/ui (Radix UI + Tailwind)
- **Estado**: Zustand con persistencia en localStorage
- **Gráficos**: Recharts
- **Fechas**: date-fns con soporte timezone
- **Notificaciones**: Sonner (toast notifications)

### Estructura de Archivos Clave
```
/lib/
  battery-calculations.ts  # Lógica principal de cálculos (refactorizada)
  consumption-constants.ts # Datos de consumo por defecto (solo lectura)
  battery-data.ts         # Tipos y datos de la batería (incluye ConsumptionTramo)
  store.ts               # Estado global con Zustand (incluye gestión de tramos)
  timezone-utils.ts      # Utilidades de zona horaria

/components/
  voltage-input.tsx       # Input con voz, texto y slider
  soc-display.tsx        # Display principal de SOC
  night-projection.tsx   # Proyección nocturna con auto-update
  battery-chart.tsx      # Gráficos interactivos
  consumption-summary.tsx # Resumen de consumo
  consumption-editor.tsx  # Editor CRUD de tramos de consumo
  settings-panel.tsx     # Configuración y perfiles (incluye pestaña Consumo)
```

## Lógica de Cálculos (Refactorizada)

### Funciones Principales
```typescript
// Determina el inicio del ciclo nocturno actual
getNightCycleStart(baseTime: Date): Date

// Calcula las fechas absolutas de cada período
getPeriodBounds(profile: ConsumptionProfile, cycleStart: Date): {start, end}

// Calcula estado y métricas de un período
calculatePeriodMetrics(profile, periodStart, periodEnd, currentTime): metrics
```

### Manejo del Ciclo Nocturno
```
Si hora >= 17:00:
  - Ciclo actual comenzó hoy a las 17:00
  - Tramos C y D son mañana

Si hora < 08:00:
  - Ciclo actual comenzó ayer a las 17:00
  - Tramos A y B fueron ayer
  - Tramos C y D son hoy

Si 08:00 <= hora < 17:00:
  - Próximo ciclo comienza hoy a las 17:00
  - Todos los tramos son futuros
```

## Consideraciones Importantes

### Cálculos de Proyección
1. **Tramo actual se pondera**: Solo cuenta el consumo restante
2. **Tramos completados**: No se incluyen en el cálculo futuro
3. **Proyección hasta las 08:00**: Siempre del ciclo nocturno actual
4. **Actualización en tiempo real**: Recálculo automático cada minuto

### Estados de Períodos
- **Completado**: Período pasado (consumedWh = total, remainingWh = 0)
- **Actual**: En curso (progress%, consumedWh, remainingWh)
- **Pendiente**: Futuro (totalWh completo)

### Entrada de Voz
- **API**: Web Speech API (webkitSpeechRecognition)
- **Idioma**: Español (es-ES)
- **Procesamiento**:
  - Reemplaza "coma" → "."
  - Reemplaza "punto" → "."
  - Extrae números del texto
  - Convierte formatos (128 → 12.8)
- **Compatibilidad**: Chrome, Edge, navegadores basados en Chromium

### Persistencia de Datos
- **localStorage key**: 'battery-storage'
- **Contenido**: Estado completo de Zustand
- **Función reset**: resetToDefaults() para limpiar caché

## Comandos Útiles
```bash
pnpm dev           # Desarrollo (puerto 3000 o siguiente disponible)
pnpm build         # Build de producción
pnpm lint          # Linting con ESLint
pnpm start         # Servidor de producción

# Instalación de dependencias
pnpm install       # Instalar todas las dependencias
pnpm add [package] # Agregar nueva dependencia
```

## Debugging y Testing
```bash
# Para probar cálculos en diferentes horas
pnpm tsx test-calculations.ts

# Ver estado en localStorage (en la consola del navegador)
localStorage.getItem('battery-storage')

# Resetear datos (en la consola del navegador)
useBatteryStore.getState().resetToDefaults()
```

## Notas de Implementación

### Mobile-First
- Componentes compactos con padding reducido
- Fuentes pequeñas pero legibles (text-xs, text-sm)
- Botones y controles de tamaño táctil amigable
- Tabs para contenido secundario

### Performance
- Actualización cada minuto (no cada segundo)
- Lazy loading de componentes pesados
- Cálculos optimizados sin loops innecesarios

### UX
- Feedback inmediato con toasts
- Estados de carga visuales (colores, iconos)
- Información progresiva (detalles colapsables)
- Acciones principales siempre visibles

## Errores Comunes Resueltos
1. **105W vs 88W**: Tramo B usa 88W, no 105W
2. **Tramo actual**: Se incluye ponderado, no se excluye
3. **Períodos cruzando medianoche**: Lógica robusta de fechas
4. **localStorage cache**: Reset automático si hay datos antiguos
5. **Migración de perfiles**: Tramos se agregan automáticamente a perfiles antiguos
6. **Tramos undefined**: Validación y carga automática de valores por defecto

## Funcionalidades Implementadas Recientemente

### Sistema de Histórico SOC
- **Guardado diario**: Un registro por día con SOC (sin voltaje)
- **Botón guardar**: Ubicado junto al display de SOC principal
- **Visualización**: Gráfico de línea con estadísticas (promedio, máximo, mínimo)
- **Recordatorio automático**: Alerta entre 4-5 PM Ecuador para guardar SOC
- **Importación/Exportación CSV**: Formatos M/D/YYYY y YYYY-MM-DD soportados
- **Migración automática**: Histórico sin voltaje para ahorrar espacio

### Sistema de Backup Completo
- **Exportar configuración**: Copia todo el estado del localStorage
- **Compartir nativo**: Usa Web Share API para WhatsApp, email, etc.
- **Importar configuración**: Restaura configuración completa desde JSON
- **Ubicación UI**: Panel colapsable arriba de los tabs en Settings
- **Validación**: Verifica estructura JSON antes de importar

### Manejo de Fechas y Timezone
- **Librería**: date-fns y date-fns-tz para manejo profesional
- **Zona horaria**: America/Guayaquil (UTC-5) configurada globalmente
- **Funciones helper**: timezone-utils.ts con utilidades específicas
- **Sin cálculos manuales**: No hacer restas de horas manualmente

### Decisiones de Diseño UI/UX

#### Panel de Settings
- **Máximo 5 tabs**: Para visualización móvil adecuada
- **Backup separado**: Como panel colapsable, no como tab
- **Orden de tabs**: Batería, Consumo, Histórico, Tabla, Perfiles

#### Toasts (Sonner)
- **Tema automático**: Usa el tema del store de Zustand
- **Colores elegantes**: Fondo blanco (claro) / negro (oscuro)
- **Descripción legible**: text-gray-600 (claro) / text-gray-400 (oscuro)
- **Posición**: top-center para mejor visibilidad
- **NO usar colores de fondo**: Mantener diseño minimalista blanco/negro

## Para Claude Code
Cuando trabajes en este proyecto:
1. **USA pnpm** como gestor de paquetes, no npm
2. **SIEMPRE** verifica que el Tramo B use 88W, no 105W
3. **INCLUYE** el tramo actual ponderado en los cálculos
4. **USA** America/Guayaquil para todas las fechas/horas con date-fns-tz
5. **MANTÉN** el diseño mobile-first con componentes compactos
6. **USA** el store para tramos de consumo editables (consumptionTramos)
7. **MANTÉN** consumption-constants.ts solo para valores por defecto
8. **NO DUPLIQUES** lógica de consumo en múltiples lugares
9. **SINCRONIZA** consumptionTramos con consumptionProfile en el store
10. **PRUEBA** los cálculos en diferentes horas del día
11. **VALIDA** que los tramos editados mantengan coherencia horaria
12. **RESPETA** las decisiones de diseño UI/UX establecidas
13. **USA** el tema del store para Sonner, no next-themes
14. **MANTÉN** máximo 5 tabs en Settings para móvil
15. **NO USES** colores de fondo en toasts, solo blanco/negro elegante
16. **ACTUALIZA** este archivo con cambios importantes