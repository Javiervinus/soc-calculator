-- ====================================================================
-- MIGRACIÓN DE DATOS v2 (CORREGIDA): Backup LocalStorage a Supabase
-- ====================================================================
-- Este script inserta los datos del archivo de backup JSON
-- en la estructura de base de datos relacional.
--
-- >> CORRECCIONES (v2) REALIZADAS <<
-- 1. Se incluyen los 351 puntos de voltaje exactos proporcionados.
-- 2. Se corrige el conteo de registros diarios a 61.
-- 3. Se mantienen los valores decimales en los datos de SOC histórico.
-- ====================================================================

DO $$
DECLARE
  v_profile_uuid UUID;
  v_vsoc_table_uuid UUID;
BEGIN
  RAISE NOTICE 'Starting corrected backup JSON data import (v2)...';

  -- ====================================
  -- PASO 1: Crear la tabla maestra de conversión Voltaje-SOC
  -- ====================================
  INSERT INTO voltage_soc_tables (name, description, is_default, created_at)
  VALUES (
    'LiFePO4 Principal',
    'Tabla de conversión importada del backup JSON. Contiene 351 puntos de voltaje.',
    true,
    '2025-08-10T00:54:39.640Z'
  ) RETURNING id INTO v_vsoc_table_uuid;

  -- ====================================
  -- PASO 2: Insertar los 351 puntos de la tabla de conversión
  -- CORRECCIÓN (v2): Lista de puntos actualizada según la fuente de verdad proporcionada.
  -- ====================================
  RAISE NOTICE 'Paso 2: Insertando los 351 puntos correctos en voltage_soc_points...';
  INSERT INTO voltage_soc_points (table_id, voltage, soc) VALUES
    (v_vsoc_table_uuid, 14.3, 100), (v_vsoc_table_uuid, 14.29, 100), (v_vsoc_table_uuid, 14.28, 100),
    (v_vsoc_table_uuid, 14.27, 100), (v_vsoc_table_uuid, 14.26, 100), (v_vsoc_table_uuid, 14.25, 100),
    (v_vsoc_table_uuid, 14.24, 100), (v_vsoc_table_uuid, 14.23, 100), (v_vsoc_table_uuid, 14.22, 100),
    (v_vsoc_table_uuid, 14.21, 100), (v_vsoc_table_uuid, 14.2, 100), (v_vsoc_table_uuid, 14.19, 100),
    (v_vsoc_table_uuid, 14.18, 100), (v_vsoc_table_uuid, 14.17, 100), (v_vsoc_table_uuid, 14.16, 100),
    (v_vsoc_table_uuid, 14.15, 100), (v_vsoc_table_uuid, 14.14, 100), (v_vsoc_table_uuid, 14.13, 100),
    (v_vsoc_table_uuid, 14.12, 100), (v_vsoc_table_uuid, 14.11, 100), (v_vsoc_table_uuid, 14.1, 100),
    (v_vsoc_table_uuid, 14.09, 100), (v_vsoc_table_uuid, 14.08, 100), (v_vsoc_table_uuid, 14.07, 100),
    (v_vsoc_table_uuid, 14.06, 100), (v_vsoc_table_uuid, 14.05, 100), (v_vsoc_table_uuid, 14.04, 100),
    (v_vsoc_table_uuid, 14.03, 100), (v_vsoc_table_uuid, 14.02, 100), (v_vsoc_table_uuid, 14.01, 100),
    (v_vsoc_table_uuid, 14, 100), (v_vsoc_table_uuid, 13.99, 100), (v_vsoc_table_uuid, 13.98, 100),
    (v_vsoc_table_uuid, 13.97, 100), (v_vsoc_table_uuid, 13.96, 100), (v_vsoc_table_uuid, 13.95, 100),
    (v_vsoc_table_uuid, 13.94, 100), (v_vsoc_table_uuid, 13.93, 100), (v_vsoc_table_uuid, 13.92, 100),
    (v_vsoc_table_uuid, 13.91, 100), (v_vsoc_table_uuid, 13.9, 100), (v_vsoc_table_uuid, 13.89, 100),
    (v_vsoc_table_uuid, 13.88, 100), (v_vsoc_table_uuid, 13.87, 100), (v_vsoc_table_uuid, 13.86, 100),
    (v_vsoc_table_uuid, 13.85, 100), (v_vsoc_table_uuid, 13.84, 100), (v_vsoc_table_uuid, 13.83, 100),
    (v_vsoc_table_uuid, 13.82, 100), (v_vsoc_table_uuid, 13.81, 100), (v_vsoc_table_uuid, 13.8, 100),
    (v_vsoc_table_uuid, 13.79, 99.9), (v_vsoc_table_uuid, 13.78, 99.8), (v_vsoc_table_uuid, 13.77, 99.7),
    (v_vsoc_table_uuid, 13.76, 99.6), (v_vsoc_table_uuid, 13.75, 99.5), (v_vsoc_table_uuid, 13.74, 99.4),
    (v_vsoc_table_uuid, 13.73, 99.3), (v_vsoc_table_uuid, 13.72, 99.2), (v_vsoc_table_uuid, 13.71, 99.1),
    (v_vsoc_table_uuid, 13.7, 99), (v_vsoc_table_uuid, 13.69, 98.6), (v_vsoc_table_uuid, 13.68, 98.2),
    (v_vsoc_table_uuid, 13.67, 97.7), (v_vsoc_table_uuid, 13.66, 97.3), (v_vsoc_table_uuid, 13.65, 96.8),
    (v_vsoc_table_uuid, 13.64, 96.4), (v_vsoc_table_uuid, 13.63, 96), (v_vsoc_table_uuid, 13.62, 95.5),
    (v_vsoc_table_uuid, 13.61, 95.1), (v_vsoc_table_uuid, 13.6, 94.6), (v_vsoc_table_uuid, 13.59, 94.2),
    (v_vsoc_table_uuid, 13.58, 93.8), (v_vsoc_table_uuid, 13.57, 93.3), (v_vsoc_table_uuid, 13.56, 92.9),
    (v_vsoc_table_uuid, 13.55, 92.4), (v_vsoc_table_uuid, 13.54, 92), (v_vsoc_table_uuid, 13.53, 91.6),
    (v_vsoc_table_uuid, 13.52, 91.1), (v_vsoc_table_uuid, 13.51, 90.7), (v_vsoc_table_uuid, 13.5, 90),
    (v_vsoc_table_uuid, 13.49, 89.3), (v_vsoc_table_uuid, 13.48, 88.7), (v_vsoc_table_uuid, 13.47, 88),
    (v_vsoc_table_uuid, 13.46, 87.3), (v_vsoc_table_uuid, 13.45, 86.7), (v_vsoc_table_uuid, 13.44, 86),
    (v_vsoc_table_uuid, 13.43, 85.3), (v_vsoc_table_uuid, 13.42, 84.7), (v_vsoc_table_uuid, 13.41, 84),
    (v_vsoc_table_uuid, 13.4, 83.3), (v_vsoc_table_uuid, 13.39, 82.7), (v_vsoc_table_uuid, 13.38, 82),
    (v_vsoc_table_uuid, 13.37, 81.3), (v_vsoc_table_uuid, 13.36, 80.7), (v_vsoc_table_uuid, 13.35, 80),
    (v_vsoc_table_uuid, 13.34, 79.3), (v_vsoc_table_uuid, 13.33, 78.7), (v_vsoc_table_uuid, 13.32, 78),
    (v_vsoc_table_uuid, 13.31, 77.3), (v_vsoc_table_uuid, 13.3, 76.7), (v_vsoc_table_uuid, 13.29, 76),
    (v_vsoc_table_uuid, 13.28, 75.3), (v_vsoc_table_uuid, 13.27, 74.7), (v_vsoc_table_uuid, 13.26, 74),
    (v_vsoc_table_uuid, 13.25, 73.3), (v_vsoc_table_uuid, 13.24, 72.7), (v_vsoc_table_uuid, 13.23, 72),
    (v_vsoc_table_uuid, 13.22, 71.3), (v_vsoc_table_uuid, 13.21, 70.7), (v_vsoc_table_uuid, 13.2, 70),
    (v_vsoc_table_uuid, 13.19, 67), (v_vsoc_table_uuid, 13.18, 64), (v_vsoc_table_uuid, 13.17, 61),
    (v_vsoc_table_uuid, 13.16, 58), (v_vsoc_table_uuid, 13.15, 55), (v_vsoc_table_uuid, 13.14, 52),
    (v_vsoc_table_uuid, 13.13, 49), (v_vsoc_table_uuid, 13.12, 46), (v_vsoc_table_uuid, 13.11, 43),
    (v_vsoc_table_uuid, 13.1, 40), (v_vsoc_table_uuid, 13.09, 39), (v_vsoc_table_uuid, 13.08, 38),
    (v_vsoc_table_uuid, 13.07, 37), (v_vsoc_table_uuid, 13.06, 36), (v_vsoc_table_uuid, 13.05, 35),
    (v_vsoc_table_uuid, 13.04, 34), (v_vsoc_table_uuid, 13.03, 33), (v_vsoc_table_uuid, 13.02, 32),
    (v_vsoc_table_uuid, 13.01, 31), (v_vsoc_table_uuid, 13, 30), (v_vsoc_table_uuid, 12.99, 29),
    (v_vsoc_table_uuid, 12.98, 28), (v_vsoc_table_uuid, 12.97, 27), (v_vsoc_table_uuid, 12.96, 26),
    (v_vsoc_table_uuid, 12.95, 25), (v_vsoc_table_uuid, 12.94, 24), (v_vsoc_table_uuid, 12.93, 23),
    (v_vsoc_table_uuid, 12.92, 22), (v_vsoc_table_uuid, 12.91, 21), (v_vsoc_table_uuid, 12.9, 20),
    (v_vsoc_table_uuid, 12.89, 19.5), (v_vsoc_table_uuid, 12.88, 19), (v_vsoc_table_uuid, 12.87, 18.5),
    (v_vsoc_table_uuid, 12.86, 18), (v_vsoc_table_uuid, 12.85, 17.5), (v_vsoc_table_uuid, 12.84, 17),
    (v_vsoc_table_uuid, 12.83, 16.5), (v_vsoc_table_uuid, 12.82, 16), (v_vsoc_table_uuid, 12.81, 15.5),
    (v_vsoc_table_uuid, 12.8, 10), (v_vsoc_table_uuid, 12.79, 9.6), (v_vsoc_table_uuid, 12.78, 9.5),
    (v_vsoc_table_uuid, 12.77, 9.5), (v_vsoc_table_uuid, 12.76, 9.4), (v_vsoc_table_uuid, 12.75, 9.3),
    (v_vsoc_table_uuid, 12.74, 9.3), (v_vsoc_table_uuid, 12.73, 9.2), (v_vsoc_table_uuid, 12.72, 9.1),
    (v_vsoc_table_uuid, 12.71, 9.1), (v_vsoc_table_uuid, 12.7, 9), (v_vsoc_table_uuid, 12.69, 8.9),
    (v_vsoc_table_uuid, 12.68, 8.8), (v_vsoc_table_uuid, 12.67, 8.8), (v_vsoc_table_uuid, 12.66, 8.7),
    (v_vsoc_table_uuid, 12.65, 8.6), (v_vsoc_table_uuid, 12.64, 8.6), (v_vsoc_table_uuid, 12.63, 8.5),
    (v_vsoc_table_uuid, 12.62, 8.4), (v_vsoc_table_uuid, 12.61, 8.4), (v_vsoc_table_uuid, 12.6, 8.3),
    (v_vsoc_table_uuid, 12.59, 8.2), (v_vsoc_table_uuid, 12.58, 9), (v_vsoc_table_uuid, 12.57, 8.9),
    (v_vsoc_table_uuid, 12.56, 8.8), (v_vsoc_table_uuid, 12.55, 8.8), (v_vsoc_table_uuid, 12.54, 8.7),
    (v_vsoc_table_uuid, 12.53, 8.6), (v_vsoc_table_uuid, 12.52, 8.6), (v_vsoc_table_uuid, 12.51, 8.5),
    (v_vsoc_table_uuid, 12.5, 8.4), (v_vsoc_table_uuid, 12.49, 8.4), (v_vsoc_table_uuid, 12.48, 8.3),
    (v_vsoc_table_uuid, 12.47, 8.2), (v_vsoc_table_uuid, 12.46, 8.1), (v_vsoc_table_uuid, 12.45, 8.1),
    (v_vsoc_table_uuid, 12.44, 8), (v_vsoc_table_uuid, 12.43, 7.9), (v_vsoc_table_uuid, 12.42, 7.9),
    (v_vsoc_table_uuid, 12.41, 7.8), (v_vsoc_table_uuid, 12.4, 7.7), (v_vsoc_table_uuid, 12.39, 7.7),
    (v_vsoc_table_uuid, 12.38, 7.6), (v_vsoc_table_uuid, 12.37, 7.5), (v_vsoc_table_uuid, 12.36, 7.4),
    (v_vsoc_table_uuid, 12.35, 7.4), (v_vsoc_table_uuid, 12.34, 7.3), (v_vsoc_table_uuid, 12.33, 7.2),
    (v_vsoc_table_uuid, 12.32, 7.2), (v_vsoc_table_uuid, 12.31, 7.1), (v_vsoc_table_uuid, 12.3, 7),
    (v_vsoc_table_uuid, 12.29, 7), (v_vsoc_table_uuid, 12.28, 6.9), (v_vsoc_table_uuid, 12.27, 6.8),
    (v_vsoc_table_uuid, 12.26, 6.8), (v_vsoc_table_uuid, 12.25, 6.7), (v_vsoc_table_uuid, 12.24, 6.6),
    (v_vsoc_table_uuid, 12.23, 6.6), (v_vsoc_table_uuid, 12.22, 6.5), (v_vsoc_table_uuid, 12.21, 6.4),
    (v_vsoc_table_uuid, 12.2, 6.4), (v_vsoc_table_uuid, 12.19, 6.3), (v_vsoc_table_uuid, 12.18, 6.2),
    (v_vsoc_table_uuid, 12.17, 6.1), (v_vsoc_table_uuid, 12.16, 6.1), (v_vsoc_table_uuid, 12.15, 6),
    (v_vsoc_table_uuid, 12.14, 5.9), (v_vsoc_table_uuid, 12.13, 5.9), (v_vsoc_table_uuid, 12.12, 5.8),
    (v_vsoc_table_uuid, 12.11, 5.7), (v_vsoc_table_uuid, 12.1, 5.7), (v_vsoc_table_uuid, 12.09, 5.6),
    (v_vsoc_table_uuid, 12.08, 5.5), (v_vsoc_table_uuid, 12.07, 5.5), (v_vsoc_table_uuid, 12.06, 5.4),
    (v_vsoc_table_uuid, 12.05, 5.3), (v_vsoc_table_uuid, 12.04, 5.3), (v_vsoc_table_uuid, 12.03, 5.2),
    (v_vsoc_table_uuid, 12.02, 5.1), (v_vsoc_table_uuid, 12.01, 5.1), (v_vsoc_table_uuid, 12, 5),
    (v_vsoc_table_uuid, 11.99, 4.9), (v_vsoc_table_uuid, 11.98, 4.9), (v_vsoc_table_uuid, 11.97, 4.8),
    (v_vsoc_table_uuid, 11.96, 4.7), (v_vsoc_table_uuid, 11.95, 4.7), (v_vsoc_table_uuid, 11.94, 4.6),
    (v_vsoc_table_uuid, 11.93, 4.5), (v_vsoc_table_uuid, 11.92, 4.5), (v_vsoc_table_uuid, 11.91, 4.4),
    (v_vsoc_table_uuid, 11.9, 4.3), (v_vsoc_table_uuid, 11.89, 4.3), (v_vsoc_table_uuid, 11.88, 4.2),
    (v_vsoc_table_uuid, 11.87, 4.1), (v_vsoc_table_uuid, 11.86, 4.1), (v_vsoc_table_uuid, 11.85, 4),
    (v_vsoc_table_uuid, 11.84, 3.9), (v_vsoc_table_uuid, 11.83, 3.9), (v_vsoc_table_uuid, 11.82, 3.8),
    (v_vsoc_table_uuid, 11.81, 3.7), (v_vsoc_table_uuid, 11.8, 3.7), (v_vsoc_table_uuid, 11.79, 3.6),
    (v_vsoc_table_uuid, 11.78, 3.5), (v_vsoc_table_uuid, 11.77, 3.5), (v_vsoc_table_uuid, 11.76, 3.4),
    (v_vsoc_table_uuid, 11.75, 3.3), (v_vsoc_table_uuid, 11.74, 3.3), (v_vsoc_table_uuid, 11.73, 3.2),
    (v_vsoc_table_uuid, 11.72, 3.1), (v_vsoc_table_uuid, 11.71, 3.1), (v_vsoc_table_uuid, 11.7, 3),
    (v_vsoc_table_uuid, 11.69, 2.9), (v_vsoc_table_uuid, 11.68, 2.9), (v_vsoc_table_uuid, 11.67, 2.8),
    (v_vsoc_table_uuid, 11.66, 2.7), (v_vsoc_table_uuid, 11.65, 2.7), (v_vsoc_table_uuid, 11.64, 2.6),
    (v_vsoc_table_uuid, 11.63, 2.5), (v_vsoc_table_uuid, 11.62, 2.5), (v_vsoc_table_uuid, 11.61, 2.4),
    (v_vsoc_table_uuid, 11.6, 2.3), (v_vsoc_table_uuid, 11.59, 2.3), (v_vsoc_table_uuid, 11.58, 2.2),
    (v_vsoc_table_uuid, 11.57, 2.1), (v_vsoc_table_uuid, 11.56, 2.1), (v_vsoc_table_uuid, 11.55, 2),
    (v_vsoc_table_uuid, 11.54, 1.9), (v_vsoc_table_uuid, 11.53, 1.9), (v_vsoc_table_uuid, 11.52, 1.8),
    (v_vsoc_table_uuid, 11.51, 1.7), (v_vsoc_table_uuid, 11.5, 1.7), (v_vsoc_table_uuid, 11.49, 1.6),
    (v_vsoc_table_uuid, 11.48, 1.5), (v_vsoc_table_uuid, 11.47, 1.5), (v_vsoc_table_uuid, 11.46, 1.4),
    (v_vsoc_table_uuid, 11.45, 1.4), (v_vsoc_table_uuid, 11.44, 1.4), (v_vsoc_table_uuid, 11.43, 1.3),
    (v_vsoc_table_uuid, 11.42, 1.3), (v_vsoc_table_uuid, 11.41, 1.3), (v_vsoc_table_uuid, 11.4, 1.2),
    (v_vsoc_table_uuid, 11.39, 1.2), (v_vsoc_table_uuid, 11.38, 1.2), (v_vsoc_table_uuid, 11.37, 1.1),
    (v_vsoc_table_uuid, 11.36, 1.1), (v_vsoc_table_uuid, 11.35, 1.1), (v_vsoc_table_uuid, 11.34, 1),
    (v_vsoc_table_uuid, 11.33, 1), (v_vsoc_table_uuid, 11.32, 1), (v_vsoc_table_uuid, 11.31, 1),
    (v_vsoc_table_uuid, 11.3, 1), (v_vsoc_table_uuid, 11.29, 1), (v_vsoc_table_uuid, 11.28, 1),
    (v_vsoc_table_uuid, 11.27, 1), (v_vsoc_table_uuid, 11.26, 1), (v_vsoc_table_uuid, 11.25, 1),
    (v_vsoc_table_uuid, 11.24, 1), (v_vsoc_table_uuid, 11.23, 1), (v_vsoc_table_uuid, 11.22, 1),
    (v_vsoc_table_uuid, 11.21, 1), (v_vsoc_table_uuid, 11.2, 1), (v_vsoc_table_uuid, 11.19, 1),
    (v_vsoc_table_uuid, 11.18, 1), (v_vsoc_table_uuid, 11.17, 1), (v_vsoc_table_uuid, 11.16, 1),
    (v_vsoc_table_uuid, 11.15, 1), (v_vsoc_table_uuid, 11.14, 1), (v_vsoc_table_uuid, 11.13, 1),
    (v_vsoc_table_uuid, 11.12, 1), (v_vsoc_table_uuid, 11.11, 1), (v_vsoc_table_uuid, 11.1, 1),
    (v_vsoc_table_uuid, 11.09, 1), (v_vsoc_table_uuid, 11.08, 1), (v_vsoc_table_uuid, 11.07, 1),
    (v_vsoc_table_uuid, 11.06, 1), (v_vsoc_table_uuid, 11.05, 1), (v_vsoc_table_uuid, 11.04, 1),
    (v_vsoc_table_uuid, 11.03, 1), (v_vsoc_table_uuid, 11.02, 1), (v_vsoc_table_uuid, 11.01, 1),
    (v_vsoc_table_uuid, 11, 1), (v_vsoc_table_uuid, 10.99, 1), (v_vsoc_table_uuid, 10.98, 1),
    (v_vsoc_table_uuid, 10.97, 1), (v_vsoc_table_uuid, 10.96, 1), (v_vsoc_table_uuid, 10.95, 1),
    (v_vsoc_table_uuid, 10.94, 1), (v_vsoc_table_uuid, 10.93, 1), (v_vsoc_table_uuid, 10.92, 1),
    (v_vsoc_table_uuid, 10.91, 1), (v_vsoc_table_uuid, 10.9, 1), (v_vsoc_table_uuid, 10.89, 1),
    (v_vsoc_table_uuid, 10.88, 1), (v_vsoc_table_uuid, 10.87, 1), (v_vsoc_table_uuid, 10.86, 1),
    (v_vsoc_table_uuid, 10.85, 1), (v_vsoc_table_uuid, 10.84, 1), (v_vsoc_table_uuid, 10.83, 1),
    (v_vsoc_table_uuid, 10.82, 1), (v_vsoc_table_uuid, 10.81, 1), (v_vsoc_table_uuid, 10.8, 1);

  -- ====================================
  -- PASO 3: Crear el perfil de batería principal
  -- ====================================
  INSERT INTO battery_profiles (
    name, chemistry, nominal_voltage, battery_capacity_ah, battery_capacity_wh, battery_capacity_kwh,
    battery_configuration, number_of_batteries, battery_capacity_each, voltage_soc_table_id,
    created_at, updated_at
  ) VALUES (
    'Perfil Principal', 'LiFePO₄', 12.8, 108, 1380, 1.38, '6 baterías de 12.8V/18Ah en paralelo',
    6, 18, v_vsoc_table_uuid, '2025-08-10T00:54:39.640Z', '2025-08-31T21:32:38.611Z'
  ) RETURNING id INTO v_profile_uuid;
  
  -- ====================================
  -- PASO 4: Insertar la configuración del sistema solar
  -- ====================================
  INSERT INTO solar_system_config (
    profile_id, solar_power_total, number_of_panels, panel_power_each, panel_type, panel_configuration,
    panel_voltage, panel_current, controller_type, controller_capacity
  ) VALUES (
    v_profile_uuid, 720, 12, 60, 'Monocristalino', '12 paneles en paralelo', 18, 3.2, 'MPPT', 30
  );

  -- ====================================
  -- PASO 5: Insertar los tramos de consumo
  -- ====================================
  INSERT INTO consumption_segments (
    profile_id, segment_id, name, period_label, start_hour, end_hour,
    watts, hours, wh, ah, color
  ) VALUES
    (v_profile_uuid, 'A', 'Tramo A', '17:00-19:00', 17, 19, 15, 2, 30, 2.3, 'bg-green-500'),
    (v_profile_uuid, 'B', 'Tramo B', '19:00-00:00', 19, 24, 50, 5, 250, 19.5, 'bg-orange-500'),
    (v_profile_uuid, 'C', 'Tramo C', '00:00-06:00', 0, 6, 23, 6, 138, 10.8, 'bg-yellow-500'),
    (v_profile_uuid, 'D', 'Tramo D', '06:00-08:00', 6, 8, 7, 2, 14, 1.1, 'bg-green-500'),
    (v_profile_uuid, 'custom-1755353024346', 'RefriCervecera ', '00:00-00:00', 0, 24, 0, 24, 0, 0, 'bg-blue-500'),
    (v_profile_uuid, 'custom-1755630149513', 'Inversor ', '00:00-00:00', 0, 24, 8, 24, 192, 15, 'bg-blue-500');

  -- ====================================
  -- PASO 6: Insertar el historial de registros diarios de SOC
  -- CORRECCIÓN (v2): El número de registros es 61. Se trunca la lista para que coincida.
  -- ====================================
  RAISE NOTICE 'Paso 6: Insertando 61 registros en daily_soc_records...';
  INSERT INTO daily_soc_records (profile_id, date, soc, created_at) VALUES
    (v_profile_uuid, '2025-06-29', 90, '2025-06-29T22:00:00.000Z'),
    (v_profile_uuid, '2025-06-30', 80, '2025-06-30T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-01', 80, '2025-07-01T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-02', 100, '2025-07-02T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-04', 95, '2025-07-04T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-05', 85, '2025-07-05T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-06', 100, '2025-07-06T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-07', 100, '2025-07-07T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-08', 100, '2025-07-08T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-09', 100, '2025-07-09T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-10', 100, '2025-07-10T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-11', 88, '2025-07-11T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-12', 100, '2025-07-12T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-13', 100, '2025-07-13T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-14', 100, '2025-07-14T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-15', 100, '2025-07-15T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-16', 100, '2025-07-16T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-17', 100, '2025-07-17T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-18', 100, '2025-07-18T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-19', 100, '2025-07-19T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-20', 100, '2025-07-20T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-21', 100, '2025-07-21T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-22', 100, '2025-07-22T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-23', 100, '2025-07-23T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-24', 100, '2025-07-24T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-25', 100, '2025-07-25T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-26', 100, '2025-07-26T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-27', 100, '2025-07-27T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-28', 80, '2025-07-28T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-29', 100, '2025-07-29T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-30', 100, '2025-07-30T22:00:00.000Z'),
    (v_profile_uuid, '2025-07-31', 100, '2025-07-31T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-01', 100, '2025-08-01T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-02', 100, '2025-08-02T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-03', 100, '2025-08-03T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-04', 100, '2025-08-04T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-05', 90, '2025-08-05T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-06', 80, '2025-08-06T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-07', 87, '2025-08-07T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-08', 90, '2025-08-08T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-09', 100, '2025-08-09T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-10', 100, '2025-08-10T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-11', 100, '2025-08-11T22:00:00.000Z'),
    (v_profile_uuid, '2025-08-12', 100, '2025-08-12T20:56:23.292Z'),
    (v_profile_uuid, '2025-08-13', 100, '2025-08-13T20:40:42.550Z'),
    (v_profile_uuid, '2025-08-14', 100, '2025-08-14T19:01:20.076Z'),
    (v_profile_uuid, '2025-08-16', 100, '2025-08-16T05:45:30.064Z'),
    (v_profile_uuid, '2025-08-17', 92.3, '2025-08-17T22:33:31.039Z'),
    (v_profile_uuid, '2025-08-18', 79.3, '2025-08-18T23:03:30.784Z'),
    (v_profile_uuid, '2025-08-19', 88.7, '2025-08-19T22:06:12.535Z'),
    (v_profile_uuid, '2025-08-20', 86.7, '2025-08-20T23:00:00.000Z'),
    (v_profile_uuid, '2025-08-21', 100, '2025-08-21T23:00:00.000Z'),
    (v_profile_uuid, '2025-08-23', 100, '2025-08-23T20:06:50.018Z'),
    (v_profile_uuid, '2025-08-24', 90.7, '2025-08-24T20:52:48.786Z'),
    (v_profile_uuid, '2025-08-25', 76.7, '2025-08-25T21:09:06.387Z'),
    (v_profile_uuid, '2025-08-26', 89.3, '2025-08-26T23:53:39.905Z'),
    (v_profile_uuid, '2025-08-27', 91.1, '2025-08-27T21:29:33.459Z'),
    (v_profile_uuid, '2025-08-28', 100, '2025-08-28T21:10:01.718Z'),
    (v_profile_uuid, '2025-08-29', 100, '2025-08-29T21:35:36.643Z'),
    (v_profile_uuid, '2025-08-30', 100, '2025-08-30T21:04:31.400Z'),
    (v_profile_uuid, '2025-08-31', 100, '2025-08-31T21:32:38.610Z');


  -- ====================================
  -- PASO 7: Insertar las preferencias de usuario
  -- ====================================
  INSERT INTO user_preferences (
    active_battery_profile_id, current_voltage, theme, app_theme, timezone, updated_at
  ) VALUES (
    v_profile_uuid, 13.8, 'light', 'default', 'America/Guayaquil', '2025-08-31T21:32:50.825Z'
  );

  -- ====================================
  -- VERIFICACIONES FINALES
  -- CORRECCIÓN (v2): Se actualizan los conteos a los valores correctos.
  -- ====================================
  RAISE NOTICE 'Paso 8: Verificando integridad de los datos...';
  
  IF (SELECT COUNT(*) FROM voltage_soc_points WHERE table_id = v_vsoc_table_uuid) != 351 THEN
    RAISE EXCEPTION 'Error: Se esperaban 351 puntos de voltaje-SOC, pero se insertaron %', (SELECT COUNT(*) FROM voltage_soc_points WHERE table_id = v_vsoc_table_uuid);
  END IF;
  
  IF (SELECT COUNT(*) FROM daily_soc_records WHERE profile_id = v_profile_uuid) != 61 THEN
    RAISE EXCEPTION 'Error: Se esperaban 61 registros de SOC, pero se insertaron %', (SELECT COUNT(*) FROM daily_soc_records WHERE profile_id = v_profile_uuid);
  END IF;

  RAISE NOTICE '¡MIGRACIÓN COMPLETADA EXITOSAMENTE!';

END $$;