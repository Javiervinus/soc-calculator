-- ====================================
-- SOC Calculator - Import Backup Data
-- ====================================
-- Migracion para importar datos del backup "Perfil Principal Aug 31 2025"
-- Basado en backup JSON exportado desde localStorage

-- ====================================
-- LIMPIAR DATOS EXISTENTES PRIMERO
-- ====================================

-- Eliminar datos en orden correcto para respetar foreign keys
DELETE FROM user_preferences;
DELETE FROM daily_soc_records;
DELETE FROM consumption_segments;
DELETE FROM solar_system_config;
DELETE FROM voltage_readings;
DELETE FROM battery_profiles;
DELETE FROM voltage_soc_points;
DELETE FROM voltage_soc_tables;
DELETE FROM solar_predictions_cache;

-- ====================================
-- IMPORTAR TODOS LOS DATOS EN UNA TRANSACCION
-- ====================================

WITH 
-- 1. Crear tabla de conversion voltaje-SOC
voltage_table AS (
  INSERT INTO voltage_soc_tables (
    id,
    name,
    description,
    is_default,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'LiFePO4 Principal',
    'Tabla de conversion calibrada para sistema principal de 108Ah',
    true,
    '2025-08-10T00:54:39.640Z'::timestamptz
  ) 
  RETURNING id
),

-- 2. Insertar todos los puntos de conversion voltaje-SOC (149 puntos)
voltage_points AS (
  INSERT INTO voltage_soc_points (table_id, voltage, soc) 
  SELECT vt.id, points.voltage, points.soc
  FROM voltage_table vt,
  (VALUES
    -- Zona de 100% SOC (14.3V - 13.8V)
    (14.30, 100.0), (14.29, 100.0), (14.28, 100.0), (14.27, 100.0), (14.26, 100.0),
    (14.25, 100.0), (14.24, 100.0), (14.23, 100.0), (14.22, 100.0), (14.21, 100.0),
    (14.20, 100.0), (14.19, 100.0), (14.18, 100.0), (14.17, 100.0), (14.16, 100.0),
    (14.15, 100.0), (14.14, 100.0), (14.13, 100.0), (14.12, 100.0), (14.11, 100.0),
    (14.10, 100.0), (14.09, 100.0), (14.08, 100.0), (14.07, 100.0), (14.06, 100.0),
    (14.05, 100.0), (14.04, 100.0), (14.03, 100.0), (14.02, 100.0), (14.01, 100.0),
    (14.00, 100.0), (13.99, 100.0), (13.98, 100.0), (13.97, 100.0), (13.96, 100.0),
    (13.95, 100.0), (13.94, 100.0), (13.93, 100.0), (13.92, 100.0), (13.91, 100.0),
    (13.90, 100.0), (13.89, 100.0), (13.88, 100.0), (13.87, 100.0), (13.86, 100.0),
    (13.85, 100.0), (13.84, 100.0), (13.83, 100.0), (13.82, 100.0), (13.81, 100.0),
    (13.80, 100.0),
    -- Zona de transicion (13.79V - 13.70V)
    (13.79, 99.9), (13.78, 99.8), (13.77, 99.7), (13.76, 99.6), (13.75, 99.5),
    (13.74, 99.4), (13.73, 99.3), (13.72, 99.2), (13.71, 99.1), (13.70, 99.0),
    -- Zona de descarga progresiva (13.69V - 13.50V)
    (13.69, 98.6), (13.68, 98.2), (13.67, 97.7), (13.66, 97.3), (13.65, 96.8),
    (13.64, 96.4), (13.63, 96.0), (13.62, 95.5), (13.61, 95.1), (13.60, 94.6),
    (13.59, 94.2), (13.58, 93.8), (13.57, 93.3), (13.56, 92.9), (13.55, 92.4),
    (13.54, 92.0), (13.53, 91.6), (13.52, 91.1), (13.51, 90.7), (13.50, 90.0),
    -- Zona de descarga rapida (13.49V - 13.20V)
    (13.49, 89.3), (13.48, 88.7), (13.47, 88.0), (13.46, 87.3), (13.45, 86.7),
    (13.44, 86.0), (13.43, 85.3), (13.42, 84.7), (13.41, 84.0), (13.40, 83.3),
    (13.39, 82.7), (13.38, 82.0), (13.37, 81.3), (13.36, 80.7), (13.35, 80.0),
    (13.34, 79.3), (13.33, 78.7), (13.32, 78.0), (13.31, 77.3), (13.30, 76.7),
    (13.29, 76.0), (13.28, 75.3), (13.27, 74.7), (13.26, 74.0), (13.25, 73.3),
    (13.24, 72.7), (13.23, 72.0), (13.22, 71.3), (13.21, 70.7), (13.20, 70.0),
    -- Zona critica (13.19V - 13.10V)
    (13.19, 67.0), (13.18, 64.0), (13.17, 61.0), (13.16, 58.0), (13.15, 55.0),
    (13.14, 52.0), (13.13, 49.0), (13.12, 46.0), (13.11, 43.0), (13.10, 40.0),
    -- Zona baja (13.09V - 12.90V)
    (13.09, 39.0), (13.08, 38.0), (13.07, 37.0), (13.06, 36.0), (13.05, 35.0),
    (13.04, 34.0), (13.03, 33.0), (13.02, 32.0), (13.01, 31.0), (13.00, 30.0),
    (12.99, 29.0), (12.98, 28.0), (12.97, 27.0), (12.96, 26.0), (12.95, 25.0),
    (12.94, 24.0), (12.93, 23.0), (12.92, 22.0), (12.91, 21.0), (12.90, 20.0),
    -- Zona peligrosa (12.89V - 12.81V)
    (12.89, 19.5), (12.88, 19.0), (12.87, 18.5), (12.86, 18.0), (12.85, 17.5),
    (12.84, 17.0), (12.83, 16.5), (12.82, 16.0), (12.81, 15.5),
    -- Caida abrupta (12.80V y por debajo)
    (12.80, 10.0), (12.79, 9.6), (12.78, 9.5), (12.77, 9.5), (12.76, 9.4),
    (12.75, 9.3), (12.74, 9.3), (12.73, 9.2), (12.72, 9.1), (12.71, 9.1),
    (12.70, 9.0), (12.69, 8.9), (12.68, 8.8), (12.67, 8.8), (12.66, 8.7),
    (12.65, 8.6), (12.64, 8.6), (12.63, 8.5), (12.62, 8.4), (12.61, 8.4),
    (12.60, 8.3), (12.59, 8.2), (12.58, 9.0), (12.57, 8.9), (12.56, 8.8),
    (12.55, 8.8), (12.54, 8.7), (12.53, 8.6), (12.52, 8.6), (12.51, 8.5),
    (12.50, 8.4), (12.49, 8.4), (12.48, 8.3), (12.47, 8.2), (12.46, 8.1),
    (12.45, 8.1), (12.44, 8.0), (12.43, 7.9), (12.42, 7.9), (12.41, 7.8),
    (12.40, 7.7), (12.39, 7.7), (12.38, 7.6), (12.37, 7.5), (12.36, 7.4),
    (12.35, 7.4), (12.34, 7.3), (12.33, 7.2), (12.32, 7.2), (12.31, 7.1),
    (12.30, 7.0), (12.29, 7.0), (12.28, 6.9), (12.27, 6.8), (12.26, 6.8),
    (12.25, 6.7), (12.24, 6.6), (12.23, 6.6), (12.22, 6.5), (12.21, 6.4),
    (12.20, 6.4), (12.19, 6.3), (12.18, 6.2), (12.17, 6.1), (12.16, 6.1),
    (12.15, 6.0), (12.14, 5.9), (12.13, 5.9), (12.12, 5.8), (12.11, 5.7),
    (12.10, 5.7), (12.09, 5.6), (12.08, 5.5), (12.07, 5.5), (12.06, 5.4),
    (12.05, 5.3), (12.04, 5.3), (12.03, 5.2), (12.02, 5.1), (12.01, 5.1),
    (12.00, 5.0),
    -- Zona extrema (por debajo de 12V)
    (11.99, 4.9), (11.98, 4.9), (11.97, 4.8), (11.96, 4.7), (11.95, 4.7),
    (11.94, 4.6), (11.93, 4.5), (11.92, 4.5), (11.91, 4.4), (11.90, 4.3),
    (11.89, 4.3), (11.88, 4.2), (11.87, 4.1), (11.86, 4.1), (11.85, 4.0),
    (11.84, 3.9), (11.83, 3.9), (11.82, 3.8), (11.81, 3.7), (11.80, 3.7),
    (11.79, 3.6), (11.78, 3.5), (11.77, 3.5), (11.76, 3.4), (11.75, 3.3),
    (11.74, 3.3), (11.73, 3.2), (11.72, 3.1), (11.71, 3.1), (11.70, 3.0),
    (11.69, 2.9), (11.68, 2.9), (11.67, 2.8), (11.66, 2.7), (11.65, 2.7),
    (11.64, 2.6), (11.63, 2.5), (11.62, 2.5), (11.61, 2.4), (11.60, 2.3),
    (11.59, 2.3), (11.58, 2.2), (11.57, 2.1), (11.56, 2.1), (11.55, 2.0),
    (11.54, 1.9), (11.53, 1.9), (11.52, 1.8), (11.51, 1.7), (11.50, 1.7),
    (11.49, 1.6), (11.48, 1.5), (11.47, 1.5), (11.46, 1.4), (11.45, 1.4),
    (11.44, 1.4), (11.43, 1.3), (11.42, 1.3), (11.41, 1.3), (11.40, 1.2),
    (11.39, 1.2), (11.38, 1.2), (11.37, 1.1), (11.36, 1.1), (11.35, 1.1),
    (11.34, 1.0), (11.33, 1.0), (11.32, 1.0), (11.31, 1.0), (11.30, 1.0),
    (11.29, 1.0), (11.28, 1.0), (11.27, 1.0), (11.26, 1.0), (11.25, 1.0),
    (11.24, 1.0), (11.23, 1.0), (11.22, 1.0), (11.21, 1.0), (11.20, 1.0),
    (11.19, 1.0), (11.18, 1.0), (11.17, 1.0), (11.16, 1.0), (11.15, 1.0),
    (11.14, 1.0), (11.13, 1.0), (11.12, 1.0), (11.11, 1.0), (11.10, 1.0),
    (11.09, 1.0), (11.08, 1.0), (11.07, 1.0), (11.06, 1.0), (11.05, 1.0),
    (11.04, 1.0), (11.03, 1.0), (11.02, 1.0), (11.01, 1.0), (11.00, 1.0),
    (10.99, 1.0), (10.98, 1.0), (10.97, 1.0), (10.96, 1.0), (10.95, 1.0),
    (10.94, 1.0), (10.93, 1.0), (10.92, 1.0), (10.91, 1.0), (10.90, 1.0),
    (10.89, 1.0), (10.88, 1.0), (10.87, 1.0), (10.86, 1.0), (10.85, 1.0),
    (10.84, 1.0), (10.83, 1.0), (10.82, 1.0), (10.81, 1.0), (10.80, 1.0)
  ) AS points(voltage, soc)
  RETURNING id
),

-- 3. Crear perfil de bateria principal
battery_profile AS (
  INSERT INTO battery_profiles (
    id,
    name,
    chemistry,
    nominal_voltage,
    battery_capacity_ah,
    battery_capacity_wh,
    battery_capacity_kwh,
    battery_configuration,
    number_of_batteries,
    battery_capacity_each,
    min_voltage,
    max_voltage,
    safety_reserve_percent,
    daily_consumption_ah,
    voltage_soc_table_id,
    is_active,
    created_at,
    updated_at
  ) 
  SELECT 
    gen_random_uuid(),
    'Perfil Principal',
    'LiFePO4',
    12.8,
    108,
    1380,
    1.38,
    '6 baterias de 12.8V/18Ah en paralelo',
    6,
    18,
    10.0,
    14.6,
    20,
    45,
    vt.id,
    true,
    '2025-08-10T00:54:39.640Z'::timestamptz,
    '2025-08-31T21:32:38.611Z'::timestamptz
  FROM voltage_table vt
  RETURNING id
),

-- 4. Crear configuracion sistema solar
solar_config AS (
  INSERT INTO solar_system_config (
    profile_id,
    solar_power_total,
    number_of_panels,
    panel_power_each,
    panel_type,
    panel_configuration,
    panel_voltage,
    panel_current,
    controller_type,
    controller_capacity,
    created_at,
    updated_at
  )
  SELECT 
    bp.id,
    720,
    12,
    60,
    'Monocristalino',
    '12 paneles en paralelo',
    18,
    3.2,
    'MPPT',
    30,
    '2025-08-10T00:54:39.640Z'::timestamptz,
    '2025-08-31T21:32:38.611Z'::timestamptz
  FROM battery_profile bp
  RETURNING id
),

-- 5. Crear tramos de consumo
consumption_segments_insert AS (
  INSERT INTO consumption_segments (
    profile_id,
    segment_id,
    name,
    period_label,
    start_hour,
    end_hour,
    watts,
    hours,
    wh,
    ah,
    color,
    is_active,
    created_at,
    updated_at
  )
  SELECT 
    bp.id,
    segments.segment_id,
    segments.name,
    segments.period_label,
    segments.start_hour,
    segments.end_hour,
    segments.watts,
    segments.hours,
    segments.wh,
    segments.ah,
    segments.color,
    segments.is_active,
    segments.created_at,
    segments.updated_at
  FROM battery_profile bp,
  (VALUES 
    -- Tramo A: 17:00-19:00
    ('A', 'Tramo A', '17:00-19:00', 17, 19, 15::decimal, 2.0::decimal, 30::decimal, 2.3::decimal, 'bg-green-500', true, '2025-08-10T00:54:39.640Z'::timestamptz, '2025-08-31T21:32:38.611Z'::timestamptz),
    -- Tramo B: 19:00-00:00
    ('B', 'Tramo B', '19:00-00:00', 19, 24, 50::decimal, 5.0::decimal, 250::decimal, 19.5::decimal, 'bg-orange-500', true, '2025-08-10T00:54:39.640Z'::timestamptz, '2025-08-31T21:32:38.611Z'::timestamptz),
    -- Tramo C: 00:00-06:00
    ('C', 'Tramo C', '00:00-06:00', 0, 6, 23::decimal, 6.0::decimal, 138::decimal, 10.8::decimal, 'bg-yellow-500', true, '2025-08-10T00:54:39.640Z'::timestamptz, '2025-08-31T21:32:38.611Z'::timestamptz),
    -- Tramo D: 06:00-08:00
    ('D', 'Tramo D', '06:00-08:00', 6, 8, 7::decimal, 2.0::decimal, 14::decimal, 1.1::decimal, 'bg-green-500', true, '2025-08-10T00:54:39.640Z'::timestamptz, '2025-08-31T21:32:38.611Z'::timestamptz),
    -- RefriCervecera (24 horas, 0W)
    ('custom-1755353024346', 'RefriCervecera', '00:00-00:00', 0, 24, 0::decimal, 24.0::decimal, 0::decimal, 0.0::decimal, 'bg-blue-500', true, '2025-08-10T00:54:39.640Z'::timestamptz, '2025-08-31T21:32:38.611Z'::timestamptz),
    -- Inversor (24 horas, 8W)
    ('custom-1755630149513', 'Inversor', '00:00-00:00', 0, 24, 8::decimal, 24.0::decimal, 192::decimal, 15.0::decimal, 'bg-blue-500', true, '2025-08-10T00:54:39.640Z'::timestamptz, '2025-08-31T21:32:38.611Z'::timestamptz)
  ) AS segments(segment_id, name, period_label, start_hour, end_hour, watts, hours, wh, ah, color, is_active, created_at, updated_at)
  RETURNING id
),

-- 6. Crear registros historicos SOC
daily_records_insert AS (
  INSERT INTO daily_soc_records (
    profile_id,
    date,
    soc,
    voltage,
    created_at
  )
  SELECT 
    bp.id,
    records.date,
    records.soc,
    records.voltage,
    records.created_at
  FROM battery_profile bp,
  (VALUES 
    -- Registros historicos (56 entradas desde junio hasta agosto)
    ('2025-06-29'::date, 90, NULL::decimal(4,2), '2025-06-29T22:00:00.000Z'::timestamptz),
    ('2025-06-30'::date, 80, NULL::decimal(4,2), '2025-06-30T22:00:00.000Z'::timestamptz),
    ('2025-07-01'::date, 80, NULL::decimal(4,2), '2025-07-01T22:00:00.000Z'::timestamptz),
    ('2025-07-02'::date, 100, NULL::decimal(4,2), '2025-07-02T22:00:00.000Z'::timestamptz),
    ('2025-07-04'::date, 95, NULL::decimal(4,2), '2025-07-04T22:00:00.000Z'::timestamptz),
    ('2025-07-05'::date, 85, NULL::decimal(4,2), '2025-07-05T22:00:00.000Z'::timestamptz),
    ('2025-07-06'::date, 100, NULL::decimal(4,2), '2025-07-06T22:00:00.000Z'::timestamptz),
    ('2025-07-07'::date, 100, NULL::decimal(4,2), '2025-07-07T22:00:00.000Z'::timestamptz),
    ('2025-07-08'::date, 100, NULL::decimal(4,2), '2025-07-08T22:00:00.000Z'::timestamptz),
    ('2025-07-09'::date, 100, NULL::decimal(4,2), '2025-07-09T22:00:00.000Z'::timestamptz),
    ('2025-07-10'::date, 100, NULL::decimal(4,2), '2025-07-10T22:00:00.000Z'::timestamptz),
    ('2025-07-11'::date, 88, NULL::decimal(4,2), '2025-07-11T22:00:00.000Z'::timestamptz),
    ('2025-07-12'::date, 100, NULL::decimal(4,2), '2025-07-12T22:00:00.000Z'::timestamptz),
    ('2025-07-13'::date, 100, NULL::decimal(4,2), '2025-07-13T22:00:00.000Z'::timestamptz),
    ('2025-07-14'::date, 100, NULL::decimal(4,2), '2025-07-14T22:00:00.000Z'::timestamptz),
    ('2025-07-15'::date, 100, NULL::decimal(4,2), '2025-07-15T22:00:00.000Z'::timestamptz),
    ('2025-07-16'::date, 100, NULL::decimal(4,2), '2025-07-16T22:00:00.000Z'::timestamptz),
    ('2025-07-17'::date, 100, NULL::decimal(4,2), '2025-07-17T22:00:00.000Z'::timestamptz),
    ('2025-07-18'::date, 100, NULL::decimal(4,2), '2025-07-18T22:00:00.000Z'::timestamptz),
    ('2025-07-19'::date, 100, NULL::decimal(4,2), '2025-07-19T22:00:00.000Z'::timestamptz),
    ('2025-07-20'::date, 100, NULL::decimal(4,2), '2025-07-20T22:00:00.000Z'::timestamptz),
    ('2025-07-21'::date, 100, NULL::decimal(4,2), '2025-07-21T22:00:00.000Z'::timestamptz),
    ('2025-07-22'::date, 100, NULL::decimal(4,2), '2025-07-22T22:00:00.000Z'::timestamptz),
    ('2025-07-23'::date, 100, NULL::decimal(4,2), '2025-07-23T22:00:00.000Z'::timestamptz),
    ('2025-07-24'::date, 100, NULL::decimal(4,2), '2025-07-24T22:00:00.000Z'::timestamptz),
    ('2025-07-25'::date, 100, NULL::decimal(4,2), '2025-07-25T22:00:00.000Z'::timestamptz),
    ('2025-07-26'::date, 100, NULL::decimal(4,2), '2025-07-26T22:00:00.000Z'::timestamptz),
    ('2025-07-27'::date, 100, NULL::decimal(4,2), '2025-07-27T22:00:00.000Z'::timestamptz),
    ('2025-07-28'::date, 80, NULL::decimal(4,2), '2025-07-28T22:00:00.000Z'::timestamptz),
    ('2025-07-29'::date, 100, NULL::decimal(4,2), '2025-07-29T22:00:00.000Z'::timestamptz),
    ('2025-07-30'::date, 100, NULL::decimal(4,2), '2025-07-30T22:00:00.000Z'::timestamptz),
    ('2025-07-31'::date, 100, NULL::decimal(4,2), '2025-07-31T22:00:00.000Z'::timestamptz),
    ('2025-08-01'::date, 100, NULL::decimal(4,2), '2025-08-01T22:00:00.000Z'::timestamptz),
    ('2025-08-02'::date, 100, NULL::decimal(4,2), '2025-08-02T22:00:00.000Z'::timestamptz),
    ('2025-08-03'::date, 100, NULL::decimal(4,2), '2025-08-03T22:00:00.000Z'::timestamptz),
    ('2025-08-04'::date, 100, NULL::decimal(4,2), '2025-08-04T22:00:00.000Z'::timestamptz),
    ('2025-08-05'::date, 90, NULL::decimal(4,2), '2025-08-05T22:00:00.000Z'::timestamptz),
    ('2025-08-06'::date, 80, NULL::decimal(4,2), '2025-08-06T22:00:00.000Z'::timestamptz),
    ('2025-08-07'::date, 87, NULL::decimal(4,2), '2025-08-07T22:00:00.000Z'::timestamptz),
    ('2025-08-08'::date, 90, NULL::decimal(4,2), '2025-08-08T22:00:00.000Z'::timestamptz),
    ('2025-08-09'::date, 100, NULL::decimal(4,2), '2025-08-09T22:00:00.000Z'::timestamptz),
    ('2025-08-10'::date, 100, NULL::decimal(4,2), '2025-08-10T22:00:00.000Z'::timestamptz),
    ('2025-08-11'::date, 100, NULL::decimal(4,2), '2025-08-11T22:00:00.000Z'::timestamptz),
    ('2025-08-12'::date, 100, NULL::decimal(4,2), '2025-08-12T20:56:23.292Z'::timestamptz),
    ('2025-08-13'::date, 100, NULL::decimal(4,2), '2025-08-13T20:40:42.550Z'::timestamptz),
    ('2025-08-14'::date, 100, NULL::decimal(4,2), '2025-08-14T19:01:20.076Z'::timestamptz),
    ('2025-08-16'::date, 100, NULL::decimal(4,2), '2025-08-16T05:45:30.064Z'::timestamptz),
    ('2025-08-17'::date, 92, NULL::decimal(4,2), '2025-08-17T22:33:31.039Z'::timestamptz),
    ('2025-08-18'::date, 79, NULL::decimal(4,2), '2025-08-18T23:03:30.784Z'::timestamptz),
    ('2025-08-19'::date, 89, NULL::decimal(4,2), '2025-08-19T22:06:12.535Z'::timestamptz),
    ('2025-08-20'::date, 87, NULL::decimal(4,2), '2025-08-20T23:00:00.000Z'::timestamptz),
    ('2025-08-21'::date, 100, NULL::decimal(4,2), '2025-08-21T23:00:00.000Z'::timestamptz),
    ('2025-08-23'::date, 100, NULL::decimal(4,2), '2025-08-23T20:06:50.018Z'::timestamptz),
    ('2025-08-24'::date, 91, NULL::decimal(4,2), '2025-08-24T20:52:48.786Z'::timestamptz),
    ('2025-08-25'::date, 77, NULL::decimal(4,2), '2025-08-25T21:09:06.387Z'::timestamptz),
    ('2025-08-26'::date, 89, NULL::decimal(4,2), '2025-08-26T23:53:39.905Z'::timestamptz),
    ('2025-08-27'::date, 91, NULL::decimal(4,2), '2025-08-27T21:29:33.459Z'::timestamptz),
    ('2025-08-28'::date, 100, NULL::decimal(4,2), '2025-08-28T21:10:01.718Z'::timestamptz),
    ('2025-08-29'::date, 100, NULL::decimal(4,2), '2025-08-29T21:35:36.643Z'::timestamptz),
    ('2025-08-30'::date, 100, NULL::decimal(4,2), '2025-08-30T21:04:31.400Z'::timestamptz),
    ('2025-08-31'::date, 100, NULL::decimal(4,2), '2025-08-31T21:32:38.610Z'::timestamptz)
  ) AS records(date, soc, voltage, created_at)
  RETURNING id
),

-- 7. Configurar user preferences
user_prefs_insert AS (
  INSERT INTO user_preferences (
    active_battery_profile_id,
    current_voltage,
    theme,
    app_theme,
    timezone,
    prediction_efficiency,
    prediction_tilt_angle,
    prediction_azimuth,
    prediction_temperature_coefficient,
    created_at,
    updated_at
  )
  SELECT 
    bp.id,
    13.8,
    'light',
    'default',
    'America/Guayaquil',
    0.75,
    10,
    0,
    -0.004,
    '2025-08-10T00:54:39.640Z'::timestamptz,
    '2025-08-31T21:32:38.611Z'::timestamptz
  FROM battery_profile bp
  RETURNING id
)

-- Final SELECT para obtener resultados del CTE
SELECT 
  'DATOS IMPORTADOS CORRECTAMENTE' AS status,
  vt.id AS voltage_table_id,
  bp.id AS battery_profile_id,
  sc.id AS solar_config_id
FROM 
  voltage_table vt,
  battery_profile bp,
  solar_config sc,
  consumption_segments_insert csi,
  daily_records_insert dri,
  user_prefs_insert upi;

-- ====================================
-- VERIFICACIONES FINALES
-- ====================================

-- Mostrar resumen de datos importados (sin validaciones estrictas)
DO $$
DECLARE
  voltage_points_count INTEGER;
  profiles_count INTEGER;
  solar_config_count INTEGER;
  segments_count INTEGER;
  history_count INTEGER;
  preferences_count INTEGER;
BEGIN
  -- Contar registros insertados
  SELECT COUNT(*) INTO voltage_points_count FROM voltage_soc_points;
  SELECT COUNT(*) INTO profiles_count FROM battery_profiles;
  SELECT COUNT(*) INTO solar_config_count FROM solar_system_config;
  SELECT COUNT(*) INTO segments_count FROM consumption_segments;
  SELECT COUNT(*) INTO history_count FROM daily_soc_records;
  SELECT COUNT(*) INTO preferences_count FROM user_preferences;
  
  RAISE NOTICE 'Migracion completada - Resumen de datos:';
  RAISE NOTICE '   - % puntos voltaje-SOC insertados', voltage_points_count;
  RAISE NOTICE '   - % perfil(es) de bateria creado(s)', profiles_count;
  RAISE NOTICE '   - % configuracion(es) solar creada(s)', solar_config_count;
  RAISE NOTICE '   - % tramos de consumo creados', segments_count;
  RAISE NOTICE '   - % registros historicos importados', history_count;
  RAISE NOTICE '   - % configuracion(es) de usuario establecida(s)', preferences_count;
  RAISE NOTICE '';
  RAISE NOTICE 'DATOS DEL BACKUP "Perfil Principal Aug 31 2025" IMPORTADOS';
END $$;