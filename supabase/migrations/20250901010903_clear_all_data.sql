-- ====================================
-- SOC Calculator - Clear All Data
-- ====================================
-- Migracion para eliminar todos los registros de todas las tablas
-- Mantiene la estructura de las tablas pero borra todos los datos

-- ====================================
-- ELIMINAR TODOS LOS DATOS
-- ====================================

-- Eliminar datos en orden correcto para respetar foreign keys
-- 1. Tablas dependientes primero
DELETE FROM user_preferences;
DELETE FROM daily_soc_records;
DELETE FROM consumption_segments;
DELETE FROM solar_system_config;
DELETE FROM voltage_readings;

-- 2. Tablas principales
DELETE FROM battery_profiles;
DELETE FROM voltage_soc_points;
DELETE FROM voltage_soc_tables;

-- 3. Tablas de cache y logs
DELETE FROM solar_predictions_cache;
DELETE FROM activity_logs;
DELETE FROM notification_settings;

-- ====================================
-- VERIFICACION FINAL
-- ====================================

-- Verificar que todas las tablas estan vacias
DO $$
DECLARE
  table_counts TEXT;
BEGIN
  -- Mostrar el conteo de registros en cada tabla
  RAISE NOTICE 'Verificando que todas las tablas esten vacias:';
  RAISE NOTICE '  - user_preferences: % registros', (SELECT COUNT(*) FROM user_preferences);
  RAISE NOTICE '  - battery_profiles: % registros', (SELECT COUNT(*) FROM battery_profiles);
  RAISE NOTICE '  - solar_system_config: % registros', (SELECT COUNT(*) FROM solar_system_config);
  RAISE NOTICE '  - voltage_soc_tables: % registros', (SELECT COUNT(*) FROM voltage_soc_tables);
  RAISE NOTICE '  - voltage_soc_points: % registros', (SELECT COUNT(*) FROM voltage_soc_points);
  RAISE NOTICE '  - voltage_readings: % registros', (SELECT COUNT(*) FROM voltage_readings);
  RAISE NOTICE '  - daily_soc_records: % registros', (SELECT COUNT(*) FROM daily_soc_records);
  RAISE NOTICE '  - consumption_segments: % registros', (SELECT COUNT(*) FROM consumption_segments);
  RAISE NOTICE '  - solar_predictions_cache: % registros', (SELECT COUNT(*) FROM solar_predictions_cache);
  RAISE NOTICE '  - activity_logs: % registros', (SELECT COUNT(*) FROM activity_logs);
  RAISE NOTICE '  - notification_settings: % registros', (SELECT COUNT(*) FROM notification_settings);
  RAISE NOTICE '';
  RAISE NOTICE 'TODAS LAS TABLAS HAN SIDO LIMPIADAS EXITOSAMENTE';
END $$;