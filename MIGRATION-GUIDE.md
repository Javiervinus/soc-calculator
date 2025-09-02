# 📚 Guía de Migración: localStorage → Supabase

## 🎯 Objetivo de la Migración
Migrar de un sistema basado completamente en localStorage (un único store Zustand) a un sistema híbrido que usa:
- **Supabase** como fuente de verdad
- **localStorage** como caché para respuesta inmediata
- **React Query** para manejo de estado del servidor
- **Stores separados** por funcionalidad

---

## 🏗️ Arquitectura Implementada (ACTUALIZADA - Enero 2025)

### 1. **Estructura de Directorios**
```
/lib/
├── constants/
│   └── user-constants.ts         # IDs fijos del usuario/perfil actual
├── supabase/                     # Clientes de Supabase
│   ├── client.ts                # Cliente para lado cliente
│   ├── server.ts                # Cliente para Server Components
│   └── database.types.ts        # Tipos generados automáticamente
├── hooks/                        # Hooks de React Query (SIN stores Zustand)
│   ├── use-voltage.ts           # Hook para voltaje
│   ├── use-battery-profile.ts   # Hook para perfil batería
│   └── use-consumption-segments.ts # Hook para segmentos
└── providers/
    └── query-provider.tsx        # Provider de React Query con persistencia
```

### 2. **CAMBIO IMPORTANTE: Sin Stores de Zustand**

❌ **PATRÓN ANTERIOR (obsoleto):**
- React Query + Zustand stores separados
- localStorage manual
- `initialData` desde stores

✅ **PATRÓN ACTUAL (enero 2025):**
- **Solo React Query** con persistencia nativa
- **HydrationBoundary** para SSR
- **PersistQueryClientProvider** para localStorage automático

### 3. **Principios de Separación de Queries**

#### 🤔 **Criterios para Decidir QueryKeys:**

**QueryKey SEPARADO cuando:**
- Los datos se actualizan con diferente frecuencia
- Un componente puede funcionar sin los otros datos
- Los datos pertenecen a dominios diferentes (ej: voltaje vs segmentos)

**COMPARTIR en mismo queryFn cuando:**
- Los datos siempre se necesitan juntos
- Un dato no tiene sentido sin el otro (ej: perfil + tabla SOC)
- Los componentes están fuertemente acoplados

**Ejemplos de decisiones tomadas:**
```
['voltage', userId]                    → Separado (alta frecuencia de cambio)
['battery-profile', profileId]         → Incluye perfil + tabla SOC (siempre juntos)
['consumption-segments', profileId]    → Separado (dominio diferente, carga independiente)
['user-preferences', userId]          → Incluye temas + config UI (mismo dominio)
```

#### ❌ **Qué NO hacer:**
- Una sola query gigante (causa loading innecesario)
- Una query por cada campo individual (demasiado granular)
- Separar datos que siempre se usan juntos

---

## 📋 Patrón de Migración Paso a Paso (ACTUALIZADO)

### Paso 1: **Identificar los Datos**
```typescript
// Analizar qué datos usa el componente del store antiguo
const { currentVoltage, getCurrentProfile, consumptionProfile } = useBatteryStore();
```

### Paso 2: **Configurar SSR en la Página**

#### **Crear Server Component para la página:**
```typescript
// app/page.tsx (Server Component)
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/server';
import { CURRENT_USER_ID, CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { HomeClient } from './home-client';

export default async function Home() {
  const queryClient = new QueryClient();
  const supabase = await getSupabase();

  // Prefetch TODOS los datos que la página necesita
  await queryClient.prefetchQuery({
    queryKey: ['voltage', CURRENT_USER_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('id, current_voltage')
        .eq('id', CURRENT_USER_ID)
        .single();

      if (error) throw error;
      return data?.current_voltage || 13.2;
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ['battery-profile', CURRENT_BATTERY_PROFILE_ID],
    queryFn: async () => {
      // Obtener perfil + puntos SOC juntos
      const { data: profile } = await supabase
        .from('battery_profiles')
        .select('*')
        .eq('id', CURRENT_BATTERY_PROFILE_ID)
        .single();
      
      const { data: points } = await supabase
        .from('voltage_soc_points')
        .select('*')
        .eq('table_id', profile.voltage_soc_table_id)
        .order('voltage', { ascending: false });

      return { profile, voltageSOCPoints: points || [] };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient />
    </HydrationBoundary>
  );
}
```

### Paso 3: **Crear Hook con React Query (SIN Zustand)**
```typescript
// /lib/hooks/use-[nombre].ts
export function use[Nombre]() {
  const supabase = getSupabase();

  const query = useQuery({
    queryKey: ['nombre-dato', ID_RELEVANTE],
    queryFn: async () => {
      // 1. Obtener de Supabase
      const { data, error } = await supabase
        .from('tabla')
        .select('*')
        .eq('id', ID_RELEVANTE)
        .single();

      if (error) throw error;
      return data;
    },
    // CONFIGURACIÓN CRÍTICA para comportamiento correcto:
    staleTime: 0, // Siempre considera datos stale para refetch en background
    gcTime: 1000 * 60 * 60 * 24, // 24h en memoria (igual al provider)
    refetchOnMount: 'always', // SIEMPRE refetch al montar
    refetchOnWindowFocus: true, // Refetch cuando obtiene foco
    refetchOnReconnect: true, // Refetch cuando se reconecta
    retry: 1,
  });

  return {
    data: query.data,
    // Con HydrationBoundary, isLoading funciona correctamente
    isLoading: query.isLoading,
    error: query.error,
  };
}
```

### Paso 4: **Crear Client Component**
```typescript
// app/home-client.tsx (Client Component)
"use client";

import { VoltageInput } from "@/components/voltage-input";
// ... otros imports

export function HomeClient() {
  return (
    <div>
      {/* Los componentes usan los hooks normalmente */}
      <VoltageInput />
      {/* ... otros componentes */}
    </div>
  );
}
```

### Paso 5: **Migrar el Componente**
```typescript
// ANTES:
const { currentVoltage, getCurrentProfile } = useBatteryStore();

// DESPUÉS:
const { voltage, isLoading } = useVoltage();
const { profile, voltageSOCPoints } = useBatteryProfile();

// Loading solo en primera carga real (muy raro con SSR)
if (isLoading) {
  return <Loader2 className="animate-spin" />;
}
```

---

## 🔑 Datos Críticos del Sistema

### **IDs Fijos (por ahora)**
```typescript
// /lib/constants/user-constants.ts
export const CURRENT_USER_ID = 'd51dbd52-d285-415b-b99f-ab399e828dff';
export const CURRENT_BATTERY_PROFILE_ID = '1e60ecb6-b0e0-48e1-a265-bed99de33ffc';
```
**IMPORTANTE:** Estos IDs son del usuario actual (el papá). En el futuro vendrán del sistema de autenticación.

### **Cuándo Crear Datos Nuevos**
- **NO crear**: Perfiles de batería, usuarios, tablas SOC (ya existen)
- **SÍ crear**: 
  - `voltage_readings`: Cada cambio de voltaje (bitácora)
  - `daily_soc_records`: Cuando el usuario guarda el SOC diario
  - Futuros registros de actividad/histórico
- **Regla**: Si es un registro histórico o bitácora, SÍ se crea. Si es configuración base, NO

---

## 📈 Tipos de Datos en Supabase

### **Datos de Configuración** (NO crear, solo leer/actualizar)
- `user_preferences` - Solo hay 1 registro del papá
- `battery_profiles` - Solo hay 1 perfil activo
- `voltage_soc_tables` - Ya existe la tabla de conversión
- `voltage_soc_points` - Ya existen los puntos
- `consumption_segments` - Ya existen los tramos (el CRUD los actualiza, no crea nuevos perfiles)
- `solar_system_config` - Ya existe la configuración

### **Datos Históricos/Bitácora** (SÍ crear nuevos registros)
- `voltage_readings` - Nuevo registro cada vez que cambia el voltaje
- `daily_soc_records` - Nuevo registro cuando se guarda el SOC del día
- `activity_logs` - (futuro) Registro de actividades
- Cualquier tabla de histórico/estadísticas

### **Regla Simple**
```typescript
// Configuración: UPDATE
await supabase
  .from('user_preferences')
  .update({ current_voltage: 13.8 })
  .eq('id', CURRENT_USER_ID);

// Histórico: INSERT
await supabase
  .from('voltage_readings')
  .insert({ 
    voltage: 13.8,
    profile_id: CURRENT_BATTERY_PROFILE_ID 
  });
```

---

## 📝 Casos Especiales Implementados

### 1. **Voltage Input** (Lectura + Escritura)
- Lee `current_voltage` de `user_preferences`
- Actualiza optimísticamente (cambio inmediato)
- Inserta en `voltage_readings` como bitácora
- Mutation con rollback en caso de error

### 2. **SOC Display** (Solo Lectura)
- Depende del voltaje (lo obtiene del hook)
- Calcula SOC basado en tabla de conversión
- No necesita su propio store (usa datos de otros)

### 3. **Night Projection** (Solo Lectura + Cálculo Tiempo Real)
- Lee segmentos de consumo
- Recalcula cada minuto (timer interno)
- Pondera el tramo actual según hora
- Proyecta consumo futuro

---

## ⚠️ Puntos Críticos a Recordar

### 1. **SSR + HydrationBoundary (NUEVO)**
```typescript
// ✅ CORRECTO: Con SSR, los datos vienen pre-cargados
// Primera carga: Datos desde servidor (sin loading)
// Recargas: Datos desde localStorage React Query (sin loading)
isLoading: query.isLoading

// ❌ INCORRECTO: Lógica compleja de loading
isLoading: query.isLoading && !someLocalCache
```

### 2. **Comportamiento de Fetch con SSR**
**IMPORTANTE:** El nuevo flujo es mucho más simple:

**Con HydrationBoundary + PersistQueryClientProvider:**
1. **Server Side:** Prefetch en servidor → datos embebidos en HTML
2. **Client Side:** React Query hidrata con datos del servidor
3. **localStorage:** Se actualiza automáticamente por React Query
4. **Refetch:** Background automático según configuración

**Sin lógica compleja de caché manual:**
- No necesitas `initialData` manual
- No necesitas stores de Zustand
- No necesitas lógica de `lastSync`

### 3. **React Query Persistencia Automática**
```typescript
// PersistQueryClientProvider se encarga automáticamente de:
// - Guardar en localStorage con key 'soc-calculator-cache'  
// - Restaurar en cada carga
// - Sincronizar con queries activos
// - Manejar buster para invalidar caché

// NO hacer localStorage manual
```

### 4. **Mutaciones Optimistas (SIN cambios)**
```typescript
// Sigue igual, pero sin stores Zustand
onMutate: async (newData) => {
  queryClient.setQueryData(['voltage', userId], newData); // Cambio inmediato
  return { previousData }; // Para rollback
}
```

### 4. **Tipos de Supabase**
```typescript
// Usar tipos generados, NO crear propios
import type { Tables } from '@/lib/supabase/database.types';
export type BatteryProfile = Tables<'battery_profiles'>;
```

---

## 🚀 Componentes Pendientes de Migrar

### Alta Prioridad (datos críticos):
- [ ] `SettingsPanel` - Panel de configuración principal
- [ ] `ConsumptionEditor` - CRUD de tramos de consumo
- [ ] `SOCSaveButton` - Guardar SOC diario
- [ ] `BatteryInfo` - Información de batería

### Media Prioridad (visualización):
- [ ] `ConsumptionChart` - Gráfico de consumo
- [ ] `SOCHistoryChart` - Gráfico histórico
- [ ] `WeeklyProjection` - Proyección semanal

### Baja Prioridad (UI/UX):
- [ ] `ThemeSelector` - Selector de temas
- [ ] `ProfileManager` - Gestión de perfiles
- [ ] `BackupPanel` - Panel de respaldo

---

## 🎯 Checklist para Migrar un Componente (ACTUALIZADO)

- [ ] Identificar qué datos usa del store antiguo
- [ ] Verificar si ya existe un hook para esos datos
- [ ] **DECIDIR**: ¿Necesita queryKey separado o puede compartir uno existente?
- [ ] Si necesita hook nuevo, crearlo siguiendo el patrón (SIN Zustand)
- [ ] Si comparte queryKey, extender el hook existente
- [ ] **AGREGAR prefetch en la página Server Component**
- [ ] Reemplazar `useBatteryStore()` por los hooks nuevos
- [ ] **NO agregar lógica compleja de loading** (usar `query.isLoading` directamente)
- [ ] Verificar que funcione con datos de Supabase
- [ ] Probar que SSR + localStorage funcionen (recargar página)
- [ ] **Verificar que no hay flash de contenido** (FOUC)
- [ ] Verificar que no se dupliquen datos de configuración
- [ ] Si crea registros históricos, verificar que se guarden correctamente
- [ ] **ELIMINAR cualquier store Zustand creado anteriormente**

---

## 🔧 Comandos Útiles

```bash
# Ver el caché de React Query en localStorage (consola del navegador)
localStorage.getItem('soc-calculator-cache')

# Limpiar caché de React Query (forzar fresh fetch)
localStorage.removeItem('soc-calculator-cache')

# Ver datos en Supabase (SQL Editor)
SELECT * FROM user_preferences;
SELECT * FROM battery_profiles;
SELECT * FROM consumption_segments ORDER BY start_hour;

# Verificar que SSR funciona (Network tab)
# - Primera carga debe mostrar datos inmediatamente (sin requests)
# - Luego debe hacer requests en background para actualizar
```

---

## 📌 Notas Finales (ACTUALIZADAS)

1. **NO borrar** el store antiguo (`/lib/store.ts`) hasta migrar TODO
2. **SSR PRIMERO**: Siempre agregar prefetch en Server Component antes de migrar componente
3. **Evaluar** si crear datos nuevos (históricos SÍ, configuración NO)
4. **Siempre** usar los IDs de `user-constants.ts`
5. **QueryKey único** por dominio de datos (no por campo)
6. **Sin stores Zustand** nuevos - solo React Query con persistencia
7. **Loading simple** - usar `query.isLoading` directamente
8. **ELIMINAR stores Zustand** creados durante migración anterior
9. **Probar sin FOUC** - los datos deben aparecer inmediatamente

Esta migración es **incremental**: cada componente se migra independientemente sin romper los demás.