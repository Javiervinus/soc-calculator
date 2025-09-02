-- ====================================
-- SOC Calculator - Initial Schema Setup
-- ====================================
-- Migraci�n inicial para crear todas las tablas del sistema
-- Basado en database-schema.dbml v1.0

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- TABLAS DE CONVERSI�N VOLTAJE-SOC
-- ====================================

CREATE TABLE voltage_soc_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL, -- Ej: "LiFePO4 Standard", "Custom Calibrada"
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario para la tabla
COMMENT ON TABLE voltage_soc_tables IS 'Tabla maestra para grupos de puntos voltaje-SOC';

CREATE TABLE voltage_soc_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES voltage_soc_tables(id) ON DELETE CASCADE,
  voltage DECIMAL(4,2) NOT NULL,
  soc DECIMAL(4,1) NOT NULL, -- 0.0 - 100.0
  UNIQUE(table_id, voltage)
);

-- �ndices para voltage_soc_points
CREATE INDEX idx_voltage_soc_points_table_id ON voltage_soc_points(table_id);

-- Comentario para la tabla
COMMENT ON TABLE voltage_soc_points IS 'Puntos individuales de conversi�n voltaje->SOC';

-- ====================================
-- PERFILES DE SISTEMA DE BATER�A
-- ====================================

CREATE TABLE battery_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL, -- Ej: "Sistema Principal", "Bater�a Respaldo"
  
  -- Configuraci�n b�sica de bater�a
  chemistry VARCHAR DEFAULT 'LiFePO�', -- LiFePO�, AGM, Gel, etc.
  nominal_voltage DECIMAL(4,2) DEFAULT 12.8, -- Voltaje nominal del sistema
  battery_capacity_ah INTEGER NOT NULL DEFAULT 108,
  battery_capacity_wh INTEGER NOT NULL DEFAULT 1380,
  battery_capacity_kwh DECIMAL(4,2) DEFAULT 1.38, -- Capacidad en kWh
  
  -- Configuraci�n detallada de bater�as
  battery_configuration TEXT, -- Ej: "6 bater�as de 12.8V/18Ah en paralelo"
  number_of_batteries INTEGER DEFAULT 6,
  battery_capacity_each DECIMAL(6,2) DEFAULT 18, -- Capacidad de cada bater�a en Ah
  
  -- Rangos de operaci�n
  min_voltage DECIMAL(3,1) NOT NULL DEFAULT 10.0,
  max_voltage DECIMAL(3,1) NOT NULL DEFAULT 14.6,
  safety_reserve_percent INTEGER DEFAULT 20, -- 0-30%
  
  -- Consumo estimado
  daily_consumption_ah DECIMAL(6,2) DEFAULT 45, -- Consumo diario estimado en Ah
  
  -- Referencia a tabla de conversi�n
  voltage_soc_table_id UUID REFERENCES voltage_soc_tables(id),
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario para la tabla
COMMENT ON TABLE battery_profiles IS 'Cada perfil representa una configuraci�n completa de sistema de bater�a';

-- ====================================
-- CONFIGURACI�N DEL SISTEMA SOLAR
-- ====================================

CREATE TABLE solar_system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES battery_profiles(id) ON DELETE CASCADE,
  
  -- Configuraci�n de paneles
  solar_power_total INTEGER DEFAULT 720, -- Potencia total en watts
  number_of_panels INTEGER DEFAULT 12,
  panel_power_each DECIMAL(6,2) DEFAULT 60, -- Potencia de cada panel en watts
  panel_type VARCHAR DEFAULT 'Monocristalino', -- Monocristalino, Policristalino, etc.
  panel_configuration TEXT DEFAULT '12 paneles en paralelo', -- Descripci�n de la configuraci�n
  panel_voltage DECIMAL(4,2) DEFAULT 18, -- Voltaje nominal del panel
  panel_current DECIMAL(4,2) DEFAULT 3.2, -- Corriente nominal del panel
  
  -- Configuraci�n del controlador
  controller_type VARCHAR DEFAULT 'MPPT', -- MPPT o PWM
  controller_capacity INTEGER DEFAULT 30, -- Capacidad en amperios
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario para la tabla
COMMENT ON TABLE solar_system_config IS 'Configuraci�n detallada del sistema solar por perfil';

-- ====================================
-- PREFERENCIAS Y CONFIGURACI�N USUARIO
-- ====================================

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Perfil activo del sistema
  active_battery_profile_id UUID REFERENCES battery_profiles(id),
  
  -- Voltaje actual del sistema
  current_voltage DECIMAL(4,2) DEFAULT 13.2, -- �ltimo voltaje medido
  
  -- Preferencias de UI
  theme VARCHAR DEFAULT 'light', -- light | dark
  app_theme VARCHAR DEFAULT 'default', -- default | futuristic | minimal | retro | hippie
  
  -- Configuraci�n regional
  timezone VARCHAR DEFAULT 'America/Guayaquil', -- Zona horaria para todos los c�lculos
  
  -- Par�metros para predicciones solares
  prediction_efficiency DECIMAL(3,2) DEFAULT 0.75,
  prediction_tilt_angle INTEGER DEFAULT 10,
  prediction_azimuth INTEGER DEFAULT 0,
  prediction_temperature_coefficient DECIMAL(4,3) DEFAULT -0.004,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario para la tabla
COMMENT ON TABLE user_preferences IS 'Configuraci�n global del usuario. En futuro ser� por user_id';

-- ====================================
-- MEDICIONES Y REGISTROS
-- ====================================

CREATE TABLE voltage_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES battery_profiles(id) ON DELETE CASCADE,
  
  voltage DECIMAL(4,2) NOT NULL,
  calculated_soc INTEGER, -- SOC calculado en el momento
  
  -- Metadata de contexto
  is_manual_entry BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() -- Timestamp exacto de la lectura
);

-- �ndices para voltage_readings
CREATE INDEX idx_readings_profile_time ON voltage_readings(profile_id, created_at);

-- Comentario para la tabla
COMMENT ON TABLE voltage_readings IS 'Todas las lecturas de voltaje, m�ltiples por d�a';

CREATE TABLE daily_soc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES battery_profiles(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  soc INTEGER NOT NULL, -- SOC al momento del guardado (t�picamente 5-6pm)
  voltage DECIMAL(4,2), -- Voltaje al momento del guardado
  
  -- Estad�sticas del d�a (calculadas)
  max_soc INTEGER,
  min_soc INTEGER,
  max_voltage DECIMAL(4,2),
  min_voltage DECIMAL(4,2),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(profile_id, date)
);

-- �ndices para daily_soc_records
CREATE INDEX idx_daily_profile_date ON daily_soc_records(profile_id, date);

-- Comentario para la tabla
COMMENT ON TABLE daily_soc_records IS 'Un registro por d�a cuando el usuario presiona "Guardar"';

-- ====================================
-- CONFIGURACI�N DE CONSUMO
-- ====================================

CREATE TABLE consumption_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES battery_profiles(id) ON DELETE CASCADE,
  
  -- Identificaci�n
  segment_id VARCHAR NOT NULL, -- ID personalizable: "A", "B", "custom-123456"
  name VARCHAR NOT NULL, -- Ej: "Luces", "TV", "Ventilador"
  period_label VARCHAR, -- Ej: "17:00-19:00"
  
  -- Horario (hora local Ecuador)
  start_hour INTEGER NOT NULL, -- 0-23
  end_hour INTEGER NOT NULL, -- 0-24, 24 significa medianoche del d�a siguiente
  
  -- Consumo
  watts DECIMAL(6,2) NOT NULL,
  hours DECIMAL(3,1) NOT NULL, -- Calculado: end-start o cruza medianoche
  wh DECIMAL(8,2) NOT NULL, -- Calculado: watts * hours
  ah DECIMAL(6,2) NOT NULL, -- Calculado: wh / 12.8
  
  -- UI
  color VARCHAR DEFAULT 'bg-blue-500', -- Clase de Tailwind para color en UI
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(profile_id, segment_id)
);

-- �ndices para consumption_segments
CREATE INDEX idx_consumption_segments_profile ON consumption_segments(profile_id);
CREATE INDEX idx_consumption_segments_profile_start_hour ON consumption_segments(profile_id, start_hour);

-- Comentario para la tabla
COMMENT ON TABLE consumption_segments IS 'Tramos de consumo configurables para proyecci�n nocturna';

-- ====================================
-- CACHE DE PREDICCIONES SOLARES
-- ====================================

CREATE TABLE solar_predictions_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ubicaci�n y fecha
  prediction_date DATE NOT NULL,
  latitude DECIMAL(10,7) DEFAULT -2.1894,
  longitude DECIMAL(10,7) DEFAULT -79.8891,
  
  -- Datos de la API (JSONB para flexibilidad)
  weather_data JSONB NOT NULL, -- Respuesta completa de Open-Meteo
  
  -- C�lculos derivados (para queries r�pidos)
  total_ghi_wh_m2 DECIMAL(8,2),
  total_dni_wh_m2 DECIMAL(8,2),
  total_dhi_wh_m2 DECIMAL(8,2),
  effective_psh DECIMAL(4,2),
  estimated_ah DECIMAL(6,2),
  estimated_wh DECIMAL(8,2),
  cloud_cover_avg DECIMAL(5,2),
  temperature_avg DECIMAL(4,1),
  
  -- Control de cache
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(prediction_date, latitude, longitude)
);

-- �ndices para solar_predictions_cache
CREATE INDEX idx_solar_predictions_expires_at ON solar_predictions_cache(expires_at);

-- Comentario para la tabla
COMMENT ON TABLE solar_predictions_cache IS 'Cache de predicciones meteorol�gicas para c�lculo solar';

-- ====================================
-- AUDITOR�A Y LOGS (Futuro)
-- ====================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  action VARCHAR NOT NULL, -- voltage_reading, daily_save, config_change, etc
  entity_type VARCHAR, -- battery_profiles, consumption_segments, etc
  entity_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  
  metadata JSONB, -- IP, user agent, etc
  created_at TIMESTAMPTZ DEFAULT now()
);

-- �ndices para activity_logs
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Comentario para la tabla
COMMENT ON TABLE activity_logs IS 'Para tracking de cambios y debugging';

-- ====================================
-- NOTIFICACIONES (Futuro PWA)
-- ====================================

CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipos de notificaci�n
  missing_daily_reading BOOLEAN DEFAULT true,
  low_solar_prediction BOOLEAN DEFAULT true,
  consumption_anomaly BOOLEAN DEFAULT true,
  
  -- Horarios
  daily_summary_time TIME DEFAULT '19:00',
  morning_reminder_time TIME DEFAULT '08:00',
  
  -- Push notification tokens
  push_tokens JSONB DEFAULT '[]', -- Array de tokens FCM
  
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentario para la tabla
COMMENT ON TABLE notification_settings IS 'Configuraci�n para futuras notificaciones push';

-- ====================================
-- TRIGGERS PARA updated_at
-- ====================================

-- Funci�n para actualizar updated_at autom�ticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a las tablas que tienen updated_at
CREATE TRIGGER update_battery_profiles_updated_at BEFORE UPDATE ON battery_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_solar_system_config_updated_at BEFORE UPDATE ON solar_system_config FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_consumption_segments_updated_at BEFORE UPDATE ON consumption_segments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ====================================
-- VERIFICACIONES FINALES
-- ====================================

-- Verificar que las tablas fueron creadas
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN (
    'user_preferences', 'battery_profiles', 'solar_system_config',
    'voltage_soc_tables', 'voltage_soc_points', 'voltage_readings',
    'daily_soc_records', 'consumption_segments', 'solar_predictions_cache',
    'activity_logs', 'notification_settings'
  )) = 11, 'No todas las tablas fueron creadas correctamente';
  
  RAISE NOTICE 'Migraci�n inicial completada exitosamente. Todas las tablas creadas.';
END $$;