# Database Migration Analysis - SOC Calculator

## Mapeo de Estructura: localStorage → Supabase

Esta documentación detalla la correspondencia entre la estructura del backup JSON (localStorage) y las tablas de la base de datos PostgreSQL en Supabase, facilitando la migración de stores y lógica del frontend.

---

## 📊 Estructura del Backup JSON

El backup contiene la siguiente estructura principal:
```json
{
  "currentVoltage": 13.8,
  "currentProfileId": "default",
  "profiles": [{ /* array de perfiles */ }],
  "theme": "light",
  "appTheme": "default",
  "exportedAt": "2025-08-31T21:32:50.825Z",
  "version": "1.0.0"
}
```

---

## 🗄️ Mapeo Detallado de Datos

### 1. **Configuración Global del Usuario**

| **Campo Backup JSON** | **Tabla Supabase** | **Campo Supabase** | **Tipo** | **Notas** |
|----------------------|--------------------|--------------------|----------|-----------|
| `currentVoltage` | `user_preferences` | `current_voltage` | `DECIMAL(4,2)` | Voltaje actual del sistema |
| `currentProfileId` | `user_preferences` | `active_battery_profile_id` | `UUID` | Se mapea al UUID del perfil activo |
| `theme` | `user_preferences` | `theme` | `VARCHAR` | 'light' o 'dark' |
| `appTheme` | `user_preferences` | `app_theme` | `VARCHAR` | 'default', 'futuristic', 'minimal', 'retro', 'hippie' |
| `exportedAt` | `user_preferences` | `updated_at` | `TIMESTAMPTZ` | Timestamp de última actualización |

**Campos adicionales en Supabase (con valores por defecto):**
- `timezone`: `'America/Guayaquil'`
- `prediction_efficiency`: `0.75`
- `prediction_tilt_angle`: `10`
- `prediction_azimuth`: `0`
- `prediction_temperature_coefficient`: `-0.004`

---

### 2. **Perfil de Batería Principal**

**Ruta JSON:** `profiles[0]` (perfil con `id: "default"`)

| **Campo Backup JSON** | **Tabla Supabase** | **Campo Supabase** | **Tipo** | **Notas** |
|----------------------|--------------------|--------------------|----------|-----------|
| `profiles[0].id` | `battery_profiles` | *No se mapea directo* | - | Se genera UUID nuevo |
| `profiles[0].name` | `battery_profiles` | `name` | `VARCHAR` | "Perfil Principal" |
| `profiles[0].createdAt` | `battery_profiles` | `created_at` | `TIMESTAMPTZ` | Timestamp de creación |
| `profiles[0].updatedAt` | `battery_profiles` | `updated_at` | `TIMESTAMPTZ` | Timestamp de actualización |

---

### 3. **Configuración de Batería**

**Ruta JSON:** `profiles[0].batteryConfig`

| **Campo Backup JSON** | **Tabla Supabase** | **Campo Supabase** | **Tipo** | **Notas** |
|----------------------|--------------------|--------------------|----------|-----------|
| `batteryConfig.chemistry` | `battery_profiles` | `chemistry` | `VARCHAR` | "LiFePO₄" |
| `batteryConfig.nominalVoltage` | `battery_profiles` | `nominal_voltage` | `DECIMAL(4,2)` | 12.8V |
| `batteryConfig.capacityAh` | `battery_profiles` | `battery_capacity_ah` | `INTEGER` | 108 Ah |
| `batteryConfig.capacityWh` | `battery_profiles` | `battery_capacity_wh` | `INTEGER` | 1380 Wh |
| `batteryConfig.capacityKwh` | `battery_profiles` | `battery_capacity_kwh` | `DECIMAL(4,2)` | 1.38 kWh |
| `batteryConfig.batteryConfiguration` | `battery_profiles` | `battery_configuration` | `TEXT` | Descripción textual |
| `batteryConfig.numberOfBatteries` | `battery_profiles` | `number_of_batteries` | `INTEGER` | 6 |
| `batteryConfig.batteryCapacityEach` | `battery_profiles` | `battery_capacity_each` | `DECIMAL(6,2)` | 18 Ah c/u |
| `batteryConfig.dailyConsumptionAh` | `battery_profiles` | `daily_consumption_ah` | `DECIMAL(6,2)` | 45 Ah diario |
| `batteryConfig.safetyReserve` | `battery_profiles` | `safety_reserve_percent` | `INTEGER` | 20% |
| `batteryConfig.timezone` | `user_preferences` | `timezone` | `VARCHAR` | "America/Guayaquil" |

**Campos fijos en `battery_profiles` (valores por defecto):**
- `min_voltage`: `10.0`
- `max_voltage`: `14.6`
- `is_active`: `true`

---

### 4. **Sistema Solar**

**Ruta JSON:** `profiles[0].batteryConfig` (datos solares mezclados)

| **Campo Backup JSON** | **Tabla Supabase** | **Campo Supabase** | **Tipo** | **Notas** |
|----------------------|--------------------|--------------------|----------|-----------|
| `batteryConfig.solarPowerTotal` | `solar_system_config` | `solar_power_total` | `INTEGER` | 720W |
| `batteryConfig.numberOfPanels` | `solar_system_config` | `number_of_panels` | `INTEGER` | 12 |
| `batteryConfig.panelPowerEach` | `solar_system_config` | `panel_power_each` | `DECIMAL(6,2)` | 60W c/u |
| `batteryConfig.panelType` | `solar_system_config` | `panel_type` | `VARCHAR` | "Monocristalino" |
| `batteryConfig.panelConfiguration` | `solar_system_config` | `panel_configuration` | `TEXT` | "12 paneles en paralelo" |
| `batteryConfig.panelVoltage` | `solar_system_config` | `panel_voltage` | `DECIMAL(4,2)` | 18V |
| `batteryConfig.panelCurrent` | `solar_system_config` | `panel_current` | `DECIMAL(4,2)` | 3.2A |
| `batteryConfig.controllerType` | `solar_system_config` | `controller_type` | `VARCHAR` | "MPPT" |
| `batteryConfig.controllerCapacity` | `solar_system_config` | `controller_capacity` | `INTEGER` | 30A |

**Relación:** `profile_id` → `battery_profiles.id` (1:1)

---

### 5. **Tabla de Conversión Voltaje-SOC**

**Ruta JSON:** `profiles[0].voltageSOCTable[]` (149 puntos)

| **Campo Backup JSON** | **Tabla Supabase** | **Campo Supabase** | **Tipo** | **Notas** |
|----------------------|--------------------|--------------------|----------|-----------|
| *Array completo* | `voltage_soc_tables` | *Tabla maestra* | - | Se crea 1 registro |
| - | `voltage_soc_tables` | `name` | `VARCHAR` | "LiFePO4 Principal" |
| - | `voltage_soc_tables` | `description` | `TEXT` | Descripción generada |
| - | `voltage_soc_tables` | `is_default` | `BOOLEAN` | `true` |
| `voltageSOCTable[i].voltage` | `voltage_soc_points` | `voltage` | `DECIMAL(4,2)` | 14.30, 14.29, ... 10.80 |
| `voltageSOCTable[i].soc` | `voltage_soc_points` | `soc` | `DECIMAL(4,1)` | 100.0, 100.0, ... 1.0 |

**Relación:** `table_id` → `voltage_soc_tables.id` y `battery_profiles.voltage_soc_table_id` → `voltage_soc_tables.id`

---

### 6. **Tramos de Consumo**

**Ruta JSON:** `profiles[0].consumptionTramos[]` (6 tramos)

| **Campo Backup JSON** | **Tabla Supabase** | **Campo Supabase** | **Tipo** | **Notas** |
|----------------------|--------------------|--------------------|----------|-----------|
| `consumptionTramos[i].id` | `consumption_segments` | `segment_id` | `VARCHAR` | "A", "B", "C", "D", "custom-..." |
| `consumptionTramos[i].name` | `consumption_segments` | `name` | `VARCHAR` | "Tramo A", "RefriCervecera", etc. |
| `consumptionTramos[i].period` | `consumption_segments` | `period_label` | `VARCHAR` | "17:00-19:00", "00:00-00:00" |
| `consumptionTramos[i].startHour` | `consumption_segments` | `start_hour` | `INTEGER` | 0-23 |
| `consumptionTramos[i].endHour` | `consumption_segments` | `end_hour` | `INTEGER` | 0-24 |
| `consumptionTramos[i].watts` | `consumption_segments` | `watts` | `DECIMAL(6,2)` | 15, 50, 23, 7, 0, 8 |
| `consumptionTramos[i].hours` | `consumption_segments` | `hours` | `DECIMAL(3,1)` | Calculado |
| `consumptionTramos[i].wh` | `consumption_segments` | `wh` | `DECIMAL(8,2)` | watts × hours |
| `consumptionTramos[i].ah` | `consumption_segments` | `ah` | `DECIMAL(6,2)` | wh ÷ 12.8 |
| `consumptionTramos[i].color` | `consumption_segments` | `color` | `VARCHAR` | Clase Tailwind |

**Campos adicionales en Supabase:**
- `is_active`: `true` (por defecto)
- `profile_id`: → `battery_profiles.id`

**Tramos específicos del backup:**
1. **Tramo A:** 17:00-19:00, 15W, verde
2. **Tramo B:** 19:00-00:00, 50W, naranja  
3. **Tramo C:** 00:00-06:00, 23W, amarillo
4. **Tramo D:** 06:00-08:00, 7W, verde
5. **RefriCervecera:** 00:00-00:00, 0W, azul (24h)
6. **Inversor:** 00:00-00:00, 8W, azul (24h)

---

### 7. **Historial de SOC**

**Ruta JSON:** `profiles[0].socHistory[]` (56 registros)

| **Campo Backup JSON** | **Tabla Supabase** | **Campo Supabase** | **Tipo** | **Notas** |
|----------------------|--------------------|--------------------|----------|-----------|
| `socHistory[i].date` | `daily_soc_records` | `date` | `DATE` | "2025-06-29" formato |
| `socHistory[i].soc` | `daily_soc_records` | `soc` | `INTEGER` | Valores: 77-100 |
| `socHistory[i].timestamp` | `daily_soc_records` | `created_at` | `TIMESTAMPTZ` | Timestamp exacto |
| - | `daily_soc_records` | `voltage` | `DECIMAL(4,2)` | `NULL` (no disponible en backup) |

**Campos adicionales en Supabase (sin datos en backup):**
- `max_soc`, `min_soc`, `max_voltage`, `min_voltage`: `NULL`
- `notes`: `NULL`
- `profile_id`: → `battery_profiles.id`

**Rango de fechas:** 2025-06-29 al 2025-08-31 (56 entradas)

---

### 8. **Perfil de Consumo (Legacy)**

**Ruta JSON:** `profiles[0].consumptionProfile[]` (6 entradas - datos redundantes)

**⚠️ IMPORTANTE:** Este array es redundante con `consumptionTramos[]` pero con formato diferente.

| **Campo Backup JSON** | **Equivalente en consumptionTramos** | **Notas** |
|----------------------|-------------------------------------|-----------|
| `consumptionProfile[i].startHour` | `consumptionTramos[i].startHour` | Mismo valor |
| `consumptionProfile[i].endHour` | `consumptionTramos[i].endHour` | Mismo valor |
| `consumptionProfile[i].watts` | `consumptionTramos[i].watts` | Mismo valor |
| `consumptionProfile[i].label` | `consumptionTramos[i].period + name` | Formato diferente |

**Decisión de migración:** Usar solo `consumptionTramos[]` ya que tiene más información (ah, wh, color, etc.)

---

## 🔄 Estrategia de Migración

### Fase 1: Mapping de IDs
```javascript
// El backup usa string IDs, Supabase usa UUIDs
const profileMapping = {
  'default': '<nuevo-uuid-generado>' // profile.id del JSON → battery_profiles.id
}
```

### Fase 2: Orden de Inserción (respetando Foreign Keys)
1. `voltage_soc_tables` (tabla maestra)
2. `voltage_soc_points` (requiere voltage_soc_tables.id)
3. `battery_profiles` (requiere voltage_soc_tables.id)  
4. `solar_system_config` (requiere battery_profiles.id)
5. `consumption_segments` (requiere battery_profiles.id)
6. `daily_soc_records` (requiere battery_profiles.id)
7. `user_preferences` (requiere battery_profiles.id)

### Fase 3: Validaciones
- **149 puntos** de voltaje-SOC
- **1 perfil** de batería  
- **1 configuración** solar
- **6 tramos** de consumo
- **56 registros** históricos
- **1 configuración** de usuario

---

## 🏗️ Implementación en Frontend

### Store Migration Pattern
```typescript
// Antes (localStorage)
const currentVoltage = useStore(state => state.currentVoltage)
const activeProfile = useStore(state => state.getCurrentProfile())

// Después (Supabase)  
const userPrefs = useQuery(['user_preferences'])
const currentVoltage = userPrefs?.current_voltage
const activeProfile = useQuery(['battery_profiles', userPrefs?.active_battery_profile_id])
```

### Data Layer Abstraction
```typescript
interface DataLayer {
  // Migración progresiva
  getCurrentVoltage(): Promise<number>        // localStorage → Supabase
  getBatteryProfile(): Promise<BatteryProfile> // localStorage → Supabase  
  getConsumptionSegments(): Promise<Segment[]> // localStorage → Supabase
}
```

---

## 📋 Checklist de Migración

### Backend (Completado ✅)
- [x] Schema inicial creado
- [x] Tablas con relaciones correctas
- [x] Migración de limpieza
- [x] Migración de datos (pendiente optimización)

### Frontend (Pendiente 🔄)
- [ ] Crear DataLayer abstracta
- [ ] Migrar store de user preferences
- [ ] Migrar store de battery profiles  
- [ ] Migrar store de consumption segments
- [ ] Migrar store de SOC history
- [ ] Migrar store de voltage readings
- [ ] Dual-write durante transición
- [ ] Cutover final a Supabase

---

## 🎯 Notas Importantes

1. **UUIDs vs String IDs:** El backup usa `"default"` como ID, pero Supabase genera UUIDs
2. **Datos redundantes:** `consumptionProfile[]` es legacy, usar `consumptionTramos[]`
3. **Campos calculados:** `hours`, `wh`, `ah` se recalculan en la inserción
4. **Timezone:** Todos los timestamps deben manejarse en `America/Guayaquil`  
5. **Precisión decimal:** Mantener precisiones exactas (voltaje: 4,2 - SOC: 4,1)
6. **Foreign Keys:** Respetar el orden de inserción para evitar violaciones

Esta documentación servirá como referencia durante toda la migración del frontend hacia Supabase.