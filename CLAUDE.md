# SOC Calculator - LiFePO₄ Battery System

## Contexto del Proyecto
Calculadora de Estado de Carga (SOC) para sistema de batería LiFePO₄ de 12.8V con capacidad de 108 Ah (1380 Wh).
Aplicación web móvil-first para monitoreo en tiempo real del estado de la batería y proyección de consumo nocturno.

## Especificaciones Técnicas

### Sistema de Batería
- **Química**: LiFePO₄ (Litio Ferrofosfato)
- **Voltaje nominal**: 12.8V
- **Capacidad**: 108 Ah / 1380 Wh
- **Rango de voltaje operativo**: 10.0V - 14.6V
- **Reserva de seguridad configurable**: 0-30% (por defecto 0%)

### Consumo Nocturno (17:00 - 08:00)
El sistema debe proyectar el consumo durante el período nocturno:
- **Tramo A**: 17:00-19:00 → 7W (2h = 14 Wh = 1.1 Ah)
- **Tramo B**: 19:00-00:00 → 88W (5h = 440 Wh = 34.4 Ah) ⚠️ IMPORTANTE: Son 88W, NO 105W
- **Tramo C**: 00:00-06:00 → 17W (6h = 102 Wh = 8.0 Ah)
- **Tramo D**: 06:00-08:00 → 7W (2h = 14 Wh = 1.1 Ah)
- **Total ciclo nocturno**: 570 Wh (44.5 Ah)

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

### 3. Proyección Nocturna
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

### 4. Visualización
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
  consumption-constants.ts # Fuente única de datos de consumo
  battery-data.ts         # Tipos y datos de la batería
  store.ts               # Estado global con Zustand
  timezone-utils.ts      # Utilidades de zona horaria

/components/
  voltage-input.tsx       # Input con voz, texto y slider
  soc-display.tsx        # Display principal de SOC
  night-projection.tsx   # Proyección nocturna con auto-update
  battery-chart.tsx      # Gráficos interactivos
  consumption-summary.tsx # Resumen de consumo
  settings-panel.tsx     # Configuración y perfiles
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

## Próximas Mejoras Potenciales
- [ ] Historial de mediciones
- [ ] Exportar datos a CSV
- [ ] Modo oscuro
- [ ] PWA para instalación móvil
- [ ] Notificaciones push cuando batería baja
- [ ] Integración con sistemas de monitoreo

## Para Claude Code
Cuando trabajes en este proyecto:
1. **USA pnpm** como gestor de paquetes, no npm
2. **SIEMPRE** verifica que el Tramo B use 88W, no 105W
3. **INCLUYE** el tramo actual ponderado en los cálculos
4. **USA** America/Guayaquil para todas las fechas/horas
5. **MANTÉN** el diseño mobile-first con componentes compactos
6. **CENTRALIZA** los datos de consumo en consumption-constants.ts
7. **NO DUPLIQUES** lógica de consumo en múltiples lugares
8. **PRUEBA** los cálculos en diferentes horas del día
9. **ACTUALIZA** este archivo con cambios importantes